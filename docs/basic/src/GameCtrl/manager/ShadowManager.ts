import { DirectLight, ShadowCascadesMode, ShadowResolution, ShadowType } from "oasis-engine";
import { GameCtrl } from "..";

export enum EnumShadowQuality {
  // 软阴影
  high,
  // 硬阴影
  middle,
  // 关闭阴影
  low
}

/**
 * 阴影管理
 * 控制阴影的一些参数
 */
export class ShadowManager {
  static setShadowQuality(quality: EnumShadowQuality) {
    const { scene } = GameCtrl.ins;
    const directLight = GameCtrl.ins.directLight.getComponent(DirectLight);
    switch (quality) {
      case EnumShadowQuality.high:
        directLight.shadowType = ShadowType.SoftLow;
        scene.shadowCascades = ShadowCascadesMode.TwoCascades;
        scene.shadowResolution = ShadowResolution.High;
        break;
      case EnumShadowQuality.middle:
        directLight.shadowType = ShadowType.Hard;
        scene.shadowCascades = ShadowCascadesMode.NoCascades;
        scene.shadowResolution = ShadowResolution.Medium;
        break;
      case EnumShadowQuality.low:
        directLight.shadowType = ShadowType.None;
        break;
    }
  }
}
