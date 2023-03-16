export interface IBehaviorData {
  // 行为数据
  data: any;
  // 初始化回调
  onInitCallBack?: () => any;
  // 更新回调
  onUpdateCallBack?: () => any;
  // 退出回调
  onExitCallBack?: () => any;
}
