import React, { useEffect } from 'react';
import { WebGLEngine } from 'oasis-engine';
import CameraViewHelper from '../../Scripts/cameraViewHelper'
import { initAvatarCamera, initScene, initLight } from './utils/env';
import BasicSystem from './basicSystem';
import PlayerSystem from './playerSystem';

export default () => {
    useEffect(() => {
        const engine = new WebGLEngine("canvas");
        engine.canvas.resizeByClientSize();

        const scene = initScene(engine);
        const rootEntity = scene.createRootEntity("root");

        const basicSystem = new BasicSystem(engine, rootEntity); // 基础系统

        const cameraEntity = rootEntity.createChild("CameraParent");
        cameraEntity.addComponent(CameraViewHelper);
        const debug = true;
        const avatarCamera = initAvatarCamera(rootEntity, cameraEntity, debug);
        const lightEntity = initLight(rootEntity);
      
        const player = new PlayerSystem(engine, rootEntity, avatarCamera, lightEntity, basicSystem);
        
    }, [])
    return <div style={{ position: 'relative', height: '500px' }}>
        <canvas id="canvas" style={{
            width: '100%',
            height: '100%',
            outline: 'none',
        }}/>
    </div>
};