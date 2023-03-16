import { Entity, MeshRenderer, WebGLEngine } from "oasis-engine";
import { PhysXPhysics } from "@oasis-engine/physics-physx";
import BasicSystem from "../basicSystem";
import MapSystem from "../map/index";
import { GameCtrl } from '../GameCtrl/index';
import { SocketEvent } from '../GameCtrl/event'
import AnimateSystem from '../animateSystem/index';
import { AnimateType, AnimatePlayType } from '../animateSystem/interface';
import ViewHelper  from '../../../Scripts/viewHelper';
import PlayerHelper from './playerHelper';
import AreaSystem from './areaSystem';

export default class PlayerSystem {
    private engine: WebGLEngine;
    private rootEntity: Entity;
    private basicSystem: BasicSystem;
    private mapSystem: MapSystem;
    private animateSystem: AnimateSystem;
    private areaSystem: AreaSystem;
    private playerHelper: PlayerHelper;

    private aroundObjects: Entity[]; // 玩家周围的物体
    
    constructor(engine: WebGLEngine, rootEntity: Entity, camera: Entity, lightEntity: Entity, basicSystem: BasicSystem) {
        this.engine = engine;
        this.rootEntity = rootEntity;
        this.basicSystem = basicSystem;
        
        this.animateSystem = basicSystem.animateSystem;

        const scene = engine.sceneManager.activeScene;
        
        PhysXPhysics.initialize()
        .then(() => {
            // 初始化物理引擎
            engine.physicsManager.initialize(PhysXPhysics);
            
            // 初始化地图系统
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
            
            const position = { x: 0, y: 0, z: 0 };
            const myAvatar = {
                isSelf: true,
                id: "1001",
                nickName: "木头",
                title: "hello",
                headImg: "",
                sex: "male",
                model: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
                animation: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
                position,
                rotation: 90,
            };

            this.areaSystem = new AreaSystem(2, mapSystem);
            this.areaSystem.setXZ(position.x, position.z);

            // 加载玩家角色模型
            this.engine.dispatch(SocketEvent.enterAvatar_ToG, [myAvatar]); // load avatar
        })
        this.bindEvent();
    }

    bindEvent() {
        // 注册人物移动的监听 - target change
        this.engine.on('gameCtrlCreateUnit', (unit) => unit.entity.addComponent(ViewHelper));

        // avator model loaded
        this.engine.on('avatarModelLoaded', (avatar) => { 
            const { modelEntity } = avatar;
            modelEntity.addComponent(ViewHelper); // listen avatarTargetChange
            
            const { x, z } = modelEntity.transform.position;
            this.playerHelper.player = modelEntity.parent;
            this.playerHelper.init(x, z);
            const startForward = 6; // start forward
            this.playerHelper.updateDir(startForward);
        })
        // 玩家的视角变化 - 玩家发生移动
        this.engine.on('avatarTargetChange', (newTarget) => this.playerHelper.move(newTarget.x, newTarget.z));

        // 玩家从一个网格移动到另一个网格
        this.engine.on('gridCross', ({gridX, gridZ, x, z}) => {
            this.onGridCross(gridX, gridZ, x, z);
        });
    }

    private onGridCross(gridX: number, gridZ: number, x: number, z: number) {
        // 添加足迹动画
        this.animateSystem.play(AnimateType.FOOT, {
            type: AnimatePlayType.FADE_OUT,
            duration: 1500,
            position: [x, 1, z],
            rotation: [0, this.playerHelper.rotateY, 0],
        })

        // 根据 mapSystem 动态设置围栏（cube），限制玩家移动
        const grids = this.mapSystem.getNineGrids(gridX, gridZ);
        this.mapSystem.updateCollisionCubes(grids, gridX, gridZ);

        // 更新玩家周围的物体
        // enterGrids 玩家周围新进入的网格
        // leaveGrids 玩家周围离开的网格
        this.areaSystem.update(gridX, gridZ, (enterGrids, leaveGrids) => {
            enterGrids.forEach((grid) => {
                if(grid.fill) {
                    const {x, y, z} = grid.fill.transform.position;
                    this.animateSystem.play(AnimateType.FLOAT_UP, { // 上浮
                        type: AnimatePlayType.FLOAT_UP,
                        entity: grid.fill,
                        duration: 400,
                        position: [x, y, z]
                    })
                }
            })
            leaveGrids.forEach((grid) => {
                if(grid.fill) {
                    const {x, y, z} = grid.fill.transform.position;
                    this.animateSystem.play(AnimateType.FLOAT_DOWN, { // 下落
                        type: AnimatePlayType.FLOAT_DOWN,
                        entity: grid.fill,
                        duration: 400,
                        position: [x, y, z],
                        target: [0, 0.3, 0]
                    })
                }
            })
        });
    }

    

}