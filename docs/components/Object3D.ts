import {
    Entity,
} from 'oasis-engine';

export default class Object3D {
    public entity: Entity;
    get transform() {
        return this.entity.transform;
    }
}