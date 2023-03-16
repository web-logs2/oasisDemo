
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

export const AnimateEvents = {
    [AnimatePlayType.FADE_OUT]: fadeOut
}