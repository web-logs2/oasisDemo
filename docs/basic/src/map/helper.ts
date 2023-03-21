import { MeshRenderer, PrimitiveMesh, BoxColliderShape, BlinnPhongMaterial, StaticCollider, WebGLEngine, Color, Entity } from 'oasis-engine';


export function initPlane(engine: WebGLEngine, width: number, height: number, type: string) {
    const entity = engine.createEntity('plane')
    const renderer = entity.addComponent(MeshRenderer);
    renderer.mesh = PrimitiveMesh.createPlane(engine, width, height);

    // Create material
    const material = new BlinnPhongMaterial(engine);
    if (type === 'grass') {
        material.baseColor.set(0, 0.8, 0, 1);
    } else if (type === 'sand') {
        material.baseColor.set(0.8, 0.8, 0, 1);
    } else if (type === 'rock') {
        material.baseColor.set(0.3, 0.3, 0.3, 1);
    } else {
        // ground
        material.baseColor.set(0.6, 0.6, 0.6, 1);
    }

    renderer.setMaterial(material);
    return entity;
}

export function gridColor(type: string) {
    switch(type) {
        case 'grass':
            return [0, 0.8, 0, 1];
        case 'sand':
            return [0.8, 0.8, 0, 1]
        case 'rock':
            return [0.3, 0.3, 0.3, 1]
        default:
            return [0.6, 0.6, 0.6, 1];
    }
}

export function color2Rgb(color: number[]) {
    const [r, g, b] = color;
    return `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
}
export function addColliderCubes(engine: WebGLEngine, root: Entity) {
    const cube1 = createColliderCube(engine, root, 1, 1, 1, 0);
    cube1.transform.position.y = -1;
    root.addChild(cube1);

    // 无法使用 clone 方法
    // const cube2 = cube1.clone();
    // const cube3 = cube1.clone();
    // const cube4 = cube1.clone();
    // const cube6 = cube1.clone();
    // const cube7 = cube1.clone();
    // const cube8 = cube1.clone();
    // const cube9 = cube1.clone();
    // root.addChild(cube1);
    // root.addChild(cube2);
    // root.addChild(cube3);
    // root.addChild(cube4);
    // root.addChild(cube6);
    // root.addChild(cube7);
    // root.addChild(cube8);
    // root.addChild(cube9);
    
    const cube2 = createColliderCube(engine, root, 1, 1, 1, 0);
    cube2.transform.position.y = -1;
    root.addChild(cube2);
    const cube3 = createColliderCube(engine, root, 1, 1, 1, 0);
    cube3.transform.position.y = -1;
    root.addChild(cube3);
    const cube4 = createColliderCube(engine, root, 1, 1, 1, 0);
    cube4.transform.position.y = -1;
    root.addChild(cube4);
    const cube5 = createColliderCube(engine, root, 1, 1, 1, 0);
    cube5.transform.position.y = -1;
    root.addChild(cube5);
    const cube6 = createColliderCube(engine, root, 1, 1, 1, 0);
    cube6.transform.position.y = -1;
    root.addChild(cube6);
    const cube7 = createColliderCube(engine, root, 1, 1, 1, 0);
    cube7.transform.position.y = -1;
    root.addChild(cube7);
    const cube8 = createColliderCube(engine, root, 1, 1, 1, 0);
    cube8.transform.position.y = -1;
    root.addChild(cube8);
    const cube9 = createColliderCube(engine, root, 1, 1, 1, 0);
    cube9.transform.position.y = -1;
    root.addChild(cube9);
    return {
        1: cube1,
        2: cube2,
        3: cube3,
        4: cube4,
        5: cube5,
        6: cube6,
        7: cube7,
        8: cube8,
        9: cube9,
   }
}

export function createColliderCube(engine: WebGLEngine, rootEntity: Entity, x: number, y: number, z: number, padding = 0.8) {
    const cubeEntity = rootEntity.createChild("cube");
    const cubeRenderer = cubeEntity.addComponent(MeshRenderer);
    cubeRenderer.mesh = PrimitiveMesh.createCuboid(engine, x, y, z);
    const material = new BlinnPhongMaterial(engine);
    material.baseColor.a = 0.8;
    material.isTransparent = true;
    cubeRenderer.setMaterial(material);

    const boxCollider: StaticCollider = cubeEntity.addComponent(StaticCollider);
    const boxColliderShape = new BoxColliderShape();
    boxColliderShape.size.set(x + padding, y + padding, z + padding);
    boxCollider.addShape(boxColliderShape);
    
    return cubeEntity;
}


export const mockGrids =[{"id":"-11.0","type":"sand"},{"id":"-11.1","type":"sand"},{"id":"-10.-7","type":"sand"},{"id":"-10.-6","type":"sand"},{"id":"-10.-2","type":"sand"},{"id":"-10.-1","type":"sand"},{"id":"-10.0","type":"sand"},{"id":"-10.1","type":"sand"},{"id":"-10.2","type":"sand"},{"id":"-9.-9","type":"sand"},{"id":"-9.-8","type":"sand"},{"id":"-9.-7","type":"sand"},{"id":"-9.-6","type":"sand"},{"id":"-9.-5","type":"sand"},{"id":"-9.-4","type":"sand"},{"id":"-9.-3","type":"sand"},{"id":"-9.-2","type":"sand"},{"id":"-9.-1","type":"sand"},{"id":"-9.0","type":"grass"},{"id":"-9.1","type":"sand"},{"id":"-9.2","type":"sand"},{"id":"-9.3","type":"sand"},{"id":"-9.4","type":"sand"},{"id":"-8.-9","type":"sand"},{"id":"-8.-8","type":"sand"},{"id":"-8.-7","type":"sand"},{"id":"-8.-6","type":"sand"},{"id":"-8.-5","type":"sand"},{"id":"-8.-4","type":"sand"},{"id":"-8.-3","type":"grass"},{"id":"-8.-2","type":"grass"},{"id":"-8.-1","type":"grass"},{"id":"-8.0","type":"grass"},{"id":"-8.1","type":"sand"},{"id":"-8.2","type":"sand"},{"id":"-8.3","type":"sand"},{"id":"-8.4","type":"sand"},{"id":"-8.5","type":"sand"},{"id":"-7.-10","type":"grass"},{"id":"-7.-9","type":"grass"},{"id":"-7.-8","type":"grass"},{"id":"-7.-7","type":"sand"},{"id":"-7.-6","type":"sand"},{"id":"-7.-5","type":"sand"},{"id":"-7.-4","type":"grass"},{"id":"-7.-3","type":"grass"},{"id":"-7.-2","type":"grass"},{"id":"-7.-1","type":"grass"},{"id":"-7.0","type":"grass"},{"id":"-7.1","type":"grass"},{"id":"-7.2","type":"sand"},{"id":"-7.3","type":"sand"},{"id":"-7.4","type":"sand"},{"id":"-7.5","type":"sand"},{"id":"-6.-11","type":"grass"},{"id":"-6.-10","type":"grass"},{"id":"-6.-9","type":"grass"},{"id":"-6.-8","type":"rock"},{"id":"-6.-7","type":"rock"},{"id":"-6.-6","type":"rock"},{"id":"-6.-5","type":"grass"},{"id":"-6.-4","type":"grass"},{"id":"-6.-3","type":"grass"},{"id":"-6.-2","type":"grass"},{"id":"-6.-1","type":"grass"},{"id":"-6.0","type":"grass"},{"id":"-6.1","type":"grass"},{"id":"-6.2","type":"grass"},{"id":"-6.3","type":"sand"},{"id":"-6.4","type":"sand"},{"id":"-6.5","type":"sand"},{"id":"-6.6","type":"sand"},{"id":"-6.7","type":"sand"},{"id":"-5.-11","type":"grass"},{"id":"-5.-10","type":"grass"},{"id":"-5.-9","type":"grass"},{"id":"-5.-8","type":"rock"},{"id":"-5.-7","type":"rock"},{"id":"-5.-6","type":"rock"},{"id":"-5.-5","type":"grass"},{"id":"-5.-4","type":"grass"},{"id":"-5.-3","type":"grass"},{"id":"-5.-2","type":"rock"},{"id":"-5.-1","type":"rock"},{"id":"-5.0","type":"grass"},{"id":"-5.1","type":"grass"},{"id":"-5.2","type":"grass"},{"id":"-5.3","type":"grass"},{"id":"-5.4","type":"grass"},{"id":"-5.5","type":"sand"},{"id":"-5.6","type":"sand"},{"id":"-5.7","type":"sand"},{"id":"-4.-13","type":"sand"},{"id":"-4.-12","type":"sand"},{"id":"-4.-11","type":"grass"},{"id":"-4.-10","type":"grass"},{"id":"-4.-9","type":"rock"},{"id":"-4.-8","type":"rock"},{"id":"-4.-7","type":"rock"},{"id":"-4.-6","type":"rock"},{"id":"-4.-5","type":"rock"},{"id":"-4.-4","type":"grass"},{"id":"-4.-3","type":"grass"},{"id":"-4.-2","type":"rock"},{"id":"-4.-1","type":"grass"},{"id":"-4.0","type":"rock"},{"id":"-4.1","type":"rock"},{"id":"-4.2","type":"grass"},{"id":"-4.3","type":"grass"},{"id":"-4.4","type":"grass"},{"id":"-4.5","type":"grass"},{"id":"-4.6","type":"sand"},{"id":"-4.7","type":"sand"},{"id":"-4.8","type":"sand"},{"id":"-3.-14","type":"sand"},{"id":"-3.-13","type":"sand"},{"id":"-3.-12","type":"grass"},{"id":"-3.-11","type":"grass"},{"id":"-3.-10","type":"grass"},{"id":"-3.-9","type":"rock"},{"id":"-3.-8","type":"rock"},{"id":"-3.-7","type":"grass"},{"id":"-3.-6","type":"rock"},{"id":"-3.-5","type":"grass"},{"id":"-3.-4","type":"rock"},{"id":"-3.-3","type":"rock"},{"id":"-3.-2","type":"rock"},{"id":"-3.-1","type":"grass"},{"id":"-3.0","type":"rock"},{"id":"-3.1","type":"grass"},{"id":"-3.2","type":"grass"},{"id":"-3.3","type":"grass"},{"id":"-3.4","type":"grass"},{"id":"-3.5","type":"sand"},{"id":"-3.6","type":"sand"},{"id":"-3.7","type":"sand"},{"id":"-2.-15","type":"sand"},{"id":"-2.-14","type":"sand"},{"id":"-2.-13","type":"sand"},{"id":"-2.-12","type":"grass"},{"id":"-2.-11","type":"grass"},{"id":"-2.-10","type":"rock"},{"id":"-2.-9","type":"rock"},{"id":"-2.-8","type":"rock"},{"id":"-2.-7","type":"rock"},{"id":"-2.-6","type":"rock"},{"id":"-2.-5","type":"rock"},{"id":"-2.-4","type":"rock"},{"id":"-2.-3","type":"grass"},{"id":"-2.-2","type":"rock"},{"id":"-2.-1","type":"grass"},{"id":"-2.0","type":"grass"},{"id":"-2.1","type":"rock"},{"id":"-2.2","type":"grass"},{"id":"-2.3","type":"grass"},{"id":"-2.4","type":"grass"},{"id":"-2.5","type":"grass"},{"id":"-2.6","type":"sand"},{"id":"-2.7","type":"sand"},{"id":"-1.-15","type":"sand"},{"id":"-1.-14","type":"sand"},{"id":"-1.-13","type":"rock"},{"id":"-1.-12","type":"rock"},{"id":"-1.-11","type":"rock"},{"id":"-1.-10","type":"rock"},{"id":"-1.-9","type":"rock"},{"id":"-1.-8","type":"rock"},{"id":"-1.-7","type":"rock"},{"id":"-1.-6","type":"rock"},{"id":"-1.-5","type":"grass"},{"id":"-1.-4","type":"rock"},{"id":"-1.-3","type":"rock"},{"id":"-1.-2","type":"rock"},{"id":"-1.-1","type":"rock"},{"id":"-1.0","type":"rock"},{"id":"-1.1","type":"rock"},{"id":"-1.2","type":"rock"},{"id":"-1.3","type":"grass"},{"id":"-1.4","type":"grass"},{"id":"-1.5","type":"sand"},{"id":"-1.6","type":"sand"},{"id":"-1.7","type":"sand"},{"id":"-1.8","type":"sand"},{"id":"-1.9","type":"sand"},{"id":"0.-15","type":"sand"},{"id":"0.-14","type":"grass"},{"id":"0.-13","type":"rock"},{"id":"0.-12","type":"rock"},{"id":"0.-11","type":"rock"},{"id":"0.-10","type":"rock"},{"id":"0.-9","type":"rock"},{"id":"0.-8","type":"rock"},{"id":"0.-7","type":"rock"},{"id":"0.-6","type":"rock"},{"id":"0.-5","type":"rock"},{"id":"0.-4","type":"rock"},{"id":"0.-3","type":"rock"},{"id":"0.-2","type":"rock"},{"id":"0.-1","type":"rock"},{"id":"0.0","type":"rock"},{"id":"0.1","type":"rock"},{"id":"0.2","type":"rock"},{"id":"0.3","type":"grass"},{"id":"0.4","type":"grass"},{"id":"0.5","type":"sand"},{"id":"0.6","type":"sand"},{"id":"0.7","type":"sand"},{"id":"0.8","type":"sand"},{"id":"0.9","type":"sand"},{"id":"1.-14","type":"grass"},{"id":"1.-13","type":"rock"},{"id":"1.-12","type":"rock"},{"id":"1.-11","type":"rock"},{"id":"1.-10","type":"grass"},{"id":"1.-9","type":"rock"},{"id":"1.-8","type":"rock"},{"id":"1.-7","type":"rock"},{"id":"1.-6","type":"rock"},{"id":"1.-5","type":"rock"},{"id":"1.-4","type":"rock"},{"id":"1.-3","type":"rock"},{"id":"1.-2","type":"rock"},{"id":"1.-1","type":"rock"},{"id":"1.0","type":"rock"},{"id":"1.1","type":"rock"},{"id":"1.2","type":"grass"},{"id":"1.3","type":"sand"},{"id":"1.4","type":"grass"},{"id":"1.5","type":"sand"},{"id":"1.6","type":"sand"},{"id":"1.7","type":"sand"},{"id":"1.8","type":"sand"},{"id":"1.9","type":"sand"},{"id":"2.-15","type":"grass"},{"id":"2.-14","type":"grass"},{"id":"2.-13","type":"grass"},{"id":"2.-12","type":"grass"},{"id":"2.-11","type":"rock"},{"id":"2.-10","type":"rock"},{"id":"2.-9","type":"grass"},{"id":"2.-8","type":"grass"},{"id":"2.-7","type":"grass"},{"id":"2.-6","type":"rock"},{"id":"2.-5","type":"rock"},{"id":"2.-4","type":"grass"},{"id":"2.-3","type":"rock"},{"id":"2.-2","type":"rock"},{"id":"2.-1","type":"grass"},{"id":"2.0","type":"grass"},{"id":"2.1","type":"sand"},{"id":"2.2","type":"sand"},{"id":"2.3","type":"sand"},{"id":"2.4","type":"sand"},{"id":"2.5","type":"sand"},{"id":"2.6","type":"sand"},{"id":"2.7","type":"sand"},{"id":"2.8","type":"sand"},{"id":"3.-16","type":"rock"},{"id":"3.-15","type":"grass"},{"id":"3.-14","type":"grass"},{"id":"3.-13","type":"grass"},{"id":"3.-12","type":"grass"},{"id":"3.-11","type":"rock"},{"id":"3.-10","type":"rock"},{"id":"3.-9","type":"grass"},{"id":"3.-8","type":"grass"},{"id":"3.-7","type":"grass"},{"id":"3.-6","type":"grass"},{"id":"3.-5","type":"grass"},{"id":"3.-4","type":"rock"},{"id":"3.-3","type":"grass"},{"id":"3.-2","type":"grass"},{"id":"3.-1","type":"grass"},{"id":"3.0","type":"grass"},{"id":"3.1","type":"sand"},{"id":"3.2","type":"sand"},{"id":"3.3","type":"sand"},{"id":"3.4","type":"sand"},{"id":"3.5","type":"sand"},{"id":"3.6","type":"sand"},{"id":"4.-16","type":"rock"},{"id":"4.-15","type":"rock"},{"id":"4.-14","type":"grass"},{"id":"4.-13","type":"grass"},{"id":"4.-12","type":"grass"},{"id":"4.-9","type":"rock"},{"id":"4.-8","type":"rock"},{"id":"4.-7","type":"grass"},{"id":"4.-6","type":"grass"},{"id":"4.-5","type":"grass"},{"id":"4.-4","type":"grass"},{"id":"4.-3","type":"grass"},{"id":"4.-2","type":"grass"},{"id":"4.-1","type":"grass"},{"id":"4.0","type":"grass"},{"id":"4.1","type":"sand"},{"id":"4.2","type":"sand"},{"id":"4.3","type":"sand"},{"id":"4.4","type":"sand"},{"id":"4.5","type":"sand"},{"id":"4.6","type":"sand"},{"id":"5.-15","type":"rock"},{"id":"5.-14","type":"rock"},{"id":"5.-13","type":"rock"},{"id":"5.-12","type":"rock"},{"id":"5.-9","type":"sand"},{"id":"5.-8","type":"rock"},{"id":"5.-7","type":"rock"},{"id":"5.-6","type":"sand"},{"id":"5.-5","type":"sand"},{"id":"5.-4","type":"grass"},{"id":"5.-3","type":"grass"},{"id":"5.-2","type":"grass"},{"id":"5.-1","type":"grass"},{"id":"5.0","type":"sand"},{"id":"5.1","type":"sand"},{"id":"5.2","type":"sand"},{"id":"5.3","type":"sand"},{"id":"5.4","type":"sand"},{"id":"5.5","type":"sand"},{"id":"6.-14","type":"rock"},{"id":"6.-13","type":"rock"},{"id":"6.-8","type":"sand"},{"id":"6.-7","type":"sand"},{"id":"6.-6","type":"sand"},{"id":"6.-5","type":"sand"},{"id":"6.-4","type":"rock"},{"id":"6.-3","type":"rock"},{"id":"6.-2","type":"rock"},{"id":"6.-1","type":"rock"},{"id":"6.0","type":"sand"},{"id":"6.1","type":"sand"},{"id":"6.2","type":"sand"},{"id":"6.3","type":"sand"},{"id":"7.-5","type":"sand"},{"id":"7.-4","type":"sand"},{"id":"7.-3","type":"rock"},{"id":"7.-2","type":"rock"},{"id":"7.-1","type":"rock"},{"id":"7.0","type":"rock"}]