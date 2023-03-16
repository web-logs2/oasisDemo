import { CapsuleColliderShape, CharacterController, ControllerCollisionFlag, Entity, Vector3 } from "oasis-engine";
import { GameCtrl } from "../../../..";
import { AvatarControl } from "../control/AvatarControl";
import { EnumAttrCoverFlag } from "../enum/EnumAttrCoverFlag";
import { EnumAvatarHookType } from "../enum/EnumAvatarHookType";
import { AccessoryBase } from "./AccessoryBase";

/**
 * 物理配件
 */
export class AccPhysics extends AccessoryBase {
  private _simulationEntity: Entity;
  private _controller: CharacterController;
  private _yAxisMove: Vector3 = new Vector3();
  private _fallAccumulateTime: number = 0;
  private _offsetY: number = 0.36;
  private _tempVec: Vector3 = new Vector3();
  private _needCheckFall: boolean = true;
  private _physicPositionFlag: boolean = true;

  hook(state: EnumAvatarHookType, ...arg): void {
    switch (state) {
      case EnumAvatarHookType.PhysicsUpdate:
        this._onPhysicsUpdate();
        break;
      case EnumAvatarHookType.StartUpdate:
        this._onStartUpdate();
        break;
      case EnumAvatarHookType.posUpdate:
        this._simulationEntity.transform.setWorldPosition(arg[0], arg[1] + this._offsetY, arg[2]);
        this._needCheckFall = true;
        break;
      default:
        break;
    }
  }

  destroy(): void {
    this._simulationEntity.destroy();
  }

  constructor(owner: AvatarControl) {
    super(owner);
    const simulationEntity = (this._simulationEntity = GameCtrl.ins.root.createChild("simulation"));
    const { position } = this._owner.entity.transform;
    simulationEntity.transform.setPosition(position.x, position.y + this._offsetY, position.z);
    const controller = (this._controller = simulationEntity.addComponent(CharacterController));
    const shape = new CapsuleColliderShape();
    // @ts-ignore
    shape.isSceneQuery = false;
    shape.radius = 0.15;
    shape.height = 0.2;
    controller.addShape(shape);
    this._addHookListener(
      EnumAvatarHookType.PhysicsUpdate | EnumAvatarHookType.StartUpdate | EnumAvatarHookType.posUpdate
    );
  }

  private _onPhysicsUpdate() {
    const { speed, coverFlag } = this._owner;
    const { _yAxisMove: yAxisMove, _controller: controller } = this;
    const { gravity, fixedTimeStep: delta } = this._owner.engine.physicsManager;
    if ((coverFlag & EnumAttrCoverFlag.Position) === 0 && (speed.x !== 0 || speed.z !== 0)) {
      this._tempVec.set(speed.x * delta, 0, speed.z * delta);
      controller.move(this._tempVec, 0.0001, delta);
      this._needCheckFall = this._physicPositionFlag = true;
    }
    if (this._needCheckFall) {
      this._fallAccumulateTime += delta;
      yAxisMove.y = gravity.y * delta * this._fallAccumulateTime;
      const flag = controller.move(yAxisMove, 0.0001, delta);
      if (flag & ControllerCollisionFlag.Down) {
        this._fallAccumulateTime = 0;
        this._needCheckFall = false;
      } else {
        this._needCheckFall = true;
      }
      this._physicPositionFlag = true;
    }
  }

  private _onStartUpdate() {
    // 更新位置
    if (this._physicPositionFlag) {
      const physicWorldPos = this._simulationEntity.transform.worldPosition;
      this._owner.entity.transform.setWorldPosition(
        physicWorldPos.x,
        physicWorldPos.y - this._offsetY,
        physicWorldPos.z
      );
      this._physicPositionFlag = false;
    }
  }
}
