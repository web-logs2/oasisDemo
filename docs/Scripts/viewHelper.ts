import { Script } from "oasis-engine";

export default class ViewHelper extends Script {
    private x: number
    private y: number
    private z: number
    onStart(): void {
      const { x, y, z } = this.entity.transform.position;
      this.x = x
      this.y = y
      this.z = z
    }
    onUpdate() {
      const { x, y, z } = this.entity.transform.position;
      if(x !== this.x || y !== this.y || z !== this.z) {
        this.x = x
        this.y = y
        this.z = z
        this.engine.dispatch('avatarTargetChange', this.entity.transform.position)
      }
    }
}