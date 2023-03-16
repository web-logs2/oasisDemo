import {
    Color,
    DirectLight,
    Entity,
    Vector3,
    WebGLEngine,
    ShadowType,
 } from 'oasis-engine';
import Object3D from './Object3D';

export default class SunLight extends Object3D{
    constructor(engine: WebGLEngine, shadowType: ShadowType = ShadowType.None, shadowStrength: number = 1.0) {
        super();
        this.entity = new Entity(engine, "sun_light");

        let directLight = this.entity.addComponent(DirectLight);
        directLight.color = new Color(1.0, 1.0, 1.0);
        directLight.intensity = 0.5;

        directLight.shadowType = shadowType;
        directLight.shadowStrength = shadowStrength;
        

        this.entity.transform.rotation = new Vector3(45, 45, 45);
    }
}