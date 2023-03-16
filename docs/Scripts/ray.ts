import { Camera, HitResult, Layer, MeshRenderer, PBRMaterial, PointerButton, Ray, Script } from 'oasis-engine'
export default class CameraRayCast extends Script {
    public camera: Camera;
    public ray = new Ray();
    public hit = new HitResult();
  
    onAwake() {
      this.camera = this.entity.getComponent(Camera);
      console.log('this.camera', this.camera)
    }
  
    onUpdate() {
      const engine = this.engine;
      const ray = this.ray;
      const hit = this.hit;
      const inputManager = this.engine.inputManager;
      const pointers = inputManager.pointers;
      if (pointers && inputManager.isPointerDown(PointerButton.Primary)) {
        const pointerPosition = pointers[0].position;
        
        this.camera.screenPointToRay(pointerPosition, ray);
  
        const result = engine.physicsManager.raycast(
          ray,
          Number.MAX_VALUE,
          Layer.Layer0,
          hit
        );
        if (result) {
          const mtl = new PBRMaterial(engine);
          mtl.baseColor.set(Math.random(), Math.random(), Math.random(), 1.0);
          mtl.metallic = 0.0;
          mtl.roughness = 0.5;
          console.log('click', hit.entity.name)
            // console.log(hit.entity)
        //   const meshes: MeshRenderer[] = [];
        //   hit.entity.getComponentsIncludeChildren(MeshRenderer, meshes);
        //   meshes.forEach((mesh: MeshRenderer) => {
        //     mesh.setMaterial(mtl);
        //   });
        } else {
          console.log('click nothing')
        }
      }
    }
  }