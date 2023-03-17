import { Entity, WebGLEngine } from "oasis-engine";
import BasicSystem from "../basicSystem";
import MapSystem from "../map/index";
import { GameCtrl } from '../GameCtrl/index';
import { SocketEvent } from '../GameCtrl/event'
import AnimateSystem from '../animateSystem/index';
import { AnimateType, AnimatePlayType } from '../animateSystem/interface';
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

    private bindEvents: {
        [key: string]: (values: any) => void;
    } = {};

    get rotateY() {
        return this.playerHelper.rotateY;
    }

    get grid() {
        return this.playerHelper.grid;
    }
    
    constructor(engine: WebGLEngine, rootEntity: Entity, camera: Entity, lightEntity: Entity, basicSystem: BasicSystem, mapSystem: MapSystem) {
        this.engine = engine;
        this.rootEntity = rootEntity;
        this.basicSystem = basicSystem;
        this.animateSystem = basicSystem.animateSystem;
        this.mapSystem = mapSystem;

        const scene = engine.sceneManager.activeScene;
        this.bindEvent();

        const playerHelper = new PlayerHelper(engine, mapSystem);
        rootEntity.addChild(playerHelper.entity);
        this.playerHelper = playerHelper;

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
    }

    on(event: string, callback: (values: any) => void) {
        this.bindEvents[event] = callback;
    }

    bindEvent() {
        // avator model loaded
        this.engine.on('avatarModelLoaded', (avatar) => { 
            const { modelEntity } = avatar;
            const { x, z } = modelEntity.transform.position;
            this.playerHelper.setup(x, z, modelEntity.parent);
            const startForward = 6; // start forward
            this.playerHelper.updateDir(startForward);
        })

        // 玩家从一个网格移动到另一个网格
        this.engine.on('gridCross', ({gridX, gridZ, x, z}) => {
            this.onGridCross(gridX, gridZ, x, z);
            this.bindEvents['gridCross'] && this.bindEvents['gridCross']({gridX, gridZ, x, z});
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
        // const duration = 500;
        this.areaSystem.update(gridX, gridZ, (enterGrids, leaveGrids) => {
            enterGrids.forEach((grid) => {
                
                if(grid.fill && grid.fill.animate) {
                    const { duration, target } = grid.fill.animate;
                    const entity = grid.fill.entity;
                    const {x, y, z} = entity.transform.position;
                    this.animateSystem.play(AnimateType.FLOAT_UP, { // 上浮
                        type: AnimatePlayType.FLOAT_UP,
                        entity,
                        duration,
                        position: [x, y, z],
                        target,
                    })
                }
            })
            leaveGrids.forEach((grid) => {
                if(grid.fill && grid.fill.animate) {
                    const { position, entity, animate: { duration } } = grid.fill;
                    const {x, y, z} = entity.transform.position;
                    this.animateSystem.play(AnimateType.FLOAT_DOWN, { // 下落
                        type: AnimatePlayType.FLOAT_DOWN,
                        entity,
                        duration,
                        position: [x, y, z],    // 动画的起始位置是当前位置
                        target: position,       // 动画的目标位置是网格中动画覆盖物的初始位置
                    })
                }
            })
        });
    }
}