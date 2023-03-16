import { Entity, WebGLEngine } from "oasis-engine";
import ResourceSystem from "../resourceSystem";

import Foot from './foot';
import { AnimateType, AnimatePlayType, IAnimateInfo } from './interface';

const animates = {
    [AnimateType.FOOT]: Foot,
}

export default class AnimateSystem {
    private resourceSystem: ResourceSystem;
    private engine: WebGLEngine;
    private rootEntity: Entity;
    private animatePool: Map<AnimateType, any> = new Map();

    constructor(resourceSystem: ResourceSystem, engine: WebGLEngine, rootEntity: Entity) {
        this.resourceSystem = resourceSystem;
        this.engine = engine;
        this.rootEntity = rootEntity;
    }

    play(animate: AnimateType, info: IAnimateInfo) {
        let animateInstance: any;
        if(!this.animatePool.has(animate)) {
            const AnimateClass = animates[animate];
            animateInstance = new AnimateClass(this.resourceSystem, this.engine, this.rootEntity);
            this.animatePool.set(animate, animateInstance);
        } else {
            animateInstance = this.animatePool.get(animate);
        }
        animateInstance.play(info);
    }
}