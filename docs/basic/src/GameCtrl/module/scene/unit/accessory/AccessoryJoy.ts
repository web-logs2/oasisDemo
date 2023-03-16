import { TouchManager } from "../../../touch/TouchManager";
import { getSpeed } from "../../Util";
import { EnumAvatarHookType } from "../enum/EnumAvatarHookType";
import { AccessoryBase } from "./AccessoryBase";
import { EnumAnimationState } from "../enum/EnumAnimationState";
import avatarConfig from "../../../../config/avatar.json";
import { AvatarControl } from "../control/AvatarControl";

/**
 * 摇杆配件
 */
export class AccessoryJoy extends AccessoryBase {
  hook(state: EnumAvatarHookType, ...arg): void {
    // EnumAvatarHookType.JoyUpdate 阶段触发摇杆逻辑
    const { _owner: owner } = this;
    const { speed } = owner;
    const deltaVec = TouchManager.getJoyDelta();
    if (!!deltaVec.x || !!deltaVec.y) {
      getSpeed(deltaVec, speed);
      speed.scale(avatarConfig.MaxSpeed);
      if (speed.length() > avatarConfig.WalkEdge) {
        owner.animationState = EnumAnimationState.Run;
      } else {
        owner.animationState = EnumAnimationState.Walk;
      }
    } else {
      speed.set(0, 0, 0);
      owner.animationState = EnumAnimationState.Idle;
    }
  }

  constructor(owner: AvatarControl) {
    super(owner);
    this._addHookListener(EnumAvatarHookType.JoyUpdate);
  }
}
