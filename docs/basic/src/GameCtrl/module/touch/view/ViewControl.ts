import { Camera, Canvas, Entity, InputManager, MathUtil, Matrix, Transform, Vector3 } from "oasis-engine";
import { GameCtrl } from "../../..";
import { CachePointer } from "../enum/ICachePointer";
import { PointerType } from "../enum/IPointerType";
import { TouchHandlerType } from "../enum/ITouchHandlerType";
import { ControlHandlerType, TouchManager } from "../TouchManager";
import cameraConfig from "../../../config/camera.json";

class Spherical {
  constructor(public radius?: number, public phi?: number, public theta?: number) {
    this.radius = radius !== undefined ? radius : 1.0;
    this.phi = phi !== undefined ? phi : 0;
    this.theta = theta !== undefined ? theta : 0;
  }

  set(radius: number, phi: number, theta: number) {
    this.radius = radius;
    this.phi = phi;
    this.theta = theta;
    return this;
  }

  makeSafe() {
    this.phi = MathUtil.clamp(this.phi, MathUtil.zeroTolerance, Math.PI - MathUtil.zeroTolerance);
    return this;
  }

  setFromVec3(value: Vector3) {
    this.radius = value.length();
    if (this.radius === 0) {
      this.theta = 0;
      this.phi = 0;
    } else {
      this.theta = Math.atan2(value.x, value.z);
      this.phi = Math.acos(MathUtil.clamp(value.y / this.radius, -1, 1));
    }
    return this;
  }

  setToVec3(value: Vector3) {
    const { radius, phi, theta } = this;
    const sinPhiRadius = Math.sin(phi) * radius;
    value.set(sinPhiRadius * Math.sin(theta), radius * Math.cos(phi), sinPhiRadius * Math.cos(theta));
    return this;
  }
}

/**
 * The camera's track controller, can rotate, zoom, pan, support mouse and touch events.
 */
export class ViewControl {
  canvas: Canvas;
  input: InputManager;
  camera: Camera;
  cameraTransform: Transform;
  cameraParentTransform: Transform;

  // debug 值
  currentPolarAngle = 0;
  currentTheta = 0;
  currentDistance = 0;

  targetEntity: Entity;
  target: Vector3 = new Vector3(0, 0, 0);
  /** Whether to enable camera damping, the default is true. */
  enableDamping: boolean = false;
  /** Rotation speed, default is 1.0 . */
  rotateSpeed: number = 0.3;
  /** Camera zoom speed, the default is 1.0. */
  zoomSpeed: number = 1.0;
  /** Rotation damping parameter, default is 0.1 . */
  dampingFactor: number = 0.1;
  /** Zoom damping parameter, default is 0.2 . */
  zoomFactor: number = 0.2;
  /**  The minimum distance, the default is 0.1, should be greater than 0. */
  minDistance: number = 5;
  /** The maximum distance, the default is infinite, should be greater than the minimum distance. */
  maxDistance: number = 30;
  /** Minimum zoom speed, the default is 0.0. */
  minZoom: number = 0.0;
  /** Maximum zoom speed, the default is positive infinity. */
  maxZoom: number = Infinity;
  /** The minimum radian in the vertical direction, the default is 1 degree. */
  minPolarAngle: number = (30 / 180) * Math.PI;
  /** The maximum radian in the vertical direction,  the default is 179 degree.  */
  maxPolarAngle: number = (85 / 180) * Math.PI;
  /** The minimum radian in the horizontal direction, the default is negative infinity. */
  minAzimuthAngle: number = -Infinity;
  /** The maximum radian in the horizontal direction, the default is positive infinity.  */
  maxAzimuthAngle: number = Infinity;

  private _enableHandler: number = ControlHandlerType.ROTATE;
  private _spherical: Spherical = new Spherical();
  private _sphericalDelta: Spherical = new Spherical();
  private _sphericalDump: Spherical = new Spherical();
  private _zoomFrag: number = 0;
  private _scale: number = 1;
  private _tempVec3: Vector3 = new Vector3();
  private _tempVec30: Vector3 = new Vector3();
  private _tempVec31: Vector3 = new Vector3();
  private _tempVec32: Vector3 = new Vector3();
  private _tempMat41: Matrix = new Matrix();
  private _cachePointers: CachePointer[] = [];

  get enableRotate(): boolean {
    return (this._enableHandler & ControlHandlerType.ROTATE) !== 0;
  }

  set enableRotate(value: boolean) {
    if (value) {
      this._enableHandler |= ControlHandlerType.ROTATE;
    } else {
      this._enableHandler &= ~ControlHandlerType.ROTATE;
    }
  }

  get enableZoom(): boolean {
    return (this._enableHandler & ControlHandlerType.ZOOM) !== 0;
  }

  set enableZoom(value: boolean) {
    if (value) {
      this._enableHandler |= ControlHandlerType.ZOOM;
    } else {
      this._enableHandler &= ~ControlHandlerType.ZOOM;
    }
  }

  get radius(): number {
    Vector3.subtract(this.cameraTransform.position, this.target, this._tempVec3);
    return this._tempVec3.length();
  }

  set radius(val: number) {
    Vector3.subtract(this.cameraTransform.position, this.target, this._tempVec3);
    Vector3.add(this.target, this._tempVec3.scale(val / this._tempVec3.length()), this.cameraTransform.position);
  }

  update() {
    // 判断是否锁定视角
    if ((TouchManager.handlerType & TouchHandlerType.JoyLockViewFree) === 0) {
      return;
    }
    const { _tempVec3: delta } = this;
    const handlerType = this._updateSceneHandler(delta);
    if ((handlerType & this._enableHandler) !== 0) {
      if (!!delta.x || !!delta.y) {
        switch (handlerType) {
          case ControlHandlerType.ROTATE:
            this._rotate(delta);
            break;
          case ControlHandlerType.ZOOM:
            this._zoom(delta);
            break;
          default:
            break;
        }
      }
    }
    const { _sphericalDump, _sphericalDelta } = this;
    if (this.enableDamping) {
      if (this._enableHandler & ControlHandlerType.ZOOM && handlerType ^ ControlHandlerType.ZOOM) {
        this._zoomFrag *= 1 - this.zoomFactor;
      }
      if (this._enableHandler & ControlHandlerType.ROTATE && handlerType ^ ControlHandlerType.ROTATE) {
        _sphericalDelta.theta = _sphericalDump.theta *= 1 - this.dampingFactor;
        _sphericalDelta.phi = _sphericalDump.phi *= 1 - this.dampingFactor;
      }
    }
    /** Update camera's transform. */
    this._updateTransform();
  }

  constructor() {
    const { engine, camera } = GameCtrl.ins;
    this.canvas = engine.canvas;
    this.input = engine.inputManager;
    this.camera = camera.getComponent(Camera);
    this.cameraTransform = camera.transform;
    this.cameraParentTransform = camera.parent.transform;
    this.target.set(0, cameraConfig.altitude, 0);
  }

  private _rotate(delta: Vector3): void {
    const radianLeft = ((2 * Math.PI * delta.x) / this.canvas.width) * this.rotateSpeed;
    this._sphericalDelta.theta -= radianLeft;
    const radianUp = ((2 * Math.PI * delta.y) / this.canvas.height) * this.rotateSpeed;
    this._sphericalDelta.phi -= radianUp;
    if (this.enableDamping) {
      this._sphericalDump.theta = -radianLeft;
      this._sphericalDump.phi = -radianUp;
    }
  }

  private _zoom(delta: Vector3): void {
    if (delta.y > 0) {
      this._scale /= Math.pow(0.95, this.zoomSpeed);
    } else if (delta.y < 0) {
      this._scale *= Math.pow(0.95, this.zoomSpeed);
    }
  }

  private _updateTransform(): void {
    const { cameraTransform, _tempVec3, _spherical, _sphericalDelta, target } = this;

    // test
    const {x, y, z} = cameraTransform.position;
    if (this.targetEntity) {
      const targetPosition = this.targetEntity.transform.worldPosition;
      const cameraParentWorldPosition = this.cameraParentTransform.worldPosition;
      const buffer = cameraConfig.buffer;
      if (buffer > 0) {
        // 立方体缓冲区
        if (targetPosition.x - cameraParentWorldPosition.x > buffer) {
          cameraParentWorldPosition.x = targetPosition.x - buffer;
        } else if (targetPosition.x - cameraParentWorldPosition.x < -buffer) {
          cameraParentWorldPosition.x = targetPosition.x + buffer;
        }
        if (targetPosition.y - cameraParentWorldPosition.y > buffer) {
          cameraParentWorldPosition.y = targetPosition.y - buffer;
        } else if (targetPosition.y - cameraParentWorldPosition.y < -buffer) {
          cameraParentWorldPosition.y = targetPosition.y + buffer;
        }
        if (targetPosition.z - cameraParentWorldPosition.z > buffer) {
          cameraParentWorldPosition.z = targetPosition.z - buffer;
        } else if (targetPosition.z - cameraParentWorldPosition.z < -buffer) {
          cameraParentWorldPosition.z = targetPosition.z + buffer;
        }
      } else {
        cameraParentWorldPosition.copyFrom(targetPosition);
      }
    }
    Vector3.subtract(cameraTransform.position, target, _tempVec3);
    _spherical.setFromVec3(_tempVec3);
    _spherical.theta += _sphericalDelta.theta;
    _spherical.phi += _sphericalDelta.phi;
    _spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, _spherical.theta));
    _spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, _spherical.phi));

    if (this._scale !== 1) {
      this._zoomFrag = _spherical.radius * (this._scale - 1);
    }
    _spherical.radius += this._zoomFrag;
    _spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, _spherical.radius));
    _spherical.setToVec3(_tempVec3);

    this.currentPolarAngle = _spherical.phi;
    this.currentTheta = _spherical.theta;
    this.currentDistance = _spherical.radius;

    Vector3.add(target, _tempVec3, cameraTransform.position);
    const {x: afterX, y: afterY, z: afterZ} = cameraTransform.position;
    if(x !== afterX || y !== afterY || z !== afterZ) {
      // console.log('cameraTransform.position', cameraTransform.position)
      GameCtrl.ins.engine.dispatch('viewChange', {
        x: afterX,
        y: afterY,
        z: afterZ
      })
    }
    this.localLookAt(cameraTransform, target);

    /** Reset cache value. */
    this._zoomFrag = 0;
    this._scale = 1;
    _sphericalDelta.set(0, 0, 0);
  }

  private localLookAt(transform: Transform, targetPosition: Vector3) {
    const zAxis = this._tempVec30;
    Vector3.subtract(transform.position, targetPosition, zAxis);
    zAxis.normalize();
    const xAxis = this._tempVec31.set(zAxis.z, 0, -zAxis.x).normalize();
    const yAxis = this._tempVec32;
    Vector3.cross(zAxis, xAxis, yAxis);
    yAxis.normalize();
    const rotMat = this._tempMat41;
    const { elements: e } = rotMat;
    (e[0] = xAxis.x), (e[1] = xAxis.y), (e[2] = xAxis.z);
    (e[4] = yAxis.x), (e[5] = yAxis.y), (e[6] = yAxis.z);
    (e[8] = zAxis.x), (e[9] = zAxis.y), (e[10] = zAxis.z);
    rotMat.getRotation(transform.rotationQuaternion);
  }

  private _updateSceneHandler(deltaVec: Vector3): ControlHandlerType {
    const { _cachePointers: cachePointers } = this;
    TouchManager.getPointers(PointerType.Scene, cachePointers);
    let scenePointerCount = cachePointers.length;
    switch (scenePointerCount) {
      case 0:
        // 无操作
        deltaVec.set(0, 0, 0);
        return ControlHandlerType.None;
      case 1:
        // 旋转
        const pointer = cachePointers[0];
        deltaVec.set(pointer.dx, pointer.dy, 0);
        return ControlHandlerType.ROTATE;
      default:
        const pointer1 = cachePointers[0];
        const pointer2 = cachePointers[1];
        // 缩放
        const lastDistance = Math.sqrt(
          (pointer1.x - pointer1.dx - pointer2.x + pointer2.dx) ** 2 +
            (pointer1.y - pointer1.dy - pointer2.y + pointer2.dy) ** 2
        );
        const nowDistance = Math.sqrt((pointer1.x - pointer2.x) ** 2 + (pointer1.y - pointer2.y) ** 2);
        deltaVec.set(0, lastDistance - nowDistance, 0);
        return ControlHandlerType.ZOOM;
    }
  }
}
