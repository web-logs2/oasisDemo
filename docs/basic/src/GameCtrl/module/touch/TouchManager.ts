import { Vector2 } from "oasis-engine";
import { GameCtrl } from "../..";
import { CachePointer } from "./enum/ICachePointer";
import { PointerType } from "./enum/IPointerType";
import { TouchHandlerType } from "./enum/ITouchHandlerType";
import { JoyControl } from "./joy/JoyControl";
import { TouchControl } from "./TouchControl";
import { ViewControl } from "./view/ViewControl";

export enum ControlHandlerType {
  None = 0,
  ROTATE = 1,
  ZOOM = 2,
  PAN = 4,
  All = 7
}

/**
 * 1.不同的功能对锁定视角的需求有不同
 * 2.最终的表现是不同功能锁定的合集，互不干扰
 */
export enum OrderType {
  Debug
}

export class TouchManager {
  private static _touchControl: TouchControl;
  private static _handlerTypeHash: Record<number, TouchHandlerType> = {};
  private static _viewHandlerTypeHash: Record<number, ControlHandlerType> = {};

  static joyControl: JoyControl;
  static viewControl: ViewControl;
  static init() {
    const { root, engine } = GameCtrl.ins;
    this._touchControl = root.addComponent(TouchControl);
    this.joyControl = new JoyControl();
    this.viewControl = new ViewControl();
    /** 前后台切换时清理光标，避免 IOS 的 bug */
    document.addEventListener("resume", TouchManager.refreshPointer, false);
    document.addEventListener("pause", TouchManager.refreshPointer, false);

    // 移除对 window 失焦的监听
    // 否则失焦后需要双击恢复焦点
    // @ts-ignore
    window.removeEventListener("blur", engine.inputManager._onBlur);
  }

  static refreshPointer() {
    //  @ts-ignore
    const pointerManager = GameCtrl.ins.engine.inputManager._pointerManager;
    pointerManager._downList.length = 0;
    pointerManager._upList.length = 0;
    pointerManager._pointers.length = 0;
  }

  private static _handlerType: TouchHandlerType = TouchHandlerType.JoyFreeViewFree;

  static get handlerType() {
    return this._handlerType;
  }

  static getPointers(type: PointerType, out: CachePointer[]) {
    this._touchControl.getPointers(type, out);
  }

  static getJoyDelta(): Vector2 {
    return this.joyControl.deltaVec;
  }

  static updateHandlerType(orderType: OrderType, handlerType: TouchHandlerType) {
    const { _handlerTypeHash } = this;
    if (_handlerTypeHash[orderType] !== handlerType) {
      _handlerTypeHash[orderType] = handlerType;
      this._refreshHandlerType();
    }
  }

  private static _refreshHandlerType() {
    const { _handlerTypeHash } = this;
    // 更新当前的触摸操作
    let keys = Object.keys(_handlerTypeHash);
    let newHandlerType = TouchHandlerType.JoyFreeViewFree;
    for (let i = keys.length - 1; i >= 0; i--) {
      newHandlerType &= _handlerTypeHash[keys[i]];
    }
    this._handlerType = newHandlerType;
  }

  static updateViewHandlerType(orderType: OrderType, handlerType: ControlHandlerType) {
    const { _viewHandlerTypeHash } = this;
    if (_viewHandlerTypeHash[orderType] !== handlerType) {
      _viewHandlerTypeHash[orderType] = handlerType;
      this._refreshViewHandlerType();
    }
  }

  private static _refreshViewHandlerType() {
    const { _viewHandlerTypeHash } = this;
    // 更新当前的触摸操作
    let keys = Object.keys(_viewHandlerTypeHash);
    let newHandlerType = ControlHandlerType.All;
    for (let i = keys.length - 1; i >= 0; i--) {
      newHandlerType &= _viewHandlerTypeHash[keys[i]];
    }
    this.viewControl.enableRotate = (newHandlerType & ControlHandlerType.ROTATE) !== 0;
    this.viewControl.enableZoom = (newHandlerType & ControlHandlerType.ZOOM) !== 0;
  }
}
