import { Script, PrimitiveMesh, BlinnPhongMaterial, UnlitMaterial,  PBRMaterial, MeshRenderer } from "oasis-engine";

export default class CameraViewHelper extends Script {
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
    // console.log(this.entity.transform.position)
    if(x !== this.x || y !== this.y || z !== this.z) {
      this.x = x
      this.y = y
      this.z = z
      // console.log(this.entity.transform.position)
      this.engine.dispatch('cameraChange', this.entity.transform.position)
    }
  }
  }