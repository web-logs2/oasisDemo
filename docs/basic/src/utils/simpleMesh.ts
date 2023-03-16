import { 
    AnimationClip,
    
    BlinnPhongMaterial,
    BoxColliderShape,
    Entity,
    MeshRenderer,
    PrimitiveMesh,
    WebGLEngine,
    GLTFResource,
    PBRMaterial,
    DirectLight,
    Camera,
    Vector3,
    StaticCollider,
    ShadowCascadesMode,
    ShadowType,
    Layer,
} from 'oasis-engine';

export class Mesh {
    engine: WebGLEngine;
    rootEntity: Entity;
    constructor(engine: WebGLEngine, rootEntity: Entity) {
        this.engine = engine;
        this.rootEntity = rootEntity;
    }

    public createColliderCube(x: number, y: number, z: number, padding = 0.8) {
        const cubeEntity = this.rootEntity.createChild("cube");
        const cubeRenderer = cubeEntity.addComponent(MeshRenderer);
        cubeRenderer.mesh = PrimitiveMesh.createCuboid(this.engine, x, y, z);
        const material = new BlinnPhongMaterial(this.engine);
        // material.isTransparent = true;
        // material.baseColor.set(1, 1, 1, 1);
        cubeRenderer.setMaterial(material);
        const boxCollider: StaticCollider = cubeEntity.addComponent(StaticCollider);
        const boxColliderShape = new BoxColliderShape();
        boxColliderShape.size.set(x + padding, y + padding, z + padding);
        boxCollider.addShape(boxColliderShape);
        
        return cubeEntity;
    }
}

export function cube(engine: WebGLEngine, rootEntity: Entity, x: number, y: number, z: number) {
    const cubeEntity = rootEntity.createChild("cube");
    const cubeRenderer = cubeEntity.addComponent(MeshRenderer);
    cubeRenderer.mesh = PrimitiveMesh.createCuboid(engine, x, y, z);
    const material = new BlinnPhongMaterial(engine);
    cubeRenderer.setMaterial(material);

    return cubeEntity;
}