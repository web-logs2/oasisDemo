import { Entity, Vector3 } from "oasis-engine";
import { IEffect } from "./IEffect";
import { EffectAvatarUV } from "./EffectAvatarUV";

export enum EnumEffectType {
  Avatar_UV
}

export class EffectManager {
  private static _effectPool: Record<number, IEffect[]> = {};
  private static _downgradeMap = {};

  /**
   * 播放特效
   * @param type - effect 类型
   * @param parent - 父节点
   * @param position - 局部坐标
   * @param speed - 播放速度
   * @param isLoop - 是否循环
   * @param onEnd - 结束回调
   * @param onStart - 开始回调
   * @param supportDowngrade - 是否支持降级（若 EffectManager.downgrade
   *                           为 true 且本特效支持降级，则不播放效果直接回调）
   * @returns
   */
  static play(
    type: EnumEffectType,
    parent: Entity,
    position: Vector3,
    speed?: number,
    isLoop?: boolean,
    onEnd?: () => any,
    onStart?: () => any
  ) {
    if (this._downgradeMap[type]) {
      onStart && onStart();
      onEnd && onEnd();
      return;
    }
    speed === undefined && (speed = 1);
    const effect = this._getEffectFromPool(type);
    effect && effect.play(parent, position, speed, isLoop, onEnd, onStart);
  }

  static recycleEffect(type: EnumEffectType, effect: IEffect) {
    if (!this._effectPool[type]) {
      this._effectPool[type] = [effect];
    } else {
      this._effectPool[type].push(effect);
    }
  }

  static downgradeEffect(effectType: EnumEffectType, downgrade: boolean) {
    this._downgradeMap[effectType] = downgrade;
  }

  private static _getEffectFromPool(type: EnumEffectType): IEffect {
    const pool = this._effectPool[type];
    if (pool && pool.length > 0) {
      return pool.pop();
    }
    switch (type) {
      case EnumEffectType.Avatar_UV:
        return new EffectAvatarUV();
      default:
        break;
    }
  }
}
