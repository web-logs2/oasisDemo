import {
  AnimationClip,
  Animator,
  AnimatorState,
  AssetType,
  Entity,
  GLTFResource,
  Vector3,
  WrapMode
} from "oasis-engine";
import { GameCtrl } from "../..";
import { SceneDataManager } from "../scene/SceneDataManager";
import { EffectManager, EnumEffectType } from "./EffectManager";
import { EffectStateMachineScript } from "./EffectStateMachineScript";
import { IEffect } from "./IEffect";

export class EffectAvatarUV implements IEffect {
  private _promise: Promise<void>;
  private _root: Entity;
  private _animator: Animator;
  private _animatorState: AnimatorState;
  private _machineState: EffectStateMachineScript;

  play(parent: Entity, position: Vector3, speed: number, isLoop: boolean, onEnd?: () => any, onStart?: () => any) {
    if (!this._promise) {
      this._prepare();
    }
    const { x, y, z } = position;
    this._promise.then(() => {
      this._animatorState.wrapMode = WrapMode.Once;
      const { _machineState: machineState } = this;
      machineState.onStart = onStart;
      if (isLoop) {
        machineState.onEnd = onEnd;
      } else {
        machineState.onEnd = () => {
          this._recycle();
          onEnd && onEnd();
        };
      }
      const { _root: root } = this;
      parent.addChild(root);
      root.transform.setPosition(x, y, z);
      const scale = SceneDataManager.avatarScale;
      root.transform.setScale(scale, scale, scale);
      this._animator.play("Take 001", 0, 0);
      this._animator.speed = speed;
    });
  }

  recycle() {
    this._promise.then(this._recycle);
  }

  _recycle() {
    const { _machineState: machineState } = this;
    machineState.onStart = machineState.onEnd = null;
    this._root.parent = null;
    EffectManager.recycleEffect(EnumEffectType.Avatar_UV, this);
  }

  private _prepare() {
    const engine = GameCtrl.ins.engine;
    this._promise = engine.resourceManager
      .load([
        {
          url: "https://mdn.alipayobjects.com/oasis_be/afts/file/A*3yhnRLZUQZQAAAAAAAAAAAAADkp5AQ/1677148216060_zg.gltf",
          type: AssetType.Prefab
        },
        {
          url: "https://mdn.alipayobjects.com/oasis_be/afts/file/A*9WULRoATvYgAAAAAAAAAAAAADkp5AQ/1677148215770_zg.gltf",
          type: AssetType.Prefab
        }
      ])
      .then(([glTF1, glTF2]) => {
        const root = (this._root = (<GLTFResource>glTF1).defaultSceneRoot.clone());
        root.transform.setScale(1, 3, 1);
        const animator = (this._animator = root.getComponent(Animator));
        const animations = (<GLTFResource>glTF2).animations;
        const animatorStateMachine = animator.animatorController.layers[0].stateMachine;
        if (animations) {
          animations.forEach((clip: AnimationClip) => {
            const animatorState = animatorStateMachine.addState(clip.name);
            animatorState.clip = clip;
          });
        }
        const defaultState = (this._animatorState = animatorStateMachine.findStateByName("Take 001"));
        this._machineState = defaultState.addStateMachineScript(EffectStateMachineScript);
      });
  }
}
