import React, { useEffect } from 'react';
import { BlinnPhongMaterial, MeshRenderer, PrimitiveMesh, WebGLEngine, 
    Engine,
    Mesh,
    Shader,
    BaseMaterial,
    BufferMesh,
    IndexFormat,
    BufferBindFlag,
    Buffer,
    BufferUsage,
    VertexElement,
    VertexElementFormat,
    Matrix,
    RenderFace,
} from 'oasis-engine';
import CameraViewHelper from '../../Scripts/cameraViewHelper'
import { initAvatarCamera, initScene, initLight } from './utils/env';
import { PhysXPhysics } from "@oasis-engine/physics-physx";
import BasicSystem from './basicSystem';
import PlayerSystem from './playerSystem';
import UISystem from './uiSystem';
import MapSystem from './map/index';
import { mockGrids } from './map/helper';
import { IGrid } from './map/interface';
import Grass from './objects/grass';

function initSphere(engine: WebGLEngine, radius = 0.2) {
    const entity = engine.createEntity('sphere');
    const renderer = entity.addComponent(MeshRenderer);
    renderer.mesh = PrimitiveMesh.createSphere(engine, radius);
    const material = new BlinnPhongMaterial(engine);
    material.baseColor.set(1, 0, 0, 1);
    renderer.setMaterial(material);
    entity.transform.setPosition(0, radius, 0);
    return entity;
}

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

            const sphere = initSphere(engine, 0.3);
            sphere.transform.setPosition(2.5, 0.3, -2.5);
            mapSystem.addToMap(sphere, {
                animate: {
                    type: 'enterLeave',
                    target: [0, 2, 0],
                    duration: 500,
                }
            });

            const cameraEntity = rootEntity.createChild("CameraParent");
            cameraEntity.addComponent(CameraViewHelper);
            
            const debug = true;
            const avatarCamera = initAvatarCamera(rootEntity, cameraEntity, debug);
            
            const lightEntity = initLight(rootEntity);

            const uiSystem = new UISystem({
                miniMap: 'miniMap',
                miniMapDynamic: 'miniMapDynamic',
                grids: mockGrids as any[],
            });
        
            const player = new PlayerSystem(engine, rootEntity, avatarCamera, lightEntity, basicSystem, mapSystem);
            const [ gridX, gridZ ] = player.grid;
            uiSystem.updateMiniMap([{
                rotate: player.rotateY,
                gridX,
                gridZ,
            }])
            player.on('gridCross', (e) => {
                uiSystem.updateMiniMap([{
                    rotate: player.rotateY,
                    gridX: e.gridX,
                    gridZ: e.gridZ,
                }])
            })

            const grass = new Grass(engine, mapSystem);
            rootEntity.addChild(grass.grassEntity);
        })
        
        
    }, [])
    return <div style={{ position: 'relative', height: '500px' }}>
        <canvas id="canvas" style={{
            width: '100%',
            height: '100%',
            outline: 'none',
        }}/>
        <canvas id='miniMap'></canvas>
        <canvas id='miniMapDynamic'></canvas>
    </div>
};