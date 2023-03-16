import { SceneModule } from "../module/scene/SceneModule";
import { TouchManager } from "../module/touch/TouchManager";
import { UIManager } from "./UIManager";
import { GameCtrl } from "../index";

export class ModuleManager {
  sceneModule: SceneModule | null;

  init() {
    // const { engine } = GameCtrl.ins;
    UIManager.init();
    TouchManager.init();
    
    this.sceneModule = new SceneModule();
  }

  destroy() {
    this.sceneModule = null;
  }
}
