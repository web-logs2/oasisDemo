import { Entity, WebGLEngine } from 'oasis-engine';

enum GridType {
    GRASS = 'grass',
    WATER = 'water',
    FOREST = 'forest',
    SAND = 'sand',
    GROUND = 'ground',
}
enum CoverType {
    FILL = 'fill', // 填充物（作物、建筑、桌、椅等）
    MAP = 'map', // 非填充物（掉落物 种子、金币等）
    HOVER = 'hover', // 鼠标悬浮
}
interface CoverItem {
    entity: Entity;
    coverType: CoverType;
    gridX: number; // grid x坐标 grid 坐标表示网格的位置，坐标值为整数，取左上角的位置表示网格
    gridZ: number; // grid Z坐标
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
    bounds: number[]; // 添加实体需要占据的区域，从 gridX, gridZ 开始，往 x，z 正方向占据的区域大小
}
interface IGrid {
    id: string; // x.z.y
    type: GridType;
    fill: Entity | undefined;   // 当前的网格是否被占据
    map: Entity | undefined;    // 当前网格的贴图 田地、瓷砖、特殊的贴图等等
    cover: CoverItem[] | undefined; // 当前网格上的覆盖物, include => fill + map（填充物（作物、建筑、桌、椅等） + 非填充物（掉落物 种子、金币等））
}

const GRID_SIZE = 1; // 网格大小

import { addColliderCubes, initPlane, mockGrids } from './helper'

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
    private cache: Map<string, IGrid> = new Map();

    private collisionCubes: {[key: number]: Entity} = {};
    
    constructor(engine: WebGLEngine) {
        this.mapRoot = new Entity(engine, 'mapRoot');
        this.collisionCubes = addColliderCubes(engine, this.mapRoot);

        // mock map data
        mockGrids.forEach(gridData => {
            // set cache map
            this.cache.set(gridData.id, gridData as IGrid);
            
            const [gridX, gridY] = this.key2GridXZ(gridData.id);
            const xz = this.gridXZ2xz(gridX, gridY);         
            const plane =  initPlane(engine, 0.8, 0.8, gridData.type)
            plane.transform.position.set(xz[0], 0.01, xz[1]);
            this.mapRoot.addChild(plane);
        })
    }

    addToMap(object: Entity, coverType: CoverType = CoverType.FILL) {
        const { x, y, z } = object.transform.position;
        const [ gridX, gridZ ] = this.xz2Grid(x, z);
        const id = this.gridXZ2Key(gridX, gridZ);
        const grid = this.cache.get(id) as IGrid;
        if(!grid) {
            return false;
        }
        if(coverType === CoverType.FILL) {
            grid.fill = object;
        }
        if(coverType === CoverType.MAP) {
            grid.map = object;
        }
        if(!grid.cover) {
            grid.cover = []
        }
        const coverItem = {
            entity: object,
            coverType: CoverType.FILL,
            gridX,
            gridZ,
            bounds: [1, 1],
        }
        grid.cover.push(coverItem);
        this.mapRoot.addChild(object);
    }

    // 根据 mapSystem 动态设置围栏（cube），限制玩家移动
    updateCollisionCubes(gridX: number, gridZ: number) {
        const grids = this.getNineGrids(gridX, gridZ);
        grids.forEach((grid, index) => {
            // 1 2 3
            // 4 5 6
            // 7 8 9
            if(!grid && this.collisionCubes[index + 1]) {
                const dir = index + 1;
                const [nearGridX, nearGrixZ] = this.getGridNear(gridX, gridZ, dir);
                const [x, y] = this.gridXZ2xz(nearGridX, nearGrixZ);
                const box = this.collisionCubes[dir];
                box.transform.setPosition(x, 0.5, y);
            };
        });
        
    }

    gridUpdate(grid: IGrid) {
        const { id, type, fill, map } = grid;
        this.cache.set(id, grid);
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

    getGridNear(gridX: number, gridZ: number, dir: number) {
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
        const [ gridX, gridZ ] = this.xz2Grid(x, z);
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
                const key = this.gridXZ2Key(offsetX, offsetZ);
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
        const [ gridX, gridZ ] = this.xz2Grid(x, z);
        return this.gridXZ2xz(gridX, gridZ);
    }

    /**
     * 将网格坐标转换为 x, z 坐标
     * @param gridX 
     * @param gridZ 
     * @returns 
     */
    gridXZ2xz(gridX: number, gridZ: number) {
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
    xz2Grid(x: number, z: number) {
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
    gridXZ2Key(gridX: number, gridZ: number) {
        return `${gridX}.${gridZ}`;
    }

    /**
     * 将 Key 转换为网格坐标
     * @param key 
     * @returns 
     */
    key2GridXZ(key: string) {
        const [gridX, gridZ] = key.split('.');
        return [Number(gridX), Number(gridZ)];
    }
}