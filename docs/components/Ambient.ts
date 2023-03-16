import {
    AssetType,
    WebGLEngine,
    AmbientLight,
} from 'oasis-engine';
export default class Ambient {
    public engine: WebGLEngine;
    constructor(engine: WebGLEngine) {
        this.engine = engine;
    }
    
    loadEnvMap(url = "https://gw.alipayobjects.com/os/bmw-prod/89c54544-1184-45a1-b0f5-c0b17e5c3e68.bin", callback: (ambientLight: AmbientLight) => void) {
        this.engine.resourceManager
        .load<AmbientLight>({ type: AssetType.Env, url })
        .then((ambientLight) => {
          callback(ambientLight);
        });
    }
}