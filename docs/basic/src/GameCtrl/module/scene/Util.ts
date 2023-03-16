import { Entity, MathUtil, Vector2, Vector3 } from "oasis-engine";
import { GameCtrl } from "../..";

/**
 * 获取 avatar 看向某点时的世界 Y 旋转
 * @param x - 相对 x
 * @param z - 相对 y
 * @returns
 */
export function getRotationByPoint(x: number, z: number): number {
  return Math.atan2(x, z) * MathUtil.radToDegreeFactor;
}

/**
 * 获取 avatar 看向另一个 Avatar 时的世界 Y 旋转
 * @param me - 需要看的 Avatar
 * @param target - 目标 Avatar
 */
export function getRotationByEntity(me: Entity, target: Entity): number {
  const targetPosition = target.transform.worldPosition;
  const myPosition = me.transform.worldPosition;
  return Math.atan2(targetPosition.x - myPosition.x, targetPosition.z - myPosition.z) * MathUtil.radToDegreeFactor;
}

/**
 * 根据摇杆的偏移量得到此时的速度
 * @param deltaVec - JoyControl 得到的偏移量
 * @param out - 求得的速度
 */
export function getSpeed(deltaVec: Vector2, out: Vector3) {
  const ele = GameCtrl.ins.camera.transform.worldMatrix.elements;
  let x = -ele[8];
  let z = -ele[10];
  const length = Math.sqrt(x ** 2 + z ** 2);
  x /= length;
  z /= length;
  const { x: dx, y: dy } = deltaVec;
  out.x = dx * z + dy * x;
  out.z = -dx * x + dy * z;
}

/**
 * 规范昵称
 */
export function formatNickName(nickName: string): string {
  const reg =
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi;
  return nickName.replace(reg, "") || "用户";
}
