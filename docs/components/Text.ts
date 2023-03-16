import {
    Entity,
    WebGLEngine,
    Color,
    Font, FontStyle, TextRenderer, PBRMaterial
} from 'oasis-engine';
import Object3D from "./Object3D";

export default class Text extends Object3D {
    constructor(engine: WebGLEngine, text: string, fontSize: number = 45) {
        super();
        this.entity = new Entity(engine, "Text");
        
        const textRenderer = this.entity.addComponent(TextRenderer);
        let material = textRenderer.getMaterial() as PBRMaterial;
        const depthState = material.renderState.depthState;
        depthState.enabled = false;
        depthState.writeEnabled = false;
        
        textRenderer.font = new Font(engine, "Arial");
        textRenderer.text = text;
        textRenderer.fontSize = fontSize;
        textRenderer.fontStyle = FontStyle.Bold;
        textRenderer.color = new Color(1, 0, 0, 1);
    }
}