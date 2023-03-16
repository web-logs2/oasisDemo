
import { animate, easeOut } from 'popmotion';
import { Entity, SpriteRenderer } from "oasis-engine";
import { AnimatePlayType, IAnimateInfo } from "./interface";

export function fadeOut(entity: Entity, info: IAnimateInfo, callback?: () => void) {
    const { duration } = info;
    animate({
        from: { a: 1 },
        to: { a: 0 },
        duration,
        ease: easeOut,
        onUpdate: (obj) => {
            const meshRenderer = entity.getComponent(SpriteRenderer);
            meshRenderer.color.a = obj.a;
        },
        onComplete: () => {
            callback && callback();
        }
    })
}

export function floatUp(entity: Entity, info: IAnimateInfo, callback?: () => void) {
    const { duration, position = [0, 0, 0], target = [0, 1, 0] } = info;
    animate({
        from: { y: position[1] },
        to: { y: target[1] },
        duration,
        ease: easeOut,
        onUpdate: (obj) => {
            entity.transform.position.y = obj.y;
        },
        onComplete: () => {
            callback && callback();
        }
    })
}

export function floatDown(entity: Entity, info: IAnimateInfo, callback?: () => void) {
    const { duration, position = [0, 1, 0], target = [0, 0, 0] } = info;
    animate({
        from: { y: position[1] },
        to: { y: target[1] },
        duration,
        ease: easeOut,
        onUpdate: (obj) => {
            entity.transform.position.y = obj.y;
        },
        onComplete: () => {
            callback && callback();
        }
    })
}

export const AnimateEvents = {
    [AnimatePlayType.FADE_OUT]: fadeOut,
    [AnimatePlayType.FLOAT_UP]: floatUp,
    [AnimatePlayType.FLOAT_DOWN]: floatDown,
}