import { AvatarControl } from "../control/AvatarControl";
import { EnumBehavior } from "../enum/EnumBehavior";
import { IBehaviorData } from "../interface/IBehaviorData";

/**
 * 行为基类
 */
export abstract class BehaviorBase {
  readonly type: EnumBehavior;
  // 行为的拥有者
  owner: AvatarControl;
  // 行为携带的数据
  data: IBehaviorData;

  init(): void {
    if (this.data?.onInitCallBack) {
      this.data.onInitCallBack();
    }
  }

  update(): void {
    if (this.data?.onUpdateCallBack) {
      this.data.onUpdateCallBack();
    }
  }

  exit(): void {
    if (this.data?.onExitCallBack) {
      this.data.onExitCallBack();
    }
  }

  constructor(type: EnumBehavior) {
    this.type = type;
  }
}
