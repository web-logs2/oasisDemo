import { Pointer, PointerButton, PointerPhase, Script } from "oasis-engine";
import { CachePointer } from "./enum/ICachePointer";
import { PointerType } from "./enum/IPointerType";
import { TouchHandlerType } from "./enum/ITouchHandlerType";
import { TouchManager } from "./TouchManager";
import joyConfig from "../../config/joy.json";

export class TouchControl extends Script {
  private _cachePointers: CachePointer[] = [];

  // 更新 touch
  onUpdate() {
    const { _cachePointers: cachePointers } = this;
    if (TouchManager.handlerType === TouchHandlerType.JoyLockViewLock) {
      cachePointers.length = 0;
    } else {
      const { engine } = this;
      const { inputManager } = engine;
      const { pointers } = inputManager;
      const pointerLength = pointers.length;
      let isActive = inputManager.isPointerHeldDown(PointerButton.Primary);
      if (isActive) {
        // 先更新 pointer
        for (let i = pointerLength - 1; i >= 0; i--) {
          const pointer = pointers[i];
          let index = cachePointers.findIndex((value) => {
            return value.id === pointer.id;
          });
          if (index >= 0) {
            switch (pointer.phase) {
              case PointerPhase.Leave:
                cachePointers.splice(index, 1);
                break;
              default:
                const cacheP = cachePointers[index];
                cacheP.dx = pointer.position.x - cacheP.x;
                cacheP.dy = pointer.position.y - cacheP.y;
                cacheP.x = pointer.position.x;
                cacheP.y = pointer.position.y;
                break;
            }
          } else {
            if (pointer.phase !== PointerPhase.Leave) {
              const pointerType = this._getPointerType(pointer);
              cachePointers.push({
                type: pointerType,
                id: pointer.id,
                x: pointer.position.x,
                y: pointer.position.y,
                dx: 0,
                dy: 0
              });
            }
          }
        }
      } else {
        cachePointers.length = 0;
      }
    }
    TouchManager.joyControl.update();
  }

  private _getPointerType(pointer: Pointer) {
    if ((TouchManager.handlerType & TouchHandlerType.JoyFreeViewLock) === 0) {
      return PointerType.Scene;
    }
    const { joyRect } = joyConfig;
    const { width, height } = this.engine.canvas;
    let { x, y } = pointer.position;
    x /= width;
    y /= height;
    if (x >= joyRect.x && x <= joyRect.x + joyRect.width && y >= joyRect.y && y <= joyRect.y + joyRect.height) {
      return PointerType.Joy;
    } else {
      return PointerType.Scene;
    }
  }

  getPointers(type: PointerType, out: CachePointer[]) {
    const { _cachePointers: cachePointers } = this;
    out.length = 0;
    for (let i = cachePointers.length - 1; i >= 0; i--) {
      if (cachePointers[i].type === type) {
        out.push(cachePointers[i]);
      }
    }
  }
}
