import { Script, Vector3 } from "oasis-engine";

export default class Flow extends Script {
    private t: number
    private originY: number;
    onStart(): void {
      this.t = Date.now();
      this.originY = this.entity.transform.position.y;
    }
    onUpdate(deltaTime: number) {
      this.t += deltaTime;
      const y = this.originY + Math.sin(this.t / 500);
      this.entity.transform.position.y = y;
    }
}