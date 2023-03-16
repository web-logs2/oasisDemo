import {
  Animator,
  AnimatorController,
  AnimatorControllerLayer,
  AnimatorStateMachine,
  AssetType,
  Component,
  GLTFResource,
  WrapMode
} from "oasis-engine";
import { EnumAnimationState } from "../enum/EnumAnimationState";

/**
 * 模型和动画
 */
export class AvatarModel extends Component {
  private _animator: Animator;
  private _stateName: string;

  play(stateName: string, speed: number = 1) {
    const { _animator: animator } = this;
    if (!animator) {
      return;
    }
    animator.speed = speed;
    if (this._stateName !== stateName && animator.findAnimatorState(stateName)) {
      animator.crossFade(stateName, 0.15);
      this._stateName = stateName;
    }
  }

  /**
   * 初始化这个模型与动画
   * @param modelUrl - 取这个 glTF 中的模型
   * @param animationUrl - 取这个 glTF 中的动画
   * @returns
   */
  init(modelUrl: string, animationUrl: string): Promise<void> {
    const { engine } = this;
    const list = [
      {
        type: AssetType.Prefab,
        url: modelUrl
      },
      { type: AssetType.Prefab, url: animationUrl }
    ];
    return engine.resourceManager.load(list).then((resArr) => {
      if (this.entity.destroyed) {
        return;
      }
      // console.log(list, resArr);
      // 网格资产
      const modelRoot = (<GLTFResource>resArr[0]).defaultSceneRoot.clone();
      this.entity.addChild(modelRoot);
      let animator = modelRoot.getComponent(Animator);
      if (!animator) {
        animator = modelRoot.addComponent(Animator);
        animator.animatorController = new AnimatorController();
        const layer = new AnimatorControllerLayer("base");
        animator.animatorController.addLayer(layer);
        layer.stateMachine = new AnimatorStateMachine();
      }
      this._animator = animator;
      const stateMachine = animator.animatorController.layers[0].stateMachine;
      // 动画资产
      const animationRes = <GLTFResource>resArr[1];
      const animations = animationRes.animations;
      for (let i = 0; i < animations.length; i++) {
        const animationClip = animations[i];
        const state = stateMachine.addState(animationClip.name);
        state.clip = animationClip;
      }
      // 初始化动画的播放模式
      animator.findAnimatorState(EnumAnimationState.Idle).wrapMode = WrapMode.Loop;
      animator.findAnimatorState(EnumAnimationState.Walk).wrapMode = WrapMode.Loop;
      animator.findAnimatorState(EnumAnimationState.Run).wrapMode = WrapMode.Loop;
      animator.findAnimatorState(EnumAnimationState.HeadShake).wrapMode = WrapMode.Once;
      animator.play(EnumAnimationState.Idle);
    });
  }
}
