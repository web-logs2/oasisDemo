import {
  AssetPromise,
  AssetType,
  BackgroundMode,
  BlinnPhongMaterial,
  BoundingBox,
  BoxColliderShape,
  Engine,
  Entity,
  GLTFResource,
  MeshRenderer,
  PlaneColliderShape,
  PrimitiveMesh,
  SkyBoxMaterial,
  StaticCollider,
  TextureCube,
  Vector3
} from "oasis-engine";

/**
 * 广场场景
 * @param engine
 * @returns
 */
export function createSquare(engine: Engine, onprogress?: (progress: number) => any): AssetPromise<Entity> {
  return (
    engine.resourceManager
      //@ts-ignore
      .load<[TextureCube, GLTFResource]>([
        {
          urls: [
            "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*5w6_Rr6ML6IAAAAAAAAAAAAAARQnAQ",
            "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*TiT2TbN5cG4AAAAAAAAAAAAAARQnAQ",
            "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*8GF6Q4LZefUAAAAAAAAAAAAAARQnAQ",
            "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*D5pdRqUHC3IAAAAAAAAAAAAAARQnAQ",
            "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_FooTIp6pNIAAAAAAAAAAAAAARQnAQ",
            "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*CYGZR7ogZfoAAAAAAAAAAAAAARQnAQ"
          ],
          type: AssetType.TextureCube
        },
        {
          url: "https://gw.alipayobjects.com/os/bmw-prod/d6dbf161-48e2-4e6d-bbca-c481ed9f1a2d.gltf",
          type: AssetType.Prefab
        }
      ])
      .onProgress((progress: number) => {
        onprogress && onprogress(progress);
      })
      .then(([cubeMap, gLtfResource]) => {
        const background = engine.sceneManager.activeScene.background;
        background.mode = BackgroundMode.Sky;
        const skyMaterial = (background.sky.material = new SkyBoxMaterial(engine));
        skyMaterial.textureCubeMap = cubeMap;
        background.sky.mesh = PrimitiveMesh.createCuboid(engine, 2, 2, 2);
        // 初始化地板
        const map = new Entity(engine, "squareMap");
        const planeEntity = map.createChild("plane");
        const planeRenderer = planeEntity.addComponent(MeshRenderer);
        planeRenderer.mesh = PrimitiveMesh.createPlane(engine, 100, 100);
        planeRenderer.setMaterial(new BlinnPhongMaterial(engine));
        const physicsPlane = new PlaneColliderShape();
        physicsPlane.isTrigger = false;
        planeEntity.addComponent(StaticCollider).addShape(physicsPlane);
        // 放置几个物体
        for (let i = 0; i < 3; i++) {
          const model = map.createChild("model" + i);
          const cloneEntity = gLtfResource.defaultSceneRoot.clone();
          model.addChild(cloneEntity);
          model.transform.setPosition(5 * (i - 1), 0, 5 * (i - 1) - 2);
          model.transform.setScale(4, 4, 4);

          const meshArr = cloneEntity.getComponentsIncludeChildren(MeshRenderer, []);
          if (meshArr.length > 0) {
            const boundingBox = meshArr[0].bounds.clone();
            for (let j = 1; j < meshArr.length; j++) {
              BoundingBox.merge(boundingBox, meshArr[j].bounds, boundingBox);
            }
            const worldSize = boundingBox.getExtent(new Vector3()).scale(2);
            const worldPos = boundingBox.getCenter(new Vector3());
            const colliderEntity = map.createChild();
            const collider = colliderEntity.addComponent(StaticCollider);
            const boxShape = new BoxColliderShape();
            boxShape.isTrigger = false;
            collider.addShape(boxShape);
            colliderEntity.transform.position = worldPos;
            boxShape.size = worldSize;
          }
        }
        return map;
      })
  );
}
