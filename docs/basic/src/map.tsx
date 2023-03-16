import React, { useEffect } from 'react';
import { WebGLEngine } from 'oasis-engine';
import CameraViewHelper from '../../Scripts/cameraViewHelper'
import { initAvatarCamera, initScene, initLight } from './utils/env';
import { PhysXPhysics } from "@oasis-engine/physics-physx";
import BasicSystem from './basicSystem';
import PlayerSystem from './playerSystem';
import MapSystem, { IGrid } from './map/index';
import { mockGrids } from './map/helper';

export default () => {
    useEffect(() => {
        const engine = new WebGLEngine("canvas");
        engine.canvas.resizeByClientSize();

        PhysXPhysics.initialize()
        .then(() => {
            // 初始化物理引擎
            engine.physicsManager.initialize(PhysXPhysics);

            const scene = initScene(engine);
            const rootEntity = scene.createRootEntity("root");

            const basicSystem = new BasicSystem(engine, rootEntity); // 基础系统

            // 初始化地图系统
            const mapSystem = new MapSystem(engine, mockGrids as IGrid[]);
            rootEntity.addChild(mapSystem.mapRoot);

            const cameraEntity = rootEntity.createChild("CameraParent");
            cameraEntity.addComponent(CameraViewHelper);
            const debug = true;
            const avatarCamera = initAvatarCamera(rootEntity, cameraEntity, debug);
            const lightEntity = initLight(rootEntity);
        
            const player = new PlayerSystem(engine, rootEntity, avatarCamera, lightEntity, basicSystem, mapSystem);
        })
        
    }, [])
    return <div style={{ position: 'relative', height: '500px' }}>
        <canvas id="canvas" style={{
            width: '100%',
            height: '100%',
            outline: 'none',
        }}/>
    </div>
};