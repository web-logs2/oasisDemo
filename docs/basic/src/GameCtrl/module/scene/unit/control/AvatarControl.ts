import { Entity, Script, Vector3 } from "oasis-engine";
import { getRotationByPoint } from "../../Util";
import { BehaviorControl } from "./BehaviorControl";
import { EnumAvatarHookType } from "../enum/EnumAvatarHookType";
import { AvatarModel } from "../ui/AvatarModel";
import { EnumAnimationState } from "../enum/EnumAnimationState";
import { AvatarTitle } from "../ui/AvatarTitle";
import { AvatarInfo } from "../../../../socket/AvatarInfo";
import { AccessoryControl } from "./AccessoryControl";
import avatarConfig from "../../../../config/avatar.json";
import { AccessoryJoy } from "../accessory/AccessoryJoy";
import { AccessoryCameraFollow } from "../accessory/AccessoryCameraFollow";
import { AccPhysics } from "../accessory/AccessoryPhysics";
import { EnumAttrCoverFlag } from "../enum/EnumAttrCoverFlag";

export class AvatarControl extends Script {
  // 朝向容错（角度制）
  private static _rotationTolerance: number = 1;

  // 速度矢量
  speed: Vector3 = new Vector3();
  // 动画状态
  animationState: EnumAnimationState = EnumAnimationState.Idle;
  // 动画速度
  animationSpeed: number = 1;
  // 覆盖标记(行为覆盖了哪些属性)
  coverFlag: EnumAttrCoverFlag = EnumAttrCoverFlag.None;
  // 行为管理
  behaviorControl: BehaviorControl;
  // 配件管理
  accessoryControl: AccessoryControl;

  // 模型节点
  private _modelEntity: Entity;
  private _modelControl: AvatarModel;
  // 昵称节点
  private _titleEntity: Entity;
  private _titleControl: AvatarTitle;

  setData(val: AvatarInfo) {
    const { transform } = this.entity;
    transform.position.copyFrom(val.position);
    transform.setRotation(0, val.rotation, 0);
    this._modelControl.init(val.model, val.animation).then(() => {
      if (this.entity.destroyed) {
        return;
      }
      this.engine.dispatch("avatarModelLoaded",{
        val,
        modelEntity: this._modelEntity
      });
      this.accessoryControl.hook(EnumAvatarHookType.skinUpdate);
    });
    this._titleControl.init(val.nickName);
    if (val.isSelf) {
      this.accessoryControl.addAccessory(AccessoryJoy);
      this.accessoryControl.addAccessory(AccessoryCameraFollow);
      this.accessoryControl.addAccessory(AccPhysics);
    }
  }

  setRotate(rotation: number) {
    this.entity.transform.setWorldRotation(0, rotation, 0);
  }

  setScale(scale: number) {
    this._modelEntity.transform.setScale(scale, scale, scale);
  }

  setPosition(x: number, y: number, z: number) {
    this.entity.transform.setWorldPosition(x, y, z);
    this.accessoryControl.hook(EnumAvatarHookType.posUpdate, x, y, z);
  }

  onPhysicsUpdate(): void {
    this.accessoryControl.hook(EnumAvatarHookType.PhysicsUpdate);
  }

  onUpdate(deltaTime: number) {
    const { accessoryControl: accessory } = this;
    accessory.hook(EnumAvatarHookType.StartUpdate);
    accessory.hook(EnumAvatarHookType.JoyUpdate);
    this.coverFlag = this.behaviorControl.updateBehavior();
    this._updateAnimationSpeed();
    this._updateRotation(deltaTime);
    this._modelControl.play(this.animationState, this.animationSpeed);
    accessory.hook(EnumAvatarHookType.EndUpdate);
  }

  onDestroy(): void {
    this.behaviorControl.destroy();
    this.accessoryControl.destroy();
  }

  constructor(entity: Entity) {
    super(entity);
    this._modelEntity = entity.createChild("model");
    this._modelControl = this._modelEntity.addComponent(AvatarModel);
    this._titleEntity = entity.createChild("title");
    this._titleControl = this._titleEntity.addComponent(AvatarTitle);
    this.behaviorControl = new BehaviorControl(this);
    this.accessoryControl = new AccessoryControl(this);
  }

  private _updateRotation(delta: number): void {
    if (this.coverFlag & EnumAttrCoverFlag.Rotation) {
      return;
    }
    const { speed } = this;
    if (speed.x != 0 || speed.z != 0) {
      const { transform } = this.entity;
      const e = transform.worldMatrix.elements;
      let preRotation = getRotationByPoint(e[8], e[10]);
      let curRotation = getRotationByPoint(speed.x, speed.z);
      let subDegree = curRotation - preRotation;
      if (subDegree > 180) {
        preRotation += 360;
        subDegree -= 360;
      } else if (subDegree < -180) {
        curRotation += 360;
        subDegree += 360;
      }
      if (Math.abs(subDegree) < AvatarControl._rotationTolerance) {
        // 没有转向
      } else {
        const degree = (delta / 1000) * 480;
        if (Math.abs(subDegree) > degree) {
          curRotation = preRotation + Math.sign(subDegree) * degree;
        }
        // 当前朝向与速度方向需要做一个三角函数转换
        if (Math.abs(subDegree) >= 90) {
          speed.set(0, 0, 0);
        } else {
          speed.scale(Math.cos((subDegree / 180) * Math.PI));
        }
        transform.setWorldRotation(0, curRotation, 0);
      }
    }
  }

  private _updateAnimationSpeed(): void {
    if (this.coverFlag & EnumAttrCoverFlag.AnimationSpeed) {
      return;
    }
    switch (this.animationState) {
      case EnumAnimationState.Run:
        this.animationSpeed = Math.max(0.5, this.speed.length() / avatarConfig.RunSpeed);
        break;
      case EnumAnimationState.Walk:
        this.animationSpeed = Math.max(0.5, this.speed.length() / avatarConfig.WalkSpeed);
        break;
      default:
        this.animationSpeed = 1;
        break;
    }
  }
}
