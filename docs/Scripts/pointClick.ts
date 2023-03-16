import { Script, PointerButton, BlinnPhongMaterial, MeshRenderer } from "oasis-engine";
export default class PointClick extends Script {
    private material: BlinnPhongMaterial;
    onStart() {
        console.log('onStart')
        // this.entity.getComponentsIncludeChildren()
        const meshRenderer = this.entity.getComponent(MeshRenderer);
        if(meshRenderer){ 
            this.material = <BlinnPhongMaterial>meshRenderer.getInstanceMaterial();
        } else {
            this.material = <BlinnPhongMaterial>this.entity.getComponentsIncludeChildren(MeshRenderer, [])[0].getInstanceMaterial();
        }
    //   this.material = getComponent(MeshRenderer).getInstanceMaterial();
    }
  
    onPointerClick() {
        console.log('onPointerClick')
      this.material.baseColor.set(Math.random(), Math.random(), Math.random(), 1.0);
    }
}