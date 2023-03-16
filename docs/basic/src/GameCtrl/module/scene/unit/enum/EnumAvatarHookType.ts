/**
 * 角色提供的生命周期钩子
 * 为了让不同配件在相应时刻执行对应的逻辑
 */
export enum EnumAvatarHookType {
  // 更新外观
  skinUpdate = 0x1,
  // 修改位置
  posUpdate = 0x2,
  // 物理检测
  PhysicsUpdate = 0x4,
  // onUpdate 开始
  StartUpdate = 0x8,
  // 检查摇杆
  JoyUpdate = 0x10,
  // onUpdate 结束
  EndUpdate = 0x20
}
