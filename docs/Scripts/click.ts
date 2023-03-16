import { Script, PointerButton, BlinnPhongMaterial, UnlitMaterial,  PBRMaterial } from "oasis-engine";
import { FramebufferPicker } from 'oasis-engine-toolkit';

export default class ClickScript extends Script {
    material: PBRMaterial | BlinnPhongMaterial | UnlitMaterial;
    framebufferPicker: FramebufferPicker;
    onUpdate(): void {
      const inputManager = this.engine.inputManager;
      const { pointers } = inputManager;
      if (pointers && inputManager.isPointerDown(PointerButton.Primary)) {
        if (pointers.length > 0) {
          const pointerPosition = pointers[0].position;
          this.framebufferPicker.pick(pointerPosition.x, pointerPosition.y).then((renderElement) => {
            console.log(renderElement)
            if (renderElement) {
              this.material.baseColor.set(1, 0, 0, 1);
            } else {
              this.material.baseColor.set(1, 1, 1, 1);
            }
          });
        }
      }
    }
  }