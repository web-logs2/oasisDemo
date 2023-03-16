import { BoundingBox, BoxColliderShape, Script, StaticCollider, Matrix, Vector3, MeshRenderer, UnlitMaterial,  PBRMaterial } from "oasis-engine";
import { IEngineEvent } from "../components/interface";
export default class GlTFCollider extends Script {
    private _tempVec30: Vector3 = new Vector3();
    private _tempVec31: Vector3 = new Vector3();
  
    onStart(): void {

        const { entity } = this;
        const renderers = entity.getComponentsIncludeChildren(MeshRenderer, []);
        const boundingBox = renderers[0].bounds.clone();
        for (let i = renderers.length - 1; i > 0; i--) {
            BoundingBox.merge(boundingBox, renderers[i].bounds, boundingBox);
        }
        const worldPosition = new Vector3();
        const worldSize = new Vector3();
        const worldMatrix = new Matrix();
        // Calculate the position and size of the collider.
        boundingBox.getCenter(worldPosition);
        Vector3.subtract(boundingBox.max, boundingBox.min, worldSize);
        // Add entity and calculate the world matrix of the collider.
        const boxEntity = entity.createChild("box");
        boxEntity.transform.worldMatrix = worldMatrix.translate(worldPosition);
        // Add collider.
        const boxCollider = boxEntity.addComponent(StaticCollider);
        const boxColliderShape = new BoxColliderShape();
        // boxColliderShape.setSize(worldSize.x, worldSize.y, worldSize.z);
        boxColliderShape.size.set(worldSize.x, worldSize.y, worldSize.z);
        boxCollider.addShape(boxColliderShape);
        // Add click script.
        boxEntity.addComponent(Script).onPointerClick = () => {
        //   window.alert("click glTF!");
            console.log('onPointerClick', this.entity.name);
            this.engine.dispatch(IEngineEvent.onPointerClick, this.entity);
        };


    }

    // onStart(): void {
    //     const renderers = this.entity.getComponentsIncludeChildren(MeshRenderer, []);
    //     for (let i = renderers.length - 1; i >= 0; i--) {
    //         this._addBoundingBox(renderers[i]);
    //     }
    // }
  
    private _addBoundingBox(renderer: MeshRenderer): void {
      const { _tempVec30: localSize, _tempVec31: localPosition } = this;
      // Calculate the position and size of the collider.
      const boundingBox = renderer.mesh.bounds;
      const entity = renderer.entity;
      boundingBox.getCenter(localPosition);
      Vector3.subtract(boundingBox.max, boundingBox.min, localSize);
      // Add collider.
      const boxCollider = entity.addComponent(StaticCollider);
      const boxColliderShape = new BoxColliderShape();
      boxColliderShape.position.set(localPosition.x, localPosition.y, localPosition.z);
      // boxColliderShape.setSize(localSize.x, localSize.y, localSize.z);
      boxColliderShape.size.set(localSize.x, localSize.y, localSize.z)
      boxCollider.addShape(boxColliderShape);
      // Add click script.
      entity.addComponent(Script).onPointerClick = () => {
        // window.alert("Click:" + entity.name);
        console.log('onPointerClick', entity.parent.name)
      };
    }
  }