import { PhysXPhysics } from "@oasis-engine/physics-physx";
import { GridControl } from "oasis-engine-toolkit";
import "@oasis-engine/pointer-polyfill";
import {
  Camera,
  DirectLight,
  Entity,
  Layer,
  Scene,
  ShadowCascadesMode,
  ShadowResolution,
  ShadowType,
  Vector3,
  WebGLEngine
} from "oasis-engine";
import { ModuleManager } from "./manager/ModuleManager";
import { ModuleEvent } from "./event";
import { debug } from "./debug";
import cameraConfig from "./config/camera.json";
import { EnumMap } from "./module/scene/map/enum/EnumMap";
import { TouchManager } from "./module/touch/TouchManager";

export enum GameState {
  InitEngine,
  InitPhysX,
  InitScene,
  InitModule,
  Start
}

export class GameCtrl {
  private static _ins: GameCtrl;

  // 当前开发的版本
  version: string = `1.0.6`;
  // 引擎实例
  engine: WebGLEngine;
  // 场景实例
  scene: Scene;
  // 根节点
  root: Entity;
  // 相机节点
  camera: Entity;
  // 方向光节点
  directLight: Entity;

  viewControl = TouchManager.viewControl;

  // 当前阶段
  private _gameState: GameState;
  // 模块管理
  private _moduleManager: ModuleManager;
  // 分辨率
  private _resolution: number = 1080;

  static get ins() {
    if (!this._ins) {
      this._ins = new GameCtrl();
    }
    return this._ins;
  }
  
  start(engine: WebGLEngine, rootEntity: Entity, camera: Entity, scene: Scene, lightEntity: Entity) {
    this.setUp();
    this.engine = engine;
    this.root = rootEntity;
    this.camera = camera;
    this.scene = scene;
    this.directLight = lightEntity;  
    this.jumpState(GameState.InitModule);
  }

  setUp() {
    GameCtrl._ins = this;
  }
  

  jumpState(state: GameState) {
    if (this._gameState !== state) {
      // console.log("jumpState", GameState[state]);
      this._gameState = state;
      switch (state) {
        case GameState.InitEngine:
          this._initEngine(
            () => {
              this.jumpState(GameState.InitPhysX);
            },
            (reason) => {
              console.error("InitEngine Fail.", reason);
            }
          );
          break;
        case GameState.InitPhysX:
          this._initPhys(
            () => {
              this.jumpState(GameState.InitScene);
            },
            (reason) => {
              console.error("InitPhysX Fail.", reason);
            }
          );
          break;
        case GameState.InitScene:
          this._initScene(
            () => {
              this.jumpState(GameState.InitModule);
            },
            (reason) => {
              console.error("InitScene Fail.", reason);
            }
          );
          break;
        case GameState.InitModule:
          this.engine.run();
          this._initModule(
            () => {
              this.jumpState(GameState.Start);
            },
            (reason) => {
              console.error("InitModule Fail.", reason);
            }
          );
          break;
        case GameState.Start:
          debug(this.engine);
          // 跳转到默认地图的某个位置
          this.engine.dispatch(ModuleEvent.jumpMap, { type: EnumMap.Default, pos: { x: 0, y: 0, z: 0 } });
          break;
        default:
          break;
      }
    }
  }

  private _initPhys(success: () => any, fail: (error) => any) {
    PhysXPhysics.initialize()
      .then(() => {
        this.engine.physicsManager.initialize(PhysXPhysics);
        success();
      }, fail)
      .catch(fail);
  }

  private _initEngine(success: () => any, fail: (error: Error) => any) {
    try {
      const engine = (this.engine = new WebGLEngine("canvas"));
      // @ts-ignore
      (engine.canvas._webCanvas as HTMLCanvasElement).style.touchAction = "none";
      this.setResolution(this._resolution, true);
      window.addEventListener("resize", () => {
        engine.dispatch(ModuleEvent.screenResize);
        this.setResolution(this._resolution, true);
      });
      success();
    } catch (error) {
      fail(error);
    }
  }

  private _initScene(success: () => any, fail: (reason) => any) {
    const { engine } = this;
    const scene = (this.scene = engine.sceneManager.activeScene);
    const root = (this.root = this.scene.createRootEntity("root"));
    // 初始化相机
    const cameraEntity = root.createChild("CameraParent");
    const camera = (this.camera = cameraEntity.createChild("Camera"));
    const { radius, filedOfView, altitude } = cameraConfig;
    let phi = (cameraConfig.phi / 180) * Math.PI;
    let theta = (cameraConfig.theta / 180) * Math.PI;
    const sinPhiRadius = Math.sin(phi) * radius;
    camera.transform.position.set(
      sinPhiRadius * Math.sin(theta),
      radius * Math.cos(phi) + altitude,
      sinPhiRadius * Math.cos(theta)
    );
    const cameraComponent = camera.addComponent(Camera);
    cameraComponent.cullingMask = Layer.Layer0;
    cameraComponent.fieldOfView = filedOfView;
    cameraComponent.farClipPlane = 800;
    camera.transform.lookAt(new Vector3(0, 0, 0));
    // 初始化辅助坐标系
    const grid = root.addComponent(GridControl);
    grid.camera = cameraComponent;
    // 初始化灯光与阴影
    const lightEntity = (this.directLight = root.createChild("DirectLight"));
    lightEntity.transform.setPosition(8, 10, 10);
    lightEntity.transform.lookAt(new Vector3(0, 0, 0));
    const directLight = lightEntity.addComponent(DirectLight);
    directLight.intensity = 1;
    directLight.shadowStrength = 0.3;
    directLight.shadowBias = 2;
    directLight.shadowType = ShadowType.Hard;
    scene.shadowDistance = 17;
    scene.shadowCascades = ShadowCascadesMode.NoCascades;
    scene.shadowResolution = ShadowResolution.Medium;
    success();
  }

  private _initModule(success: () => any, fail: (reason) => any) {
    try {
      this._moduleManager = new ModuleManager();
      this._moduleManager.init();
      success();
    } catch (error) {
      fail(error);
    }
  }

  setResolution(val: number, force: boolean = false) {
    if (this._resolution !== val || force) {
      this._resolution = val;
      let adapterDpi = window.devicePixelRatio;
      const { clientWidth, clientHeight } = GameCtrl.ins.engine.canvas._webCanvas;
      const shortSlide = Math.min(clientWidth, clientHeight);
      adapterDpi = Math.min(val / shortSlide, adapterDpi);
      GameCtrl.ins.engine.canvas.resizeByClientSize(adapterDpi);
    }
  }

  public destroy() {
    this._moduleManager?.destroy();
    requestAnimationFrame(() => {
      GameCtrl._ins = null;
    });
  }
}
