import { AvatarControl } from "../control/AvatarControl";
import { EnumAvatarHookType } from "../enum/EnumAvatarHookType";

/**
 * 配件基类
 */
export abstract class AccessoryBase {
  // 配件监听的钩子
  listenerFlag: number = 0;
  // 配件的拥有者
  protected _owner: AvatarControl;

  hook(state: EnumAvatarHookType, ...arg): void {}
  destroy(): void {}

  constructor(owner: AvatarControl) {
    this._owner = owner;
  }

  /**
   * 为了优化性能，可以让这个配件只监听角色的某个时刻
   * 比如：物理配置只需要监听角色的 physicsUpdate
   * @param hookType - 监听角色的钩子类型
   */
  protected _addHookListener(hookType: EnumAvatarHookType): void {
    this.listenerFlag |= hookType;
  }
}
