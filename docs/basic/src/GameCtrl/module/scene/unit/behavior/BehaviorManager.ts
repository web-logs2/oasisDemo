import { EnumBehavior } from "../enum/EnumBehavior";
import { BehaviorBase } from "./BehaviorBase";
import { BehaviorWalkTo } from "./BehaviorWalkTo";
import behaviorConfig from "../../../../config/behavior.json";

/**
 *  行为管理器
 *  管理角色行为
 */
export class BehaviorManager {
  // 行为回收池
  private static _behaviorPool: BehaviorBase[][] = [];
  // 行为类映射
  private static _behaviorClsMap: (new (type: EnumBehavior) => BehaviorBase)[] = [];

  /**
   * 注册行为
   * @param type
   * @param cls
   */
  static regBehavior(type: EnumBehavior, cls: new (type: EnumBehavior) => BehaviorBase): void {
    this._behaviorClsMap[type] = cls;
  }

  /**
   * 根据行为类型获取行为
   * @param behaviorType
   * @returns
   */
  static createBehavior(behaviorType: EnumBehavior): BehaviorBase {
    let pool = this._behaviorPool[behaviorType];
    if (!pool) {
      pool = [];
    }
    if (pool.length <= 0) {
      const cls = this._behaviorClsMap[behaviorType];
      if (cls) {
        return new cls(behaviorType);
      } else {
        console.error("请在 regBehavior 中注册行为类");
        return null;
      }
    } else {
      return pool.pop();
    }
  }

  /**
   * 获取行为配置，用来判断行为的优先级
   * @param behaviorType
   */
  static getConfig(behaviorType: EnumBehavior) {
    return behaviorConfig[EnumBehavior[behaviorType]];
  }

  /**
   * 回收行为
   * @param behavior
   */
  static recycleBehavior(behavior: BehaviorBase): void {
    behavior.data = null;
    behavior.owner = null;
    const { type } = behavior;
    if (!this._behaviorPool[type]) {
      this._behaviorPool[type] = [behavior];
    } else {
      this._behaviorPool[type].push(behavior);
    }
  }
}

BehaviorManager.regBehavior(EnumBehavior.WalkTo, BehaviorWalkTo);
