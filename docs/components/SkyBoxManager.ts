import {
    AssetType,
    WebGLEngine,
    AmbientLight,
    SkyBoxMaterial,
    BackgroundMode,
    PrimitiveMesh,
    Scene,
} from 'oasis-engine';
export default class SkyBoxManager {
    private engine: WebGLEngine;
    private scene: Scene;
    constructor(engine: WebGLEngine) {
        const scene = engine.sceneManager.activeScene;
        this.scene = scene;
        this.engine = engine;
    }

    loadSkyBox(map: string, callback: () => void) {
        const sky = this.scene.background.sky;
        const skyMaterial = new SkyBoxMaterial(this.engine);
        this.scene.background.mode = BackgroundMode.Sky;
        sky.material = skyMaterial;
        sky.mesh = PrimitiveMesh.createCuboid(this.engine, 1, 1, 1);
        this.engine.resourceManager
        .load<AmbientLight>({
          type: AssetType.Env,
        //   url: "https://gw.alipayobjects.com/os/bmw-prod/09904c03-0d23-4834-aa73-64e11e2287b0.bin",
            url: map,
        })
        .then((ambientLight) => {
          this.scene.ambientLight = ambientLight;
          skyMaterial.textureCubeMap = ambientLight.specularTexture;
          skyMaterial.textureDecodeRGBM = true;
          callback();
        });
    }
}