import {
    MeshRenderer,
    PrimitiveMesh,
    Entity,
    WebGLEngine,
    UnlitMaterial,
} from 'oasis-engine';
import Object3D from "./Object3D";

export default class AxisHelper extends Object3D {
    public xAxisEntity: Entity;
    public yAxisEntity: Entity;
    public zAxisEntity: Entity;

    constructor(engine: WebGLEngine, length: number = 10, radius: number = 0.015) {
        super();
        this.entity = new Entity(engine, "AxisHelper");
        const radiusTop = radius;
        const radiusBottom = radius;
        const height = length;
        const radialSegments = 8;
        const heightSegments = 1;

        this.xAxisEntity = new Entity(engine, "xAxis");
        this.xAxisEntity.transform.setPosition(length / 2, 0, 0);
        this.xAxisEntity.transform.rotate(0, 0, 90);

        const xAxisMaterial = new UnlitMaterial(engine);
        xAxisMaterial.baseColor.set(1, 0, 0, 1);
        const xAxisRender = this.xAxisEntity.addComponent(MeshRenderer);
        xAxisRender.castShadows = false;
        xAxisRender.receiveShadows = false;
        xAxisRender.mesh = PrimitiveMesh.createCylinder(engine, radiusTop, radiusBottom, height, radialSegments, heightSegments);
        xAxisRender.setMaterial(xAxisMaterial);
        this.entity.addChild(this.xAxisEntity);


        this.yAxisEntity = new Entity(engine, "yAxis");
        this.yAxisEntity.transform.setPosition(0, length / 2, 0);
        const yAxisMaterial = xAxisMaterial.clone();
        yAxisMaterial.baseColor.set(0, 1, 0, 1);
        const yAxisRender = this.yAxisEntity.addComponent(MeshRenderer);
        yAxisRender.castShadows = false;
        yAxisRender.receiveShadows = false;
        yAxisRender.mesh = PrimitiveMesh.createCylinder(engine, radiusTop, radiusBottom, height, radialSegments, heightSegments);
        yAxisRender.setMaterial(yAxisMaterial);
        this.entity.addChild(this.yAxisEntity);
        
        this.zAxisEntity = new Entity(engine, "zAxis");
        this.zAxisEntity.transform.rotate(90, 0, 0);
        this.zAxisEntity.transform.setPosition(0, 0, length / 2);
        const zAxisMaterial = xAxisMaterial.clone();
        zAxisMaterial.baseColor.set(0, 0, 1, 1);
        const zAxisRender = this.zAxisEntity.addComponent(MeshRenderer);
        zAxisRender.castShadows = false;
        zAxisRender.receiveShadows = false;
        zAxisRender.mesh = PrimitiveMesh.createCylinder(engine, radiusTop, radiusBottom, height, radialSegments, heightSegments);
        zAxisRender.setMaterial(zAxisMaterial);
        this.entity.addChild(this.zAxisEntity);
    }
}