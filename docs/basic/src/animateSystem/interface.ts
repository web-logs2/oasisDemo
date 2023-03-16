import { Entity } from "oasis-engine";

// 指定动画的类型
export enum AnimateType {
    FOOT = 'foot',
    FLOAT_UP = 'float_up',
    FLOAT_DOWN = 'float_down',
}

// 指定具体的动画方法
export enum AnimatePlayType {
    FADE_OUT = 'fade_out',
    FLOAT_UP = 'float_up',
    FLOAT_DOWN = 'float_down',
}

export interface IAnimateInfo {
    type: AnimatePlayType;
    loop?: boolean;
    entity?: Entity;
    duration: number;
    position?: number[];
    rotation?: number[];
    target?: number[];
}