

export enum AnimateType {
    FOOT = 'foot',
}

export enum AnimatePlayType {
    FADE_OUT = 'fade_out',
}

export interface IAnimateInfo {
    type: AnimatePlayType;
    duration: number;
    position: number[];
    rotation?: number[];
}