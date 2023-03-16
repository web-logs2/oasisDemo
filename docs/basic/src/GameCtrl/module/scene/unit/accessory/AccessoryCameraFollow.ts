import { TouchManager } from "../../../touch/TouchManager";
import { AvatarControl } from "../control/AvatarControl";
import { EnumAvatarHookType } from "../enum/EnumAvatarHookType";
import { AccessoryBase } from "./AccessoryBase";

/**
 * 相机跟随配件
 */
export class AccessoryCameraFollow extends AccessoryBase {
  hook(state: EnumAvatarHookType, ...arg): void {
    // EnumAvatarHookType.EndUpdate 阶段触发相机跟随
    TouchManager.viewControl.update();
  }

  constructor(owner: AvatarControl) {
    super(owner);
    TouchManager.viewControl.targetEntity = owner.entity;
    this._addHookListener(EnumAvatarHookType.EndUpdate);
  }
}
