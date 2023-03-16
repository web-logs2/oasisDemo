import { Entity, Sprite, SpriteRenderer, Texture2D, UnlitMaterial, WebGLEngine } from "oasis-engine";
import ResourceSystem from "../resourceSystem";
import { IAnimateInfo } from './interface';
import { AnimateEvents } from './events';

export default class Foot {
    private resourceSystem: ResourceSystem;
    private engine: WebGLEngine;
    private rootEntity: Entity;
    private footTexture: Texture2D | undefined;
    constructor(resourceSystem: ResourceSystem, engine: WebGLEngine, rootEntity: Entity) {
        this.resourceSystem = resourceSystem;
        this.engine = engine;
        this.rootEntity = rootEntity;

        const url = 'https://mdn.alipayobjects.com/huamei_cwajh0/afts/img/A*2MdXQriGfnQAAAAAAAAAAAAADn19AQ/original';
        resourceSystem.loadTexture(url, texture => {
            this.footTexture = texture;
        })
        
    }

    initFootInstance() {
        if(!this.footTexture) return null;
        const spriteEntity = this.engine.createEntity('sprite');
        const spriteRenderer = spriteEntity.addComponent(SpriteRenderer);
        const sprite = new Sprite(this.engine, this.footTexture);
        spriteRenderer.sprite = sprite;
        spriteEntity.transform.rotation.x = -90;
        spriteEntity.transform.position.y = 0.1;
        return spriteEntity;
    }

    play(info: IAnimateInfo) {
        const event = AnimateEvents[info.type];
        const foot = this.initFootInstance();
        if(event && foot) {
            const { position, rotation = [0, 0, 0] } = info;
            const [x, y, z] = position;
            foot.transform.position.set(x, 0.1, z);
            foot.transform.rotation.y = rotation[1];
            this.rootEntity.addChild(foot);
            event(foot, info, () => {
                this.rootEntity.removeChild(foot);
                foot.destroy();
            });
        }
        
    }
}