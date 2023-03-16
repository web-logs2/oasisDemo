import { Camera, DirectLight, Entity, ShadowCascadesMode, ShadowResolution, ShadowType, Layer, Vector3, WebGLEngine } from "oasis-engine";
import { GridControl, Stats } from "oasis-engine-toolkit";

export function initScene(engine: WebGLEngine) {
    const scene = engine.sceneManager.activeScene;
    scene.ambientLight.diffuseSolidColor.set(1, 1, 1, 1);
    scene.ambientLight.diffuseIntensity = 0.1;
    scene.background.solidColor.set(1, 1, 1, 1);

    scene.shadowDistance = 17;
    scene.shadowCascades = ShadowCascadesMode.NoCascades;
    scene.shadowResolution = ShadowResolution.Medium;
    return scene;
}

export function initCamera(rootEntity: Entity, camera: Entity) {
    const cameraConfig = {
        "filedOfView": 45,
        "radius": 8,
        "buffer": 0,
        "theta": 0,
        "phi": 90,
        "minPolarAngle": 50,
        "maxPolarAngle": 90,
        "altitude": 2
    }
    const { radius, filedOfView, altitude } = cameraConfig;
    let phi = (cameraConfig.phi / 180) * Math.PI;
    let theta = (cameraConfig.theta / 180) * Math.PI;
    const sinPhiRadius = Math.sin(phi) * radius;
    camera.transform.position.set(
      sinPhiRadius * Math.sin(theta),
      radius * Math.cos(phi) + altitude,
      sinPhiRadius * Math.cos(theta)
    );
    camera.transform.position.y += 2;

    const cameraComponent = camera.addComponent(Camera);
    
    camera.addComponent(Stats);

    cameraComponent.cullingMask = Layer.Layer0;
    cameraComponent.fieldOfView = filedOfView;
    cameraComponent.farClipPlane = 800;
    camera.transform.lookAt(new Vector3(0, 0, 0));

    // 初始化辅助坐标系
    const grid = rootEntity.addComponent(GridControl);
    grid.camera = cameraComponent;
}

export function initLight(rootEntity: Entity) {
    const lightEntity = rootEntity.createChild("DirectLight");
    lightEntity.transform.setPosition(8, 10, 10);
    lightEntity.transform.lookAt(new Vector3(0, 0, 0));
    const directLight = lightEntity.addComponent(DirectLight);
    directLight.intensity = 1;
    directLight.shadowStrength = 0.3;
    directLight.shadowBias = 2;
    directLight.shadowType = ShadowType.Hard;
    return lightEntity;
}