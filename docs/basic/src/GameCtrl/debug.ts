import * as dat from "dat.gui";
import { Camera, Engine, Vector3 } from "oasis-engine";
import { GameCtrl } from ".";
import { ModuleEvent, SocketEvent } from "./event";
import { EnumShadowQuality, ShadowManager } from "./manager/ShadowManager";
import { EffectManager, EnumEffectType } from "./module/effect/EffectManager";
import { EnumMap } from "./module/scene/map/enum/EnumMap";
import { SceneDataManager } from "./module/scene/SceneDataManager";
import { EnumBehavior } from "./module/scene/unit/enum/EnumBehavior";
import { IBehaviorData } from "./module/scene/unit/interface/IBehaviorData";
import { TouchHandlerType } from "./module/touch/enum/ITouchHandlerType";
import { ControlHandlerType, OrderType, TouchManager } from "./module/touch/TouchManager";
import { AvatarInfo } from "./socket/AvatarInfo";

export function debug(engine: Engine) {
  // const gui = new dat.GUI();
  const myAvatar: AvatarInfo = {
    isSelf: true,
    id: "1001",
    nickName: "木头",
    title: "hello",
    headImg: "",
    sex: "male",
    model: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
    animation: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
    position: { x: 0, y: 0, z: 0 },
    rotation: 90
  };

  const otherAvatar: AvatarInfo = {
    isSelf: false,
    id: "1002",
    nickName: "小鱼儿",
    title: "hello",
    headImg: "",
    sex: "male",
    model: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
    animation: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
    position: { x: 1, y: 0, z: 1 },
    rotation: 0
  };

  const debugInfo = {
    enterMyAvatar: () => {
      engine.dispatch(SocketEvent.enterAvatar_ToG, [myAvatar]);
    },
    quitMyAvatar: () => {
      engine.dispatch(SocketEvent.quitAvatar_ToG, [myAvatar.id]);
    },
    enterOtherAvatar: () => {
      engine.dispatch(SocketEvent.enterAvatar_ToG, [otherAvatar]);
    },
    quitOtherAvatar: () => {
      engine.dispatch(SocketEvent.quitAvatar_ToG, [otherAvatar.id]);
    },
    walkTo: () => {
      engine.dispatch(ModuleEvent.addBehavior, {
        id: "1001",
        type: EnumBehavior.WalkTo,
        data: <IBehaviorData>{
          data: { x: 5, y: 0, z: 5 },
          onInitCallBack: () => {
            console.log("行为触发");
          },
          onUpdateCallBack: () => {
            console.log("行为更新");
          },
          onExitCallBack: () => {
            console.log("行为退出");
          }
        }
      });
    },
    playEffect: () => {
      EffectManager.play(
        EnumEffectType.Avatar_UV,
        GameCtrl.ins.root,
        new Vector3(0, 0, 0),
        1,
        false,
        () => {
          console.log("特效结束");
        },
        () => {
          console.log("特效开始");
        }
      );
    },
    fov: 45,
    scale: 1.0,
    altitude: 2,
    rotateSpeed: 0.3,
    radius: 8,
    enableZoom: false,
    enableRotate: true,
    resolution: 1080,
    rotation: 180,
    shadowQuality: "middle",
    handlerType: "摇杆自由视角自由",
    map: "Default"
  };

  // const avatarFolder = gui.addFolder("avatar");
  // avatarFolder.add(debugInfo, "enterMyAvatar");
  // avatarFolder.add(debugInfo, "quitMyAvatar");
  // avatarFolder.add(debugInfo, "enterOtherAvatar");
  // avatarFolder.add(debugInfo, "quitOtherAvatar");
  // avatarFolder.add(debugInfo, "walkTo");
  // avatarFolder
  //   .add(debugInfo, "scale", 0.5, 8, 0.2)
  //   .onChange((v) => {
  //     SceneDataManager.avatarScale = v;
  //     const avatarList = SceneDataManager.getAvatarList();
  //     for (let id in avatarList) {
  //       avatarList[id].control.setScale(v);
  //     }
  //   })
  //   .name("人物缩放");
  // avatarFolder
  //   .add(debugInfo, "rotation", 0, 360, 1)
  //   .onChange((v) => {
  //     const avatar = SceneDataManager.getAvatar("1001");
  //     if (avatar) {
  //       avatar.control.setRotate(v);
  //     }
  //   })
  //   .name("人物朝向");
  // avatarFolder.open();

  // const cameraFolder = gui.addFolder("camera");
  // cameraFolder.add(debugInfo, "enableRotate").onChange((v) => {
  //   const handlerType = debugInfo.enableZoom ? ControlHandlerType.ZOOM : ControlHandlerType.None;
  //   TouchManager.updateViewHandlerType(OrderType.Debug, v ? ControlHandlerType.ROTATE | handlerType : handlerType);
  // });

  // cameraFolder.add(debugInfo, "enableZoom").onChange((v) => {
  //   const handlerType = debugInfo.enableRotate ? ControlHandlerType.ROTATE : ControlHandlerType.None;
  //   TouchManager.updateViewHandlerType(OrderType.Debug, v ? ControlHandlerType.ZOOM | handlerType : handlerType);
  // });

  // cameraFolder
  //   .add(debugInfo, "fov", 3, 80, 2)
  //   .onChange((v) => {
  //     GameCtrl.ins.camera.getComponent(Camera).fieldOfView = v;
  //   })
  //   .name("视角(角度)");

  // cameraFolder
  //   .add(debugInfo, "radius", 4, 15, 1)
  //   .onChange((v) => {
  //     TouchManager.viewControl.radius = v;
  //   })
  //   .name("相机跟随半径");

  // cameraFolder
  //   .add(debugInfo, "altitude", 0, 5, 0.1)
  //   .onChange((v) => {
  //     TouchManager.viewControl.target.set(0, v, 0);
  //   })
  //   .name("偏移高度(米)");

  // cameraFolder
  //   .add(debugInfo, "rotateSpeed", 0, 1, 0.05)
  //   .onChange((v) => {
  //     TouchManager.viewControl.rotateSpeed = v;
  //   })
  //   .name("相机旋转速度");

  // const mapArr = [];
  // for (let str in EnumMap) {
  //   if (str.length > 2) {
  //     mapArr.push(str);
  //   }
  // }
  // gui
  //   .add(debugInfo, "map", mapArr)
  //   .onChange((v: string) => {
  //     engine.dispatch(ModuleEvent.jumpMap, { type: EnumMap[v], pos: { x: 4, y: 0, z: 4 } });
  //   })
  //   .name("跳转地图");

  // gui
  //   .add(debugInfo, "resolution", [1080, 720, 540])
  //   .onChange((v: number) => {
  //     GameCtrl.ins.setResolution(v);
  //   })
  //   .name("分辨率");

  // gui
  //   .add(debugInfo, "shadowQuality", ["high", "middle", "low"])
  //   .onChange((v: string) => {
  //     switch (v) {
  //       case "high":
  //         ShadowManager.setShadowQuality(EnumShadowQuality.high);
  //         break;
  //       case "middle":
  //         ShadowManager.setShadowQuality(EnumShadowQuality.middle);
  //         break;
  //       case "low":
  //         ShadowManager.setShadowQuality(EnumShadowQuality.low);
  //         break;
  //       default:
  //         break;
  //     }
  //   })
  //   .name("阴影质量");

  // gui
  //   .add(debugInfo, "handlerType", ["摇杆自由视角自由", "摇杆自由视角锁定", "摇杆锁定视角自由", "摇杆锁定视角锁定"])
  //   .onChange((v: string) => {
  //     switch (v) {
  //       case "摇杆自由视角自由":
  //         TouchManager.updateHandlerType(OrderType.Debug, TouchHandlerType.JoyFreeViewFree);
  //         break;
  //       case "摇杆自由视角锁定":
  //         TouchManager.updateHandlerType(OrderType.Debug, TouchHandlerType.JoyFreeViewLock);
  //         break;
  //       case "摇杆锁定视角自由":
  //         TouchManager.updateHandlerType(OrderType.Debug, TouchHandlerType.JoyLockViewFree);
  //         break;
  //       case "摇杆锁定视角锁定":
  //         TouchManager.updateHandlerType(OrderType.Debug, TouchHandlerType.JoyLockViewLock);
  //         break;
  //       default:
  //         break;
  //     }
  //   })
  //   .name("触控类型");

  // gui.add(debugInfo, "playEffect").name("播放示例特效");
}
