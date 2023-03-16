import { Entity, Vector3 } from "oasis-engine";

export interface IEffect {
  play(parent: Entity, position: Vector3, speed: number, isLoop: boolean, onEnd?: () => any, onStart?: () => any);
  recycle();
}
