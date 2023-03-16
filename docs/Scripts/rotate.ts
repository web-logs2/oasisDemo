import { Script, Vector3 } from "oasis-engine";

export default class Rotate extends Script {
    private _tempVector = new Vector3(0, 1, 0);
    onUpdate() {
      this.entity.transform.rotate(this._tempVector);
    }
}