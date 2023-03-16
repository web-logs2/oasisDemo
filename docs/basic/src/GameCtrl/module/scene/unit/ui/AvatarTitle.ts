import {
  AssetType,
  Entity,
  Script,
  Sprite,
  SpriteRenderer,
  TextRenderer,
  Texture2D,
  TextureWrapMode,
  Transform,
  Vector2
} from "oasis-engine";
import { GameCtrl } from "../../../..";
import { formatNickName } from "../../Util";

export class AvatarTitle extends Script {
  private _cameraTransform: Transform;

  constructor(entity: Entity) {
    super(entity);
    this._cameraTransform = GameCtrl.ins.camera.transform;
  }

  init(title: string) {
    const { engine, entity } = this;
    engine.resourceManager
      .load<Texture2D>({
        type: AssetType.Texture2D,
        url: "https://mdn.alipayobjects.com/huamei_p0cigc/afts/img/A*HHZ_Sq67CJEAAAAAAAAAAAAADoB5AQ/original"
      })
      .then((texture) => {
        if (this.entity.destroyed) {
          return;
        }
        const textRenderer = entity.addComponent(TextRenderer);
        textRenderer.castShadows = false;
        textRenderer.text = formatNickName(title);
        textRenderer.fontSize = 15;
        textRenderer.priority = 1;
        const bgEntity = entity.createChild("nick_bg");
        const bgRenderer = bgEntity.addComponent(SpriteRenderer);
        bgRenderer.castShadows = false;
        bgRenderer.width = 486 / 400;
        bgRenderer.height = 96 / 400;
        bgEntity.transform.setPosition(0, -0.1, 0);
        entity.transform.setPosition(0, 2, 0);
        texture.wrapModeU = texture.wrapModeV = TextureWrapMode.Clamp;
        bgRenderer.sprite = new Sprite(engine, texture, undefined, new Vector2(0.5, 0));
      });
  }

  onLateUpdate(deltaTime: number) {
    this.entity.transform.worldRotationQuaternion = this._cameraTransform.worldRotationQuaternion;
  }
}
