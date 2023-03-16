import { EnumAnimationState } from "../enum/EnumAnimationState";
import { BehaviorBase } from "./BehaviorBase";
import { EnumBehavior } from "../enum/EnumBehavior";
import { MathUtil, Vector3 } from "oasis-engine";
import avatarConfig from "../../../../config/avatar.json";

/**
 * 示例行为 走到某个点
 */
export class BehaviorWalkTo extends BehaviorBase {
  private _startTime: number;
  private _endTime: number;
  private _tempVec: Vector3 = new Vector3();
  private _startPosition: Vector3 = new Vector3();
  private _targetPosition: Vector3 = new Vector3();

  init(): void {
    const { data } = this;
    this._startPosition.copyFrom(this.owner.entity.transform.worldPosition);
    this._targetPosition.copyFrom(data.data);
    Vector3.subtract(this._targetPosition, this._startPosition, this._tempVec);
    if (this._tempVec.length() <= MathUtil.zeroTolerance) {
      this.owner.behaviorControl.delBehavior(EnumBehavior.WalkTo);
    } else {
      this._startTime = this.owner.engine.time.nowTime;
      this._endTime = (this._tempVec.length() / avatarConfig.RunSpeed) * 1000 + this._startTime;
      data.onInitCallBack && data.onInitCallBack();
    }
  }

  update(): void {
    const { _startTime, _endTime, owner, _tempVec, _targetPosition } = this;
    const nowTime = owner.engine.time.nowTime;
    if (nowTime < _endTime) {
      const subTime = nowTime - _startTime;
      owner.animationState = EnumAnimationState.Run;
      Vector3.lerp(this._startPosition, _targetPosition, subTime / (_endTime - _startTime), _tempVec);
      owner.setPosition(_tempVec.x, _tempVec.y, _tempVec.z);
      Vector3.subtract(_targetPosition, this._startPosition, owner.speed);
      owner.speed.normalize().scale(avatarConfig.RunSpeed);
    } else {
      owner.animationState = EnumAnimationState.Idle;
      owner.setPosition(_targetPosition.x, _targetPosition.y, _targetPosition.z);
      owner.speed.set(0, 0, 0);
      owner.behaviorControl.delBehavior(EnumBehavior.WalkTo);
    }
  }
}
