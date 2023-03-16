import { Camera, CameraClearFlags, Entity, Layer, Vector2, Vector3 } from "oasis-engine";
import { GameCtrl } from "..";
import { ModuleEvent } from "../event";

export enum EnumAdapterType {
  // 按高适配
  FitToHeight,
  // 按宽适配
  FitToWidth
}

export class UIManager {
  public static layer: Layer = Layer.Layer20;
  public static uiRoot: Entity;
  public static scaleVec: Vector3 = new Vector3();
  public static designHeight = 1624;
  public static designWidth = 750;

  /**
   *
   * @param designHeight
   * @param designWidth
   * @param adapterType
   */
  static init(
    designHeight: number = 1624,
    designWidth: number = 750,
    adapterType: EnumAdapterType = EnumAdapterType.FitToHeight
  ): void {
    const { engine, scene } = GameCtrl.ins;
    const uiRoot = (this.uiRoot = scene.createRootEntity("ui"));
    uiRoot.layer = this.layer;
    const cameraEntity = uiRoot.createChild("Camera");
    const camera = cameraEntity.addComponent(Camera);
    camera.clearFlags = CameraClearFlags.None;
    camera.isOrthographic = true;
    camera.priority = 10;
    camera.cullingMask = this.layer;
    const fitToDesign = (type: EnumAdapterType) => {
      let scale: number;
      switch (adapterType) {
        case EnumAdapterType.FitToHeight:
          scale = designHeight / engine.canvas.height;
          this.designHeight = designHeight;
          this.designWidth = scale * engine.canvas.width;
          break;
        case EnumAdapterType.FitToWidth:
          scale = designWidth / engine.canvas.width;
          this.designWidth = designWidth;
          this.designHeight = scale * engine.canvas.height;
          break;
        default:
          break;
      }
      camera.orthographicSize = designHeight / 2;
      this.scaleVec.set(scale, scale, 1);
    };
    // 按照设计尺寸初始化正交相机
    fitToDesign(adapterType);
    GameCtrl.ins.engine.on(ModuleEvent.screenResize, () => {
      fitToDesign(adapterType);
    });
  }

  private static _tempVec2: Vector2 = new Vector2();
  private static _tempVec3: Vector3 = new Vector3();

  static screenTo2DWorld(screenPosition: Vector2, out: Vector3): Vector3 {
    const { engine } = GameCtrl.ins;
    // 屏幕空间映射 viewport
    const { _tempVec2: tempVec } = this;
    const { width: canvasWidth, height: canvasHeight } = engine.canvas;
    tempVec.set(screenPosition.x / canvasWidth, screenPosition.y / canvasHeight);
    // viewport 映射二维空间
    const screenX = this.designWidth * (2 * tempVec.x - 1) * 0.5;
    const screenY = this.designHeight * (1 - 2 * tempVec.y) * 0.5;
    out.x = screenX;
    out.y = screenY;
    return out;
  }

  static ThreeDWorldToScreen(position: Vector3, out: Vector3): Vector3 {
    const { camera, engine } = GameCtrl.ins;
    const { _tempVec3: tempVec } = this;
    // 世界空间映射 viewport
    camera.getComponent(Camera).worldToViewportPoint(position, tempVec);
    // viewport 映射屏幕空间
    const { width: canvasWidth, height: canvasHeight } = engine.canvas;
    const screenX = canvasWidth * (2 * tempVec.x - 1) * 0.5;
    const screenY = canvasHeight * (1 - 2 * tempVec.y) * 0.5;
    out.x = screenX;
    out.y = screenY;
    out.z = tempVec.z;
    return out;
  }

  static ViewportToWorld(viewportPosition: Vector2, out: Vector3): Vector3 {
    // viewport 映射二维空间
    const screenX = this.designWidth * (2 * viewportPosition.x - 1) * 0.5;
    const screenY = this.designHeight * (1 - 2 * viewportPosition.y) * 0.5;
    out.x = screenX;
    out.y = screenY;
    return out;
  }
}
