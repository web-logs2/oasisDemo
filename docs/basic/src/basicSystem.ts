import { Entity, WebGLEngine } from "oasis-engine";
import AnimateSystem from "./animateSystem";
import ResourceSystem from "./resourceSystem";

export default class BasicSystem {
    animateSystem: AnimateSystem;
    resourceSystem: ResourceSystem;
    constructor(engine: WebGLEngine, rootEntity: Entity) {
        this.resourceSystem = new ResourceSystem(engine);
        this.animateSystem = new AnimateSystem(this.resourceSystem, engine, rootEntity);
    }
}