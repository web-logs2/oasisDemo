export enum TouchHandlerType {
  // 轮盘锁定，视角锁定
  JoyLockViewLock = 0b00,
  // 轮盘自由，视角锁定
  JoyFreeViewLock = 0b1,
  // 轮盘锁定，视角自由
  JoyLockViewFree = 0b10,
  // 轮盘自由，视角自由
  JoyFreeViewFree = 0b11
}
