export enum SocketEvent {
  /** Avatar */
  enterAvatar_ToG = "enterAvatar_ToG",
  quitAvatar_ToG = "quitAvatar_ToG"
}

export enum ModuleEvent {
  /** resize 适配 */
  screenResize = "onScreenResize",
  /** 添加行为 */
  addBehavior = "addBehavior",
  /** 跳转地图 */
  jumpMap = "jumpMap",
  /** 跳转地图前 */
  beforeJumpMap = "beforeJumpMap",
  /** 跳转地图后 */
  afterJumpMap = "afterJumpMap"
}
