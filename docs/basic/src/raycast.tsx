import React, { useEffect } from 'react';
import { 
    BlinnPhongMaterial,
    Entity,
    MeshRenderer,
    PrimitiveMesh,
    WebGLEngine,
    GLTFResource,
    Color,
    StaticCollider,
    BoxColliderShape,
} from 'oasis-engine';
import { LitePhysics, } from '@oasis-engine/physics-lite';
import AxisHelper from '../../components/AxisHelper'
import SunLight from '../../components/SunLight'
import Text from '../../components/Text'
import ProjectiveCamera from '../../components/ProjectiveCamera'
import RotateScript from '../../Scripts/rotate';
import Flow from '../../Scripts/flow';
import CameraRayCast from '../../Scripts/ray';
import GlTFCollider from '../../Scripts/gltfCollider';
import { UniformMaterial } from '../../components/interface';

function initBox(engine: WebGLEngine) {
    const cubeSize = 2;
    const box = new Entity(engine, 'box');
    box.addComponent(RotateScript);
    const cube = box.addComponent(MeshRenderer);
    cube.mesh = PrimitiveMesh.createCuboid(engine, cubeSize, cubeSize, cubeSize);
    const material = new BlinnPhongMaterial(engine);
    cube.setMaterial(material);

    // add collider
    const boxCollider: StaticCollider = box.addComponent(StaticCollider);
    const boxColliderShape = new BoxColliderShape();
    boxColliderShape.size.set(cubeSize, cubeSize, cubeSize);
    boxCollider.addShape(boxColliderShape);

    return box;
}

function setColor(entity: Entity, color: Color) {
    entity.getComponentsIncludeChildren(MeshRenderer, []).forEach(meshRenderer => meshRenderer.getInstanceMaterials());
    getMaterials(entity).forEach(material => {
        material.baseColor = color;
    });
}

function getMaterials(gltfEntity: Entity) {
    const materials: UniformMaterial[] = [];
    const meshRenderers = [];
    const renders = gltfEntity.getComponentsIncludeChildren(MeshRenderer, meshRenderers);
    renders.forEach(render => {
        const material = render.getMaterial() as UniformMaterial;
        if(material) {
            materials.push(material);
        }
    })
    return materials;
}

export default () => {
    useEffect(() => {
        const engine = new WebGLEngine("basicCubeCanvas");
        engine.canvas.resizeByClientSize();
        window.addEventListener('resize', () =>  engine.canvas.resizeByClientSize());

        engine.physicsManager.initialize(LitePhysics);

        const invCanvasWidth = 1 / engine.canvas.width;
        const invCanvasHeight = 1 / engine.canvas.height;
        // @ts-ignore
        const inputManager = engine.inputManager;

        const scene = engine.sceneManager.activeScene;
        scene.ambientLight.diffuseSolidColor.set(1, 1, 1, 1);
        scene.ambientLight.diffuseIntensity = 0.1;
        scene.background.solidColor.set(1, 1, 1, 1);
        const rootEntity = scene.createRootEntity("root");

        const axisHelper = new AxisHelper(engine);
        rootEntity.addChild(axisHelper.entity);

        const camera = new ProjectiveCamera(engine, 'camera',[0, 0, 15]);
        camera.entity.addComponent(CameraRayCast);
        rootEntity.addChild(camera.entity);

        const sun = new SunLight(engine);
        rootEntity.addChild(sun.entity);

        engine.resourceManager
        .load<GLTFResource>("https://gw.alipayobjects.com/os/OasisHub/267000040/9994/%25E5%25BD%2592%25E6%25A1%25A3.gltf")
        .then((gltf) => {
            const { defaultSceneRoot: duck1 } = gltf;
            
            duck1.transform.setPosition(-2, -1, 0);
            duck1.name = 'duck1';
            duck1.addComponent(Flow);
            duck1.addComponent(GlTFCollider);

            rootEntity.addChild(duck1);

            const duck2 = duck1.clone();
            duck2.name = 'duck2';
            setColor(duck2, new Color(1, 0, 0, 1))
            duck2.transform.setPosition(0, -1, 0);
            rootEntity.addChild(duck2);

            const duck3 = duck1.clone();
            duck3.name = 'duck3';
            setColor(duck3, new Color(0, 1, 0, 1))
            duck3.transform.setPosition(2, -1, 0);
            rootEntity.addChild(duck3);
           
            const text1 = new Text(engine, 'duck1');
            text1.transform.scale.set(100, 100, 100);
            text1.transform.setPosition(-2, 2 * 100, 0);
            duck1.addChild(text1.entity);

            const text2 = new Text(engine, 'duck2');
            text2.transform.scale.set(100, 100, 100);
            text2.transform.setPosition(0, 2 * 100, 0);
            duck2.addChild(text2.entity);
            
            const text3 = new Text(engine, 'duck3');
            text3.transform.scale.set(100, 100, 100);
            text3.transform.setPosition(2, 2 * 100, 0);
            duck3.addChild(text3.entity);
        });
        

        const box = initBox(engine);
        box.transform.setPosition(0, 3, 0);
        rootEntity.addChild(box);

        engine.run();
    }, [])

    return <div style={{ height: '500px' }}>
        <canvas id="basicCubeCanvas" style={{
            width: '100%',
            height: '100%',
            outline: 'none',
        }}/>
    </div>
};