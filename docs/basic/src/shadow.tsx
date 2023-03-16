import React, { useEffect } from 'react';
import {
    BlinnPhongMaterial,
    Entity,
    MeshRenderer,
    PBRMaterial,
    PrimitiveMesh,
    Renderer,
    ShadowCascadesMode,
    ShadowResolution,
    ShadowType,
    Vector3,
    WebGLEngine,
  } from "oasis-engine";
import AxisHelper from '../../components/AxisHelper';
import SunLight from '../../components/SunLight';
import Ambient from '../../components/Ambient';
import ProjectiveCamera from '../../components/ProjectiveCamera';

import RotateScript from '../../Scripts/rotate';

export default () => {
    useEffect(() => {
        const engine = new WebGLEngine("basicCubeCanvas");
        engine.canvas.resizeByClientSize();
        window.addEventListener('resize', () =>  engine.canvas.resizeByClientSize());

        const scene = engine.sceneManager.activeScene;
        scene.background.solidColor.set(1, 1, 1, 1);
        scene.shadowResolution = ShadowResolution.High;
        scene.shadowDistance = 100;
        scene.shadowCascades = ShadowCascadesMode.FourCascades;

        const ambient = new Ambient(engine);
        ambient.loadEnvMap('https://gw.alipayobjects.com/os/bmw-prod/89c54544-1184-45a1-b0f5-c0b17e5c3e68.bin', (ambientLight) => {
            scene.ambientLight = ambientLight;
        });

        const rootEntity = scene.createRootEntity("root");

        const camera = new ProjectiveCamera(engine);
        camera.transform.setPosition(0, 5, 10);
        rootEntity.addChild(camera.entity);

        const sun = new SunLight(engine, ShadowType.SoftLow);
        sun.transform.setPosition(10, 10, 10);
        sun.transform.lookAt(new Vector3(0, 0, 0));
        rootEntity.addChild(sun.entity);

        const axisHelper = new AxisHelper(engine);
        rootEntity.addChild(axisHelper.entity);

        // cube cast shadow
        const cubeEntity = rootEntity.createChild("cube");
        cubeEntity.addComponent(RotateScript);
        cubeEntity.transform.setPosition(0, 2, 0);
        const cube = cubeEntity.addComponent(MeshRenderer);
        cube.mesh = PrimitiveMesh.createCuboid(engine, 2, 2, 2);
        // const cubeMaterial = new BlinnPhongMaterial(engine);
        const cubeMaterial = new PBRMaterial(engine);
        cube.setMaterial(cubeMaterial);

        const cubeEntity2 = new Entity(engine, "cube2");
        cubeEntity2.transform.setPosition(2, 2, 2);
        
        const cubeRenderer2 = cubeEntity2.addComponent(MeshRenderer);
        cubeRenderer2.castShadows = false;
        cubeRenderer2.receiveShadows = false;
        cubeRenderer2.mesh = PrimitiveMesh.createCuboid(engine, 1, 1, 1);
        const cubeMaterial2 = new BlinnPhongMaterial(engine);
        cubeRenderer2.setMaterial(cubeMaterial2);
        rootEntity.addChild(cubeEntity2);

        // plane receive shadow
        const planeEntity = rootEntity.createChild("plane");
        const plane = planeEntity.addComponent(MeshRenderer);
        plane.mesh = PrimitiveMesh.createPlane(engine, 10, 10);
        const planeMaterial = new BlinnPhongMaterial(engine);
        // const planeMaterial = new PBRMaterial(engine);
        planeMaterial.baseColor.set(1, 0, 0, 1);
        plane.setMaterial(planeMaterial);

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