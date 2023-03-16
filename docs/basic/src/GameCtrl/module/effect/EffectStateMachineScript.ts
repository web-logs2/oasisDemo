import { Animator, AnimatorState, StateMachineScript } from "oasis-engine";

export class EffectStateMachineScript extends StateMachineScript {
  onStart: () => any;
  onEnd: () => any;

  onStateEnter(animator: Animator, animatorState: AnimatorState, layerIndex: number): void {
    this.onStart && this.onStart();
  }

  onStateExit(animator: Animator, animatorState: AnimatorState, layerIndex: number): void {
    this.onEnd && this.onEnd();
  }
}
