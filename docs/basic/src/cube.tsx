import React, { useEffect } from 'react';
import { 
    BlinnPhongMaterial,
    MeshRenderer,
    PrimitiveMesh,
    WebGLEngine,
} from 'oasis-engine';
import AxisHelper from '../../components/AxisHelper'
import SunLight from '../../components/SunLight'
import ProjectiveCamera from '../../components/ProjectiveCamera'
import RotateScript from '../../Scripts/rotate';
import { Stats } from "@oasis-engine-toolkit/stats";
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

        const camera = new ProjectiveCamera(engine);
        rootEntity.addChild(camera.entity);

        camera.entity.addComponent(Stats);

        const sun = new SunLight(engine);
        rootEntity.addChild(sun.entity);

        const cubeEntity = rootEntity.createChild("cube");
        cubeEntity.addComponent(RotateScript);

        const cube = cubeEntity.addComponent(MeshRenderer);
        cube.mesh = PrimitiveMesh.createCuboid(engine, 2, 2, 2);
        const material = new BlinnPhongMaterial(engine);
        cube.setMaterial(material);

        engine.run();

        setTimeout(() => {
            const debugTarget = document.getElementsByClassName('gl-perf')[0] as HTMLElement;
            debugTarget.style.top = '200px';
            debugTarget.style.left = '200px';
        }, 100)
    }, [])

    return <div style={{ 
            position: 'relative',
            height: '500px',
        }}>
        <canvas id="basicCubeCanvas" style={{
            width: '100%',
            height: '100%',
            outline: 'none',
        }}/>
    </div>
};