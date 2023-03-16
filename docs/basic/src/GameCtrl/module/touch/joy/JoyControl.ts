import { AssetType, Entity, SpriteAtlas, SpriteRenderer, Vector2, Vector3 } from "oasis-engine";
import { ModuleEvent } from "../../../event";
import { GameCtrl } from "../../../index";
import { UIManager } from "../../../manager/UIManager";
import { getRotationByPoint } from "../../scene/Util";
import { CachePointer } from "../enum/ICachePointer";
import { PointerType } from "../enum/IPointerType";
import { TouchHandlerType } from "../enum/ITouchHandlerType";
import { TouchManager } from "../TouchManager";
import joyConfig from "../../../config/joy.json";

enum HandlerState {
  playing,
  pause
}

enum JoyUIState {
  None,
  Hide,
  Idle,
  Active
}

export class JoyControl {
  bg: Entity;
  nn: Entity;
  dir: Entity;
  bgRenderer: SpriteRenderer;
  nnRenderer: SpriteRenderer;
  dirRenderer: SpriteRenderer;
  deltaVec: Vector2 = new Vector2();

  private _initialize: boolean = false;
  private _joyCenter: Vector3 = new Vector3();
  private _uiState: JoyUIState = JoyUIState.None;

  private _cachePointers: CachePointer[] = [];
  private _handlerState = HandlerState.pause;

  private _tempVec2: Vector2 = new Vector2();
  private _tempVec30: Vector3 = new Vector3();
  private _tempVec31: Vector3 = new Vector3();

  constructor() {
    this._initUI();
    GameCtrl.ins.engine.on(ModuleEvent.screenResize, () => {
      if (this._uiState === JoyUIState.Idle) {
        this._updateUI(JoyUIState.Idle, true);
      }
    });
  }

  private _initUI() {
    const { engine } = GameCtrl.ins;
    engine.resourceManager
      .load({
        url: "https://mdn.alipayobjects.com/rms/afts/file/A*jGepTqr78dUAAAAAAAAAAAAAARQnAQ/SpriteAtlas.json",
        type: AssetType.SpriteAtlas
      })
      .then((atlas: SpriteAtlas) => {
        const { uiRoot } = UIManager;
        const bg = (this.bg = uiRoot.createChild("BG"));
        const nn = (this.nn = uiRoot.createChild("NN"));
        const dir = (this.dir = uiRoot.createChild("DIR"));

        const bgRenderer = (this.bgRenderer = bg.addComponent(SpriteRenderer));
        bgRenderer.castShadows = false;
        const spriteBG = atlas.getSprite("Assets/bgSprite");
        bgRenderer.sprite = spriteBG;
        bgRenderer.height = bgRenderer.width = joyConfig.backgroundSize;

        const dirRenderer = (this.dirRenderer = dir.addComponent(SpriteRenderer));
        dirRenderer.castShadows = false;
        const spriteDir = atlas.getSprite("Assets/dirSprite");
        dirRenderer.sprite = spriteDir;
        dirRenderer.height = dirRenderer.width = joyConfig.backgroundSize;

        const nnRenderer = (this.nnRenderer = nn.addComponent(SpriteRenderer));
        nnRenderer.castShadows = false;
        const spriteNN = atlas.getSprite("Assets/pointerSprite");
        nnRenderer.sprite = spriteNN;
        nnRenderer.width = nnRenderer.height = joyConfig.pointerSize;
        this._initialize = true;
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  }

  update(): void {
    
    // 是否已经初始化
    if (!this._initialize) {
      return;
    }
    const { deltaVec } = this;
    // 判断是否锁定视角
    if ((TouchManager.handlerType & TouchHandlerType.JoyFreeViewLock) === 0) {
      this._handlerState = HandlerState.pause;
      deltaVec.set(0, 0);
      this._updateUI(JoyUIState.Hide);
      return;
    }
    const { _cachePointers: cachePointers } = this;
    TouchManager.getPointers(PointerType.Joy, cachePointers);
    const targetPointer = cachePointers[0];
    if (targetPointer) {
      this._updateUI(JoyUIState.Active);
      const { _tempVec30, _tempVec31, _tempVec2, _joyCenter } = this;
      let { x: startX, y: startY } = targetPointer;
      const r = joyConfig.backgroundSize / 2;
      const buffer = joyConfig.pointerSize / 4;
      switch (this._handlerState) {
        case HandlerState.pause:
          this._handlerState = HandlerState.playing;
          UIManager.screenTo2DWorld(_tempVec2.set(startX, startY), _tempVec30);
          //  边界值保护
          if (_tempVec30.x < buffer + r - UIManager.designWidth / 2) {
            _tempVec31.x = buffer + r - UIManager.designWidth / 2;
          } else {
            _tempVec31.x = _tempVec30.x;
          }
          if (_tempVec30.y < buffer + r - UIManager.designHeight / 2) {
            _tempVec31.y = buffer + r - UIManager.designHeight / 2;
          } else {
            _tempVec31.y = _tempVec30.y;
          }
          this.bg.transform.setPosition(_tempVec31.x, _tempVec31.y, -0.3);
          this.dir.transform.setPosition(_tempVec31.x, _tempVec31.y, -0.2);
          this.nn.transform.setPosition(_tempVec30.x, _tempVec30.y, -0.1);
          _joyCenter.copyFrom(_tempVec31);
          deltaVec.set((_tempVec31.x - _tempVec30.x) / r, (_tempVec30.y - _tempVec31.y) / r);
          break;
        case HandlerState.playing:
          UIManager.screenTo2DWorld(_tempVec2.set(startX, startY), _tempVec30);
          _tempVec31.set(_tempVec30.x - _joyCenter.x, _tempVec30.y - _joyCenter.y, 0);
          const distance = _tempVec31.length();
          if (distance > r) {
            _tempVec31.scale(r / distance);
          }
          Vector3.add(_joyCenter, _tempVec31, _tempVec30);
          this.nn.transform.setPosition(_tempVec30.x, _tempVec30.y, -0.1);
          deltaVec.set(-_tempVec31.x / r, _tempVec31.y / r);
          break;
      }
      // 当偏移超过一定比例时，显示边界高光
      if (deltaVec.length() > joyConfig.lightEdge) {
        this.dir.isActive = true;
        this.dir.transform.setRotation(0, 0, getRotationByPoint(deltaVec.x, deltaVec.y));
      } else {
        this.dir.isActive = false;
      }
    } else {
      this._updateUI(JoyUIState.Idle);
      deltaVec.set(0, 0);
      this._handlerState = HandlerState.pause;
    }
  }

  private _updateUI(state: JoyUIState, force: boolean = false) {
    if (this._uiState !== state || force) {
      this._uiState = state;
      switch (state) {
        case JoyUIState.Hide:
          this.bg.isActive = this.nn.isActive = this.dir.isActive = false;
          break;
        case JoyUIState.Idle:
          this.bg.isActive = this.nn.isActive = true;
          this.dir.isActive = false;
          const left = -UIManager.designWidth / 2 + (UIManager.designWidth * joyConfig.joyRect.width) / 2;
          const bottom = -UIManager.designHeight / 2 + joyConfig.backgroundSize / 2 + joyConfig.pointerSize;
          this.bg.transform.setPosition(left, bottom, -0.3);
          this.nn.transform.setPosition(left, bottom, -0.1);
          this.bgRenderer.color.a = this.dirRenderer.color.a = this.nnRenderer.color.a = 0.4;
          break;
        case JoyUIState.Active:
          this.bg.isActive = this.nn.isActive = true;
          this.bgRenderer.color.a = this.dirRenderer.color.a = this.nnRenderer.color.a = 1;
          break;
        default:
          break;
      }
    }
  }
}
