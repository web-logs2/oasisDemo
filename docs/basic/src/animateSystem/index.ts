import { Entity, WebGLEngine } from "oasis-engine";
import ResourceSystem from "../resourceSystem";

import Foot from './foot';
import FloatUP from "./floatUp";
import FloatDOWN from "./floatDown";
import { AnimateType, AnimatePlayType, IAnimateInfo } from './interface';

const animates = {
    [AnimateType.FOOT]: Foot,
    [AnimateType.FLOAT_UP]: FloatUP,
    [AnimateType.FLOAT_DOWN]: FloatDOWN,
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
        // TODO loop animation 需要持久化 长期存在
        if(info.loop) {
            console.log('loop');
        }

        // TODO 在对同一个 entity 进行动画时，需要先停止之前的动画
        animateInstance.play(info);
    }
}