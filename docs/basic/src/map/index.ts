import { Entity, WebGLEngine } from 'oasis-engine';
import { GridType, CoverType, CoverItem, IGrid } from './interface';
import { addColliderCubes, initPlane } from './helper'

const GRID_SIZE = 1; // 网格大小

/**
 * 地图系统 在 x-z 平面上，以网格为单位，管理地图上的实体
 * x 轴正方向为右
 * z 轴正方向为垂直屏幕向外，在二维数值上垂直向下
 * (0, 0) --------> X > 0
 * ｜
 * ｜
 * ｜
 * ｜
 * v
 * Z > 0
 */
export default class MapSystem {
    public mapRoot: Entity;
    public grids: IGrid[] = [];

    private engine: WebGLEngine;
    private cache: Map<string, IGrid> = new Map();
    private collisionCubes: {[key: number]: Entity} = {};
    
    constructor(engine: WebGLEngine, grids: IGrid[] = []) {
        this.mapRoot = new Entity(engine, 'mapRoot');
        this.engine = engine;
        this.grids = grids;
        this.collisionCubes = addColliderCubes(engine, this.mapRoot);

        this.loadMap(grids as IGrid[]);
    }

    static isGrid(grid: any) {
        return !!(grid && grid.id);
    }

    static isEqual(grid1: any, grid2: any) {
        // grid undefined / undefined grid
        if(MapSystem.isGrid(grid1) !== MapSystem.isGrid(grid2)) return false;
        // grid grid
        return grid1.id === grid2.id;
    }

    // 加载一个地图
    public loadMap(grids: IGrid[], debug = true) {
        // TODO 待增加 地图更新的逻辑
        grids.forEach(gridData => {
            // set cache map
            this.cache.set(gridData.id, gridData as IGrid);

            if(debug) {
                const [gridX, gridY] = MapSystem.key2GridXZ(gridData.id);
                const xz = MapSystem.gridXZ2xz(gridX, gridY);         
                const plane =  initPlane(this.engine, 0.8, 0.8, gridData.type)
                plane.transform.position.set(xz[0], 0.01, xz[1]);
                this.mapRoot.addChild(plane);
            }
        });
    }

    addToMap(object: Entity, options: Partial<CoverItem> = { coverType: CoverType.FILL }) {
        const { x, y, z } = object.transform.position;
        const [ gridX, gridZ ] = MapSystem.xz2Grid(x, z); // 获取网格坐标（序号）
        const id = MapSystem.gridXZ2Key(gridX, gridZ);
        const grid = this.cache.get(id) as IGrid;
        if(!grid) {
            return false;
        }
        
        
        const { coverType = CoverType.FILL, animate, position } = options; // , gridX, gridZ

        if(coverType === CoverType.FILL && grid.fill) {
            return false;
        }

        const entity = this.engine.createEntity('grid');
        entity.transform.position.set(x, 0, z); // 网格中心位置
        

        const [centerX, centerZ] = MapSystem.gridXZ2xz(gridX, gridZ); // 网格中心的 x, z 笛卡尔坐标
        const [offsetX, offsetZ] = [x - centerX, z - centerZ]; // 网格中心到 object 的偏移量


        this.mapRoot.addChild(entity);
        object.transform.position.set(offsetX, y, offsetZ); // 将 object 移动到网格中心（局部坐标系）
        entity.addChild(object);

        
        const coverItem = {
            entity: object,
            coverType,
            gridX,
            gridZ,
            bounds: [1, 1],
            position: position ? position : [offsetX, y, offsetZ], // options 中的位置优先， 局部坐标系
            animate,
        } as CoverItem;

        switch(coverType) {
            case CoverType.FILL:
                grid.fill = coverItem;
                break;
        }

        
    }

    // 根据 mapSystem 动态设置围栏（cube），限制玩家移动
    updateCollisionCubes(grids: (IGrid | undefined)[], gridX: number, gridZ: number) {
        grids.forEach((grid, index) => {
            // 1 2 3
            // 4 5 6
            // 7 8 9
            if(!grid && this.collisionCubes[index + 1]) {
                const dir = index + 1;
                const [nearGridX, nearGrixZ] = this.getGridOffset(gridX, gridZ, dir);
                const [x, y] = MapSystem.gridXZ2xz(nearGridX, nearGrixZ);
                const box = this.collisionCubes[dir];
                // 暂时不考虑碰撞体的高度
                box.transform.setPosition(x, 0.5, y);
            };
        });
        
    }

    gridUpdate(grid: IGrid) {
        const { id, type, fill, map } = grid;
        this.cache.set(id, grid);
    }

    getAroundGrids(gridX: number, gridZ: number, radius: number) {
        // TODO: 待优化
        return this.getNineGrids(gridX, gridZ);
    }

    /**
     * 获取 gridX/gridZ 位置周围 3 * 3 的网格
     * @param gridX 
     * @param gridZ 
     * @returns 
     */
    getNineGrids(gridX: number, gridZ: number) {
        const grid1 = this.cache.get(`${gridX - 1}.${gridZ - 1}`);
        const grid2 = this.cache.get(`${gridX}.${gridZ - 1}`);
        const grid3 = this.cache.get(`${gridX + 1}.${gridZ - 1}`);
        const grid4 = this.cache.get(`${gridX - 1}.${gridZ}`);
        const grid5 = this.cache.get(`${gridX}.${gridZ}`);
        const grid6 = this.cache.get(`${gridX + 1}.${gridZ}`);
        const grid7 = this.cache.get(`${gridX - 1}.${gridZ + 1}`);
        const grid8 = this.cache.get(`${gridX}.${gridZ + 1}`);
        const grid9 = this.cache.get(`${gridX + 1}.${gridZ + 1}`);
        return [
            grid1, grid2, grid3,
            grid4, grid5, grid6,
            grid7, grid8, grid9,
        ];
    }

    getGridOffset(gridX: number, gridZ: number, dir: number) {
        switch(dir) {
            case 1:
                return [gridX - 1, gridZ - 1];
            case 2:
                return [gridX, gridZ - 1];
            case 3:
                return [gridX + 1, gridZ - 1];
            case 4:
                return [gridX - 1, gridZ];
            case 6:
                return [gridX + 1, gridZ];
            case 7:
                return [gridX - 1, gridZ + 1];
            case 8:
                return [gridX, gridZ + 1];
            case 9:
                return [gridX + 1, gridZ + 1];
            default:
                return [gridX, gridZ];
        }
    }

    getForwardGrid(gridX: number, gridZ: number, forward: number) {
        /**
         * 1 2 3
         * 4 5 6
         * 7 8 9
         */
        let forwardGridX;
        let forwardGridZ;
        let grid;
        switch(forward) {
            case 1:
                forwardGridX = gridX - 1;
                forwardGridZ = gridZ - 1;
                grid = this.cache.get(`${gridX - 1}.${gridZ - 1}`);
                break;
            case 2:
                forwardGridX = gridX;
                forwardGridZ = gridZ - 1;
                grid = this.cache.get(`${gridX}.${gridZ - 1}`);
                break;
            case 3:
                forwardGridX = gridX + 1;
                forwardGridZ = gridZ - 1;
                grid = this.cache.get(`${gridX + 1}.${gridZ - 1}`);
                break;
            case 4:
                forwardGridX = gridX - 1;
                forwardGridZ = gridZ;
                grid = this.cache.get(`${gridX - 1}.${gridZ}`);
                break;
            case 6:
                forwardGridX = gridX + 1;
                forwardGridZ = gridZ;
                grid = this.cache.get(`${gridX + 1}.${gridZ}`);
                break;
            case 7:
                forwardGridX = gridX - 1;
                forwardGridZ = gridZ + 1;
                grid = this.cache.get(`${gridX - 1}.${gridZ + 1}`);
                break;
            case 8:
                forwardGridX = gridX;
                forwardGridZ = gridZ + 1;
                grid = this.cache.get(`${gridX}.${gridZ + 1}`);
                break;
            case 9:
                forwardGridX = gridX + 1;
                forwardGridZ = gridZ + 1;
                grid = this.cache.get(`${gridX + 1}.${gridZ + 1}`);
                break;
        }
        return {
            gridX: forwardGridX,
            gridZ: forwardGridZ,
            grid,
        }
    }

    /**
     * 检测在 xz 位置，是否能添加 bounds 大小的覆盖物
     * @param xz 
     * @param bounds 
     */
    coverTest(xz: number[], bounds: number[]) {
        const [x, z] = xz;
        const [ gridX, gridZ ] = MapSystem.xz2Grid(x, z);
        const keys = this.getCoverGridKeys(gridX, gridZ, bounds);
        keys.forEach(({key}) => {
            const grid = this.cache.get(key);
            if(!grid || grid.fill) {
                // grid 不存在的情况下，认为不能添加（未指定的区域）
                // grid 存在，但是被占据的情况下，认为不能添加
                return true;
            }
        });
        return false;
    }

    /**
     * 获取覆盖物占据的网格
     * @param gridX 
     * @param gridZ 
     * @param bounds 
     * @returns 
     */
    getCoverGridKeys(gridX: number, gridZ: number, bounds: number[]) {
        const gridKeys: {
            key: string;
            gridX: number;
            gridZ: number;
        }[] = [];
        const [x, z] = bounds;
        // 填充物至少占据一个网格
        const width = Math.max(1, x);
        const height = Math.max(1, z);
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                const offsetX = gridX + i;
                const offsetZ = gridZ + j;
                const key = MapSystem.gridXZ2Key(offsetX, offsetZ);
                gridKeys.push({
                    key,
                    gridX: gridX + i,
                    gridZ: gridZ + j
                });
            }
        }
        return gridKeys;
    }

    formatXZ(x: number, z: number) {
        const [ gridX, gridZ ] = MapSystem.xz2Grid(x, z);
        return MapSystem.gridXZ2xz(gridX, gridZ);
    }

    /**
     * 将网格坐标转换为 x, z 坐标
     * @param gridX 
     * @param gridZ 
     * @returns 
     */
    static gridXZ2xz(gridX: number, gridZ: number) {
        const x = gridX * GRID_SIZE + GRID_SIZE / 2;
        const z = gridZ * GRID_SIZE + GRID_SIZE / 2;
        return [x, z];
    }

    /**
     * 将 x, z 坐标转换为网格坐标
     * @param x 
     * @param z 
     * @returns 
     */
    static xz2Grid(x: number, z: number) {
        /**
        * (0, 0) --------> X > 0
        * ｜
        * ｜
        * ｜
        * ｜
        * v
        * Z > 0
        */
        /**
         * (-1, -1)---(0, -1)----(1, -1)
         * ｜           ｜          ｜
         * ｜ (-1, -1)  ｜  (0, -1) ｜
         * ｜           ｜          ｜
         * (-1, 0)---(0, 0)------(1, 0) X ->
         * ｜           ｜          ｜
         * ｜  (-1, 0)  ｜  (0, 0)  ｜
         * ｜           ｜          ｜
         * (-1, 1)---(0, 1)----(1, 1)
         *              |
         *              v
         *              Z
         */
        const gridX = Math.floor(x / GRID_SIZE);
        const gridZ = Math.floor(z / GRID_SIZE);
        return [gridX, gridZ];
    }

    /**
     * 将网格坐标转换为 Key
     * @param gridX 
     * @param gridZ 
     * @returns 
     */
    static gridXZ2Key(gridX: number, gridZ: number) {
        return `${gridX}.${gridZ}`;
    }

    /**
     * 将 Key 转换为网格坐标
     * @param key 
     * @returns 
     */
    static key2GridXZ(key: string) {
        const [gridX, gridZ] = key.split('.');
        return [Number(gridX), Number(gridZ)];
    }
}