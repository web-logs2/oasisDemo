import React, { useEffect } from 'react';
import {
    AssetType,
    Texture2D,
    WebGLEngine,
    Sprite,
    Vector3,
    SpriteRenderer,
} from 'oasis-engine';
import { PhysXPhysics } from "@oasis-engine/physics-physx";
import { GameCtrl, GameState } from './GameCtrl';
import { ModuleEvent, SocketEvent } from './GameCtrl/event'
import CameraViewHelper from '../../Scripts/cameraViewHelper'
import ViewHelper  from '../../Scripts/viewHelper'
import MapSystem from './map/index'
import PlayerHelper from './map/playerHelper';
import { addColliderCubes } from './map/helper';
import { initCamera, initScene, initLight } from './utils/env';
import ResourceSystem from './resourceSystem';
import AnimateSystem from './animateSystem';
import { AnimateType, AnimatePlayType } from './animateSystem/interface';

const myAvatar = {
    isSelf: true,
    id: "1001",
    nickName: "木头",
    title: "hello",
    headImg: "",
    sex: "male",
    model: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
    animation: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
    position: { x: 0, y: 0, z: 0 },
    rotation: 90,
};

export default () => {
    useEffect(() => {
        const engine = new WebGLEngine("canvas");
        engine.canvas.resizeByClientSize();

        const scene = initScene(engine);
        const rootEntity = scene.createRootEntity("root");

        const resourceSystem = new ResourceSystem(engine);
        const animateSystem = new AnimateSystem(resourceSystem, engine, rootEntity);

        const cameraEntity = rootEntity.createChild("CameraParent");
        cameraEntity.addComponent(CameraViewHelper);

        const camera = cameraEntity.createChild("Camera");
        initCamera(rootEntity, camera);
        const lightEntity = initLight(rootEntity);
      
        const startForward = 6;
        const mapSystem = new MapSystem(engine);
        rootEntity.addChild(mapSystem.mapRoot);

        const playerHelper = new PlayerHelper(engine, mapSystem);
        rootEntity.addChild(playerHelper.entity);

        const sphere = playerHelper.initSphere(0.3);
        sphere.transform.setPosition(2.5, 0.3, -2.5);
        mapSystem.addToMap(sphere);

        let cubes ;
        PhysXPhysics.initialize()
        .then(() => {
            engine.physicsManager.initialize(PhysXPhysics);
            const game = new GameCtrl();
            game.start(engine, rootEntity, camera, scene, lightEntity);
            cubes = addColliderCubes(engine, rootEntity);
        })
        
        engine.on(ModuleEvent.jumpMap, () => {
            engine.on('createUnit', (unit) => {
                // 监听人物移动 - target change
                unit.entity.addComponent(ViewHelper);
            })

            engine.dispatch(SocketEvent.enterAvatar_ToG, [myAvatar]); // load avatar
            engine.on('avatarModelLoaded', (avatar) => { // avator model loaded
                const { modelEntity } = avatar;
                modelEntity.addComponent(ViewHelper);
                
                const { x, z } = modelEntity.transform.position;
                playerHelper.player = modelEntity.parent
                playerHelper.init(x, z);
                playerHelper.updateDir(startForward);

                // 玩家的视角变化 - 玩家发生移动
                engine.on('avatarTargetChange', (newTarget) => {
                    const { x, z } = newTarget;
                    playerHelper.move(x, z);
                });

           
                start();

                setTimeout(() => {
                    const debugTarget = document.getElementsByClassName('gl-perf')[0] as HTMLElement;
                    debugTarget.style.top = '200px';
                    debugTarget.style.left = '200px';
                }, 100);
            })
        })

        function start() {
            // 玩家移动
            engine.on('playerMove', ({grids, centerX, centerZ, x, z}) => {
                if(playerHelper.player){
                    const { y: rotateY } = playerHelper.player.transform.rotation;

                    animateSystem.play(AnimateType.FOOT, {
                        type: AnimatePlayType.FADE_OUT,
                        duration: 1500,
                        position: [x, 1, z],
                        rotation: [0, rotateY, 0],
                    })
                }

                grids.forEach((grid, index) => {
                    // 根据 mapSystem 动态设置围栏（cube），限制玩家移动
                    if(!grid && cubes[index + 1]) {
                        const dir = index + 1;
                        const [nearGridX, nearGrixZ] = mapSystem.getGridNear(centerX, centerZ, dir);
                        const [x, y] = mapSystem.gridXZ2xz(nearGridX, nearGrixZ);
                        const box = cubes[dir];
                        box.transform.setPosition(x, 0.5, y);
                    }
                    if(grid?.fill) {
                     
                    }
                });
            });
        }


    }, [])
    return <div style={{ 
        position: 'relative',
        height: '500px'
        }}>
        <canvas id="canvas" style={{
            width: '100%',
            height: '100%',
            outline: 'none',
        }}/>
    </div>
};