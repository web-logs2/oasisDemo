export interface AvatarInfo {
  // 是否玩家本身
  isSelf: boolean;
  // id
  id: string;
  // 昵称
  nickName: string;
  // 头衔
  title: string;
  // 头像
  headImg: string;
  // 性别（ male | female ）
  sex: string;
  // 模型来源
  model: string;
  // 动画来源
  animation: string;
  // 位置
  position: { x: number; y: number; z: number };
  // 朝向
  rotation: number;
}
