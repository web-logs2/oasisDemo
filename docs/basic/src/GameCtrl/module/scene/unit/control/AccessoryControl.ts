import { EnumAvatarHookType } from "../enum/EnumAvatarHookType";
import { AvatarControl } from "./AvatarControl";
import { AccessoryBase } from "../accessory/AccessoryBase";

export class AccessoryControl {
  // 配件的拥有者
  private _owner: AvatarControl;
  // 配件列表
  private _accessories: AccessoryBase[] = [];

  /**
   * 增加配件
   * @param type
   * @param data
   */
  addAccessory<T extends AccessoryBase>(type: new (owner: AvatarControl) => T): T {
    const accessory = new type(this._owner);
    this._accessories.push(accessory);
    return accessory;
  }

  /**
   * 移除配件
   * @param type
   * @param data
   */
  getAccessory<T extends AccessoryBase>(type: new (owner: AvatarControl) => T): T {
    const { _accessories: accessories } = this;
    for (let i = 0, l = accessories.length; i < l; i++) {
      const accessory = accessories[i];
      if (accessory instanceof type) {
        return accessory;
      }
    }
    return null;
  }

  /**
   * 移除配件
   * @param type
   */
  delAccessory(type: new (owner: AvatarControl) => AccessoryBase) {
    const { _accessories: accessories } = this;
    for (let i = accessories.length - 1; i >= 0; i--) {
      if (accessories[i] instanceof type) {
        accessories.splice(i, 1);
      }
    }
  }

  /**
   * 角色钩子回调触发配件相应逻辑的更新
   * @param state
   * @param arg
   */
  hook(state: EnumAvatarHookType, ...arg): void {
    const { _accessories: accessories } = this;
    for (let i = 0, l = accessories.length; i < l; i++) {
      const accessory = accessories[i];
      (accessory.listenerFlag & state) !== 0 && accessory.hook(state, ...arg);
    }
  }

  destroy() {
    const { _accessories: accessories } = this;
    for (let i = 0, l = accessories.length; i < l; i++) {
      accessories[i].destroy();
    }
    accessories.length = 0;
  }

  constructor(control: AvatarControl) {
    this._owner = control;
  }
}
