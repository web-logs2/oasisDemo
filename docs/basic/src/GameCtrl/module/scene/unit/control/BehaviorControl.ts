import { AvatarControl } from "./AvatarControl";
import { BehaviorManager } from "../behavior/BehaviorManager";
import { IBehaviorData } from "../interface/IBehaviorData";
import { EnumBehavior } from "../enum/EnumBehavior";
import { BehaviorBase } from "../behavior/BehaviorBase";
import { EnumAttrCoverFlag } from "../enum/EnumAttrCoverFlag";

export class BehaviorControl {
  // 行为控制的拥有者
  owner: AvatarControl;

  private _curBehavior: BehaviorBase;
  private _behaviorState: number = EnumBehavior.Free;
  private _waitBehaviorList: { type: EnumBehavior; data: IBehaviorData }[] = [];

  /**
   * 增加行为
   * @param type
   * @param data
   */
  addBehavior(type: EnumBehavior, data?: IBehaviorData): void {
    this._waitBehaviorList.push({ type, data });
  }

  /**
   * 移除行为
   * @param type
   */
  delBehavior(type: EnumBehavior): void {
    const { _curBehavior: curBehavior } = this;
    if (curBehavior.type === type) {
      this._curBehavior = null;
      this._behaviorState = EnumBehavior.Free;
      curBehavior.exit();
      BehaviorManager.recycleBehavior(curBehavior);
    } else {
      console.error("移除不存在的行为" + type);
    }
  }

  /**
   * 是否有某种行为
   * @param type
   * @returns
   */
  hasBehavior(type: EnumBehavior): boolean {
    return (this._behaviorState & type) !== 0;
  }

  /**
   * 更新行为
   * @returns 返回生效的行为修改了角色的哪些属性
   */
  updateBehavior(): EnumAttrCoverFlag {
    let flag = EnumAttrCoverFlag.None;
    const { _waitBehaviorList: waitBehaviorList } = this;
    const { _curBehavior: curBehavior } = this;
    if (waitBehaviorList.length > 0) {
      const waitBehavior = waitBehaviorList[0];
      const { type, data } = waitBehavior;
      const replace = () => {
        const behavior = BehaviorManager.createBehavior(type);
        if (behavior) {
          this._behaviorState = type;
          this._curBehavior = behavior;
          flag |= BehaviorManager.getConfig(type).coverFlag;
          behavior.data = data;
          behavior.owner = this.owner;
          behavior.init && behavior.init();
          waitBehaviorList.shift();
        }
      };
      if (!curBehavior) {
        replace();
      } else {
        const curBehaviorConfig = BehaviorManager.getConfig(curBehavior.type);
        flag |= curBehaviorConfig.coverFlag;
        const prePriority = curBehaviorConfig.priority;
        const nowPriority = BehaviorManager.getConfig(type).priority;
        if (prePriority < nowPriority) {
          this.delBehavior(curBehavior.type);
          replace();
        }
      }
    }
    // 更新行为
    this._curBehavior?.update();
    return flag;
  }

  /**
   * 移除所有行为
   */
  destroy() {
    this._waitBehaviorList.length = 0;
    this._curBehavior?.exit();
  }

  constructor(control: AvatarControl) {
    this.owner = control;
  }
}
