import { Entity, WebGLEngine } from "oasis-engine";
import { PhysXPhysics } from "@oasis-engine/physics-physx";
import BasicSystem from "../basicSystem";
import MapSystem from "../map/index";
import { addColliderCubes } from '../map/helper';
import { GameCtrl, GameState } from '../GameCtrl/index';
import { ModuleEvent, SocketEvent } from '../GameCtrl/event'
import { AnimateType, AnimatePlayType } from '../animateSystem/interface';
import ViewHelper  from '../../../Scripts/viewHelper';
import PlayerHelper from '../map/playerHelper';

export default class PlayerSystem {
    private engine: WebGLEngine;
    private rootEntity: Entity;
    private basicSystem: BasicSystem;
    private mapSystem: MapSystem;

    private playerHelper: PlayerHelper;

    cubes: any;
    constructor(engine: WebGLEngine, rootEntity: Entity, camera: Entity, lightEntity: Entity, basicSystem: BasicSystem) {
        this.engine = engine;
        this.rootEntity = rootEntity;
        this.basicSystem = basicSystem;

        const scene = engine.sceneManager.activeScene;
        
        PhysXPhysics.initialize()
        .then(() => {
            // 初始化物理引擎
            engine.physicsManager.initialize(PhysXPhysics);

            const mapSystem = new MapSystem(engine);
            rootEntity.addChild(mapSystem.mapRoot);
            this.mapSystem = mapSystem;
    
            const playerHelper = new PlayerHelper(engine, mapSystem);
            rootEntity.addChild(playerHelper.entity);
            this.playerHelper = playerHelper;
    
            const sphere = playerHelper.initSphere(0.3);
            sphere.transform.setPosition(2.5, 0.3, -2.5);
            mapSystem.addToMap(sphere);

            const game = new GameCtrl();
            game.start(engine, rootEntity, camera, scene, lightEntity);
            this.cubes = addColliderCubes(engine, rootEntity);

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
            // 加载玩家角色模型
            this.engine.dispatch(SocketEvent.enterAvatar_ToG, [myAvatar]); // load avatar
        })
        this.bindEvent();
    }

    bindEvent() {
        // 注册人物移动的监听 - target change
        this.engine.on('createUnit', (unit) => unit.entity.addComponent(ViewHelper));

        // avator model loaded
        this.engine.on('avatarModelLoaded', (avatar) => { 
            const { modelEntity } = avatar;
            modelEntity.addComponent(ViewHelper);
            
            const { x, z } = modelEntity.transform.position;
            this.playerHelper.player = modelEntity.parent
            this.playerHelper.init(x, z);
            const startForward = 6;
            this.playerHelper.updateDir(startForward);
        })
        // 玩家的视角变化 - 玩家发生移动
        this.engine.on('avatarTargetChange', (newTarget) => this.playerHelper.move(newTarget.x, newTarget.z));

        // 玩家从一个网格移动到另一个网格
        this.engine.on('playerMove', ({grids, centerX, centerZ, x, z}) => {
            if(this.playerHelper.player){
                const { y: rotateY } = this.playerHelper.player.transform.rotation;

                this.basicSystem.animateSystem.play(AnimateType.FOOT, {
                    type: AnimatePlayType.FADE_OUT,
                    duration: 1500,
                    position: [x, 1, z],
                    rotation: [0, rotateY, 0],
                })
            }

            grids.forEach((grid, index) => {
                // 根据 mapSystem 动态设置围栏（cube），限制玩家移动
                if(!grid && this.cubes[index + 1]) {
                    const dir = index + 1;
                    const [nearGridX, nearGrixZ] = this.mapSystem.getGridNear(centerX, centerZ, dir);
                    const [x, y] = this.mapSystem.gridXZ2xz(nearGridX, nearGrixZ);
                    const box = this.cubes[dir];
                    box.transform.setPosition(x, 0.5, y);
                }
                if(grid?.fill) {
                 
                }
            });
        });
    }

    private onMove() {

    }
}