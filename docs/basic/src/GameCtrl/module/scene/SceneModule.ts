import { AssetPromise, Entity, IVector3 } from "oasis-engine";
import { GameCtrl } from "../..";
import { ModuleEvent, SocketEvent } from "../../event";
import { AvatarInfo } from "../../socket/AvatarInfo";
import { createDefault } from "./map/Default";
import { createSquare } from "./map/Square";
import { SceneDataManager } from "./SceneDataManager";
import { EnumBehavior } from "./unit/enum/EnumBehavior";
import { EnumJumpMapState } from "./map/enum/EnumJumpMapState";
import { IBehaviorData } from "./unit/interface/IBehaviorData";
import { UnitFactory } from "./unit/UnitFactory";
import { EnumMap } from "./map/enum/EnumMap";

export class SceneModule {
  initListener() {
    const { engine } = GameCtrl.ins;
    // 添加角色
    engine.on(SocketEvent.enterAvatar_ToG, this._onEnterAvatar_ToG.bind(this));
    // 移除角色
    engine.on(SocketEvent.quitAvatar_ToG, this._onQuitAvatar_ToG.bind(this));
    // 添加行为
    engine.on(ModuleEvent.addBehavior, this._addBehavior.bind(this));
    // 替换地图
    engine.on(ModuleEvent.jumpMap, this._changeMapStart.bind(this));
  }

  constructor() {
    this.initListener();
  }

  private _onEnterAvatar_ToG(dataArr: AvatarInfo[]) {
    const { engine } = GameCtrl.ins;
    for (let i = dataArr.length - 1; i >= 0; i--) {
      const data = dataArr[i];
      // !SceneDataManager.getAvatar(data.id) && SceneDataManager.addAvatar(data.id, UnitFactory.createUnit(data));
      if(!SceneDataManager.getAvatar(data.id)) {
        const unit = UnitFactory.createUnit(data);
        engine.dispatch('gameCtrlCreateUnit', unit)
        SceneDataManager.addAvatar(data.id, unit);
      }
    }
  }

  private _onQuitAvatar_ToG(quitUserIds: string[]) {
    if (!quitUserIds || quitUserIds.length <= 0) {
      return;
    }
    for (let i = quitUserIds.length - 1; i >= 0; i--) {
      const userId = quitUserIds[i];
      const avatar = SceneDataManager.getAvatar(userId);
      if (avatar) {
        SceneDataManager.delAvatar(userId);
        avatar.entity.destroy();
      }
    }
  }

  private _addBehavior(data: { id: string; type: EnumBehavior; data: IBehaviorData }) {
    // console.log('_addBehavior')
    const avatar = SceneDataManager.getAvatar(data.id);
    avatar?.control.behaviorControl.addBehavior(data.type, data.data);
  }

  private _changeMapStart(data: { type: EnumMap; pos?: IVector3 }): void {
    if (SceneDataManager.getJumpState() !== EnumJumpMapState.Finish) {
      // 正在跳转中
      return;
    }
    const { type, pos } = data;
    const { engine, root } = GameCtrl.ins;
    let entityPromise: AssetPromise<Entity>;
    switch (type) {
      case EnumMap.Default:
        entityPromise = createDefault(engine);
        break;
      case EnumMap.Square:
        entityPromise = createSquare(engine, (progress: number) => {
          // 加载另一个地图的进度
          console.log("progress", progress);
        });
        break;
    }
    if (!entityPromise) {
      console.log("跳转不存在的地图:", EnumMap[type]);
      return;
    }
    SceneDataManager.setJumpState(EnumJumpMapState.Jumping);
    entityPromise
      .then((map: Entity) => {
        const preMap = SceneDataManager.getMap();
        SceneDataManager.setMap(map);
        engine.dispatch(ModuleEvent.beforeJumpMap, { preMap: preMap, curMap: map });
        preMap?.destroy();
        root.addChild(map);
        const avatarList = SceneDataManager.getAvatarList();
        for (let userId in avatarList) {
          const avatar = avatarList[userId];
          if (!avatar.data.isSelf) {
            SceneDataManager.delAvatar(userId);
            avatar.entity.destroy();
          } else {
            let bornPos = pos || SceneDataManager.getBornPosition(type);
            bornPos && avatar.control.setPosition(bornPos.x, bornPos.y, bornPos.z);
          }
        }
        SceneDataManager.setJumpState(EnumJumpMapState.Finish);
        engine.dispatch(ModuleEvent.afterJumpMap, { curMap: map });
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        SceneDataManager.setJumpState(EnumJumpMapState.Finish);
      });
  }
}
