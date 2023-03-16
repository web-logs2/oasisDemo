import {
    Camera,
    Entity,
    Vector3,
    WebGLEngine ,
} from 'oasis-engine';
import { OrbitControl } from 'oasis-engine-toolkit';
import Object3D from './Object3D';

export default class ProjectiveCamera  extends Object3D{
    public control: OrbitControl;
    public camera: Camera;
    constructor(engine: WebGLEngine, name = 'camera', view = [10, 10, 10]) {
        super();
        const [x, y, z] = view;
        this.entity = new Entity(engine, name);
        this.entity.transform.setPosition(x, y, z);
        this.entity.transform.lookAt(new Vector3(0, 0, 0));
        this.camera = this.entity.addComponent(Camera);
        this.control = this.entity.addComponent(OrbitControl);
    }
}