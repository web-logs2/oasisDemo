import {
  AssetPromise,
  BackgroundMode,
  BlinnPhongMaterial,
  Engine,
  Entity,
  MeshRenderer,
  PlaneColliderShape,
  PrimitiveMesh,
  StaticCollider
} from "oasis-engine";

/**
 * 默认场景
 * ps. 考虑到没有编辑器的情况下，可能有多个地图，且每个场景都比较复杂
 * 所以把创建不同地图的函数放在不同文件中，减少修改与冲突
 * ps. 场景中我们保证整体的方向光不变（控制阴影），相机与主角节点不变，
 * 可以通过改变天空盒与地图节点内的布局来切换`场景`
 * @param engine
 * @returns
 */
export function createDefault(engine: Engine): AssetPromise<Entity> {
  return new AssetPromise((resolve, reject) => {
    const scene = engine.sceneManager.activeScene;
    scene.background.mode = BackgroundMode.SolidColor;
    // 初始化地板
    const map = new Entity(engine, "squareMap");
    const planeEntity = map.createChild("plane");
    const planeRenderer = planeEntity.addComponent(MeshRenderer);
    planeRenderer.mesh = PrimitiveMesh.createPlane(engine, 100, 100);
    planeRenderer.setMaterial(new BlinnPhongMaterial(engine));
    const physicsPlane = new PlaneColliderShape();
    physicsPlane.isTrigger = false;
    planeEntity.addComponent(StaticCollider).addShape(physicsPlane);
    resolve(map);
  });
}
