import {
    AssetType,
    Texture2D,
    WebGLEngine,
    Sprite,
    Vector3,
    SpriteRenderer,
} from 'oasis-engine';

export default class ResourceSystem {
    private texturePool: Map<string, Texture2D> = new Map();
    private engine: WebGLEngine;
    constructor(engine: WebGLEngine) {
        this.engine = engine;
    }

    loadTexture(url: string, callback?: (texture: Texture2D) => void) {
        if(this.texturePool.has(url)) {
            const texture = this.texturePool.get(url) as Texture2D;
            callback && callback(texture);
        } else {
            this.engine.resourceManager
            .load<Texture2D>({ url, type: AssetType.Texture2D })
            .then((texture) => {
                    this.texturePool.set(url, texture);
                    callback && callback(texture);
                    // return texture;
                    // const spriteEntity = this.engine.createEntity('sprite');
                    // const spriteRenderer = spriteEntity.addComponent(SpriteRenderer);
                    // const sprite = new Sprite(this.engine, texture);
                    // spriteRenderer.sprite = sprite;

                    // spriteEntity.transform.rotation.x = -90;
                    // spriteEntity.transform.position.y = 0.1;
                    
            });
        }
       
    }
}