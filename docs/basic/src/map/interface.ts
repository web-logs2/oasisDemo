import { Entity } from 'oasis-engine';

export enum GridType {
    GRASS = 'grass',
    WATER = 'water',
    FOREST = 'forest',
    SAND = 'sand',
    GROUND = 'ground',
    ROCK = 'rock',
}
export enum CoverType {
    FILL = 'fill', // 填充物（作物、建筑、桌、椅等）
    MAP = 'map', // 非填充物（掉落物 种子、金币等）
    HOVER = 'hover', // 鼠标悬浮
}
export interface CoverItem {
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
    position?: number[];
    animate?: ICoverItemAnimate;
}

export interface ICoverItemAnimate {

}

export interface IGrid {
    id: string; // x.z.y
    type: GridType;
    fill: CoverItem | undefined;   // 当前的网格是否被占据
    map: CoverItem | undefined;    // 当前网格的贴图 田地、瓷砖、特殊的贴图等等
    hover: CoverItem[] | undefined; // 当前网格上的悬浮物
    height?: number; // 当前网格的高度
}