import React, { useEffect } from 'react';
import { 
    AnimationClip,
    Animator,
    BlinnPhongMaterial,
    Camera,
    Entity,
    MeshRenderer,
    PrimitiveMesh,
    WebGLEngine,
    GLTFResource,
    PBRMaterial,
    Renderer,
    BoundingBox,
    Vector3,
} from 'oasis-engine';
import AxisHelper from '../../components/AxisHelper'
import SunLight from '../../components/SunLight'
import ProjectiveCamera from '../../components/ProjectiveCamera'
import RotateScript from '../../Scripts/rotate';
import ClickScript from '../../Scripts/click';
import { FramebufferPicker } from 'oasis-engine-toolkit';

function setCenter(renderers: Renderer[], cameraEntity: Entity, camera: Camera) {
    const boundingBox = new BoundingBox();
    const center = new Vector3();
    const extent = new Vector3();

    boundingBox.min.set(0, 0, 0);
    boundingBox.max.set(0, 0, 0);

    renderers.forEach((renderer) => {
      BoundingBox.merge(renderer.bounds, boundingBox, boundingBox);
    });
    boundingBox.getExtent(extent);
    const size = extent.length();

    boundingBox.getCenter(center);
    cameraEntity.transform.setPosition(center.x, center.y, size * 3);

    camera.farClipPlane = size * 12;

    if (camera.nearClipPlane > size) {
      camera.nearClipPlane = size / 10;
    } else {
      camera.nearClipPlane = 0.1;
    }
  }

  function loadAnimationGUI(animations: AnimationClip[]) {
    if (animations?.length) {
      const animator = this.gltfRootEntity.getComponent(Animator);
      animator.play(animations[0].name);
    }
  }

export default () => {
    useEffect(() => {
        const engine = new WebGLEngine("basicCubeCanvas");
        engine.canvas.resizeByClientSize();
        window.addEventListener('resize', () =>  engine.canvas.resizeByClientSize());

        const scene = engine.sceneManager.activeScene;
        scene.ambientLight.diffuseSolidColor.set(1, 1, 1, 1);
        scene.ambientLight.diffuseIntensity = 0.1;
        scene.background.solidColor.set(1, 1, 1, 1);
        const rootEntity = scene.createRootEntity("root");

        const axisHelper = new AxisHelper(engine);
        rootEntity.addChild(axisHelper.entity);

        const framebufferPicker = rootEntity.addComponent(FramebufferPicker);

        const camera = new ProjectiveCamera(engine, 'camera');
        framebufferPicker.camera = camera.camera;
        rootEntity.addChild(camera.entity);

        const sun = new SunLight(engine);
        rootEntity.addChild(sun.entity);

        const cubeEntity = rootEntity.createChild("cube");
        cubeEntity.addComponent(RotateScript);

        const cubeSize = 10;
        const cube = cubeEntity.addComponent(MeshRenderer);
        cube.mesh = PrimitiveMesh.createCuboid(engine, cubeSize, cubeSize, cubeSize);
        const material = new BlinnPhongMaterial(engine);
        cube.setMaterial(material);

        engine.resourceManager
        .load<GLTFResource>("https://gw.alipayobjects.com/os/bmw-prod/f40ef8dd-4c94-41d4-8fac-c1d2301b6e47.glb")
        .then((gltf) => {
            const { defaultSceneRoot: gltfEntity, materials, animations } = gltf;
            rootEntity.addChild(gltfEntity);

            const meshRenderers = [];
            gltfEntity.getComponentsIncludeChildren(MeshRenderer, meshRenderers);
            setCenter(meshRenderers, camera.entity, camera.camera);

            if (animations?.length) {
                const animator = gltfEntity.getComponent(Animator);
                animator.play(animations[0].name);
            }
            
            const click = camera.entity.addComponent(ClickScript);
            click.material = (materials as PBRMaterial[])[0];
            click.framebufferPicker = framebufferPicker;
        });

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