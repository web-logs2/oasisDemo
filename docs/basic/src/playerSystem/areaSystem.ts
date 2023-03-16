import MapSystem, { IGrid } from "../map/index";

export default class AreaSystem {
    private radius: number;
    private mapSystem: MapSystem;
    private cacheAreaGrids: (IGrid | undefined)[] = [];

    constructor(radius: number, mapSystem: MapSystem) {
        this.radius = radius;
        this.mapSystem = mapSystem;
    }

    setXZ(x: number, z: number) {
        const [ gridX, gridZ ] = this.mapSystem.xz2Grid(x, z);
        this.update(gridX, gridZ);
    }

    updateGrids(grids: (IGrid| undefined)[]) {

    }

    update(gridX: number, gridZ: number, callback = (enterGrids, leaveGrids) => {}) {
        const grids = this.mapSystem.getAroundGrids(gridX, gridZ, this.radius);
        // TODO: 算法待优化
        const enterGrids: IGrid[] = [];
        const leaveGrids: IGrid[] = [];
        grids.forEach(grid => {
            if(MapSystem.isGrid(grid) && this.cacheAreaGrids.indexOf(grid as IGrid) === -1) {
                // 是 grid 且不再原有的 player 范围内
                // 在 player 范围内新增了一个 grid
                enterGrids.push(grid as IGrid);
            }
        })
        this.cacheAreaGrids.forEach(cacheGrid => {
            if(MapSystem.isGrid(cacheGrid) && grids.indexOf(cacheGrid) === -1) {
                // 是 grid 且不再新的 player 范围内
                leaveGrids.push(cacheGrid as IGrid);
            }
        })
        this.cacheAreaGrids = grids;
        callback(enterGrids, leaveGrids);
    }
}