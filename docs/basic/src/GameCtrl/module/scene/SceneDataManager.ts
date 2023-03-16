import { IAvatar } from "./unit/interface/IAvatar";
import { Entity, IVector3 } from "oasis-engine";
import { EnumJumpMapState } from "./map/enum/EnumJumpMapState";
import mapConfig from "../../config/map.json";
import { EnumMap } from "./map/enum/EnumMap";

export class SceneDataManager {
  /** 场景内所有的 Avatar 的缩放 */
  static avatarScale: number = 1;
  /** 主角 */
  static myAvatar: IAvatar;
  /** 场景内所有的 Avatar */
  private static _avatarList: Record<string, IAvatar> = {};
  /** 当前地图 */
  private static _curMap: Entity;
  /** 当前跳转地图的状态，在准备另一张地图是有加载时间的 */
  private static _jumpState: EnumJumpMapState = EnumJumpMapState.Finish;

  /** 获取地图 */
  static getMap(): Entity {
    return this._curMap;
  }

  /**
   * 设置地图
   * @param entity
   */
  static setMap(entity: Entity): void {
    this._curMap = entity;
  }

  /**
   * 获取出生地
   */
  static getBornPosition(type: EnumMap): IVector3 {
    if (mapConfig[EnumMap[type]]) {
      return mapConfig[EnumMap[type]];
    } else {
      console.log("map.json 中没有配置默认的跳转位置");
      return null;
    }
  }

  /**
   * 获取跳转地图的状态
   * @param entity
   */
  static getJumpState(): EnumJumpMapState {
    return this._jumpState;
  }

  /**
   * 设置跳转地图时的状态
   * @param entity
   */
  static setJumpState(state: EnumJumpMapState): void {
    this._jumpState = state;
  }

  /** Server */
  /**
   * 根据玩家 ID 获取 Avatar
   * @param userId - 玩家 ID
   * @returns
   */
  static getAvatar(userId: string): IAvatar {
    return this._avatarList[userId];
  }

  /**
   * 添加玩家
   * @param userId - 玩家 ID
   * @param avatar
   */
  static addAvatar(userId: string, avatar: IAvatar): void {
    this._avatarList[userId] = avatar;
    avatar.data.isSelf && (this.myAvatar = avatar);
  }

  /**
   * 删除玩家
   * @param userId - 玩家 ID
   */
  static delAvatar(userId: string): void {
    if (this.myAvatar && this.myAvatar.data.id === userId) {
      this.myAvatar = null;
    }
    delete this._avatarList[userId];
  }

  /**
   * 获取玩家人数
   */
  static getAvatarCount(): number {
    return Object.keys(this._avatarList).length;
  }

  /**
   * 获取当前场景所有玩家
   * @returns
   */
  static getAvatarList(): Record<string, IAvatar> {
    return this._avatarList;
  }
}
