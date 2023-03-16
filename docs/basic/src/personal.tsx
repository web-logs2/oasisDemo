import React, { useEffect } from 'react';
import { 
    AnimationClip,
    BlinnPhongMaterial,
    BoxColliderShape,
    Color,
    Entity,
    MeshRenderer,
    PrimitiveMesh,
    WebGLEngine,
    GLTFResource,
    PBRMaterial,
    DirectLight,
    Camera,
    Vector3,
    Ray,
    ShadowResolution,
    ShadowCascadesMode,
    StaticCollider,
    ShadowType,
    Layer,
    Vector2,
} from 'oasis-engine';
import { GridControl } from "oasis-engine-toolkit";
import { PhysXPhysics } from "@oasis-engine/physics-physx";
import { GameCtrl, GameState } from './GameCtrl';
import { ModuleEvent, SocketEvent } from './GameCtrl/event'
import { cube, Mesh } from './utils/simpleMesh';
import CameraViewHelper from '../../Scripts/cameraViewHelper'
import ViewHelper  from '../../Scripts/viewHelper'
import { Line, DashLine, LineCap, LineJoin } from "@oasis-engine-toolkit/lines";

const cameraConfig = {
    "filedOfView": 45,
    "radius": 8,
    "buffer": 0,
    "theta": 0,
    "phi": 90,
    "minPolarAngle": 50,
    "maxPolarAngle": 90,
    "altitude": 2
  }
  

export default () => {
    useEffect(() => {
        const myAvatar = {
            isSelf: true,
            id: "1001",
            nickName: "木头",
            title: "hello",
            headImg: "",
            sex: "male",
            model: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
            animation: "https://gw.alipayobjects.com/os/bmw-prod/5e3c1e4e-496e-45f8-8e05-f89f2bd5e4a4.glb",
            position: { x: 0, y: 0, z: 0 },
            rotation: 90,
        };

        const engine = new WebGLEngine("canvas");
        engine.canvas.resizeByClientSize();

        const scene = engine.sceneManager.activeScene;
        scene.ambientLight.diffuseSolidColor.set(1, 1, 1, 1);
        scene.ambientLight.diffuseIntensity = 0.1;
        scene.background.solidColor.set(1, 1, 1, 1);

        const rootEntity = scene.createRootEntity("root");

        const meshFactory = new Mesh(engine, rootEntity);
        
        const cameraEntity = rootEntity.createChild("CameraParent");
        
        cameraEntity.addComponent(CameraViewHelper);
        const camera = cameraEntity.createChild("Camera");
        const { radius, filedOfView, altitude } = cameraConfig;
        let phi = (cameraConfig.phi / 180) * Math.PI;
        let theta = (cameraConfig.theta / 180) * Math.PI;
        const sinPhiRadius = Math.sin(phi) * radius;
        camera.transform.position.set(
          sinPhiRadius * Math.sin(theta),
          radius * Math.cos(phi) + altitude,
          sinPhiRadius * Math.cos(theta)
        );
        camera.transform.position.y += 2;

        const cameraComponent = camera.addComponent(Camera);
        // console.log('cameraComponent.', cameraComponent)
        // const e = cameraEntity.transform.worldMatrix.elements;
    
        // console.log('worldForward', -e[8], -e[9], -e[10])
        cameraComponent.cullingMask = Layer.Layer0;
        cameraComponent.fieldOfView = filedOfView;
        cameraComponent.farClipPlane = 800;
        camera.transform.lookAt(new Vector3(0, 0, 0));
        // 初始化辅助坐标系
        const grid = rootEntity.addComponent(GridControl);
        grid.camera = cameraComponent;

        const lightEntity = rootEntity.createChild("DirectLight");
        lightEntity.transform.setPosition(8, 10, 10);
        lightEntity.transform.lookAt(new Vector3(0, 0, 0));
        const directLight = lightEntity.addComponent(DirectLight);
        directLight.intensity = 1;
        directLight.shadowStrength = 0.3;
        directLight.shadowBias = 2;
        directLight.shadowType = ShadowType.Hard;
        scene.shadowDistance = 17;
        scene.shadowCascades = ShadowCascadesMode.NoCascades;
        scene.shadowResolution = ShadowResolution.Medium;

        const walls: Entity[] = [];
        PhysXPhysics.initialize()
        .then(() => {
            engine.physicsManager.initialize(PhysXPhysics);
            const game = new GameCtrl();
            
            game.setUp();
            game.engine = engine;
            game.root = rootEntity;
            game.camera = camera;
            game.scene = scene;
            game.directLight = lightEntity;  
            game.jumpState(GameState.InitModule);

           const cubes = initRoom();
            walls.push(...cubes);
        
        })

        engine.on(ModuleEvent.jumpMap, () => {
            engine.dispatch(SocketEvent.enterAvatar_ToG, [myAvatar]);
            engine.on('avatarModelLoaded', (avatar) => {
                const { val, modelEntity } = avatar;
                console.log('avatarModelLoaded', modelEntity);
                modelEntity.addComponent(ViewHelper)
                // avatar
            })
        })

        engine.on('gameCtrlCreateUnit', (unit) => {
            // 监听人物移动 - target change
            unit.entity.addComponent(ViewHelper);
        })

        const view = new Vector3(0, 0, 0);
        const target = new Vector3(0, 0, 0);

        engine.on('avatarTargetChange', (newTarget) => {
            // console.log('avatarTargetChange', newTarget)
            target.copyFrom(newTarget);
            viewTargetChange();
        })
        engine.on('viewChange', (newView) => {
            // console.log('viewChange', newView)
            view.copyFrom(newView);
            viewTargetChange();
            // modelEntity.addComponent(ViewHelper);
            // unit.entity.addComponent(ViewHelper);
        })

        let selectWall: BlinnPhongMaterial|null = null;

        const redMat = new PBRMaterial(engine);
        redMat.baseColor = new Color(1, 0, 0, 1);
        function viewTargetChange() {
            const origin = view;
            const direction = target.subtract(view).normalize();
            const ray = new Ray(origin, direction);
            // ray.intersectBox()

            walls.forEach(wall => {
                const renderer = wall.getComponent(MeshRenderer);
                const bounds = renderer.bounds;
                // console.log(bounds)
                const intersect = ray.intersectBox(bounds);
                
                if (intersect > 0) {
                    // console.log(wall)
                    // renderer.setMaterial(redMat);
                    // if(selectWall) {
                    //     selectWall.baseColor.r = 1;
                    //     selectWall.baseColor.a = 1;
                    // }
                    // material

                    const mat = renderer.getMaterial() as BlinnPhongMaterial;
                    mat.isTransparent = true;
                    // mat.baseColor.r = 0.5;
                    mat.baseColor.a = 0;
                    // selectWall = mat;
                    // selectWall = mat;
                    // mat.baseColor.set(1, 0, 0, 1)
                    // mat.baseColor.r = 0.5
                    // console.log(mat.baseColor.r)
                    
                } else {
                    const mat = renderer.getMaterial() as BlinnPhongMaterial;
                    mat.isTransparent = false;
                    mat.baseColor.a = 1;
                }
            })
            // const bounds = cubeEntity.getComponent(MeshRenderer).bounds

            // .intersectPlane(new Plane(new Vector3(0, 1, 0), 0), camera.transform.position
        }

        const lineEntity = rootEntity.createChild("Line");
        const line = lineEntity.addComponent(Line);
        line.points = [
            new Vector2(0, 0),
            new Vector2(1, 1),
        ];

        function initRoom() {
            const size = 4;
            const doubleSize = size * 2;
            const height = 3;
            const halfHeight = height / 2;
            
            const cubeEntity = meshFactory.createColliderCube(0.2, height, doubleSize);
            cubeEntity.transform.position.y = halfHeight;
            cubeEntity.transform.position.x = size;
            rootEntity.addChild(cubeEntity);
    
            const cubeEntity2 = meshFactory.createColliderCube(0.2, height, doubleSize);
            cubeEntity2.transform.position.y = halfHeight;
            cubeEntity2.transform.position.x = -size;
            rootEntity.addChild(cubeEntity2);
    
            const cubeEntity3 = meshFactory.createColliderCube(doubleSize, height, 0.2);
            cubeEntity3.transform.position.y = halfHeight;
            cubeEntity3.transform.position.z = size;
            rootEntity.addChild(cubeEntity3);
    
            const cubeEntity4 = meshFactory.createColliderCube(doubleSize, height, 0.2);
            cubeEntity4.transform.position.y = halfHeight;
            cubeEntity4.transform.position.z = -size;
            rootEntity.addChild(cubeEntity4);

            return [cubeEntity, cubeEntity2, cubeEntity3, cubeEntity4]
        }

        

      


        // GameCtrl.ins.jumpState(GameState.InitEngine);
        // GameCtrl.ins.engine.on(ModuleEvent.jumpMap, () => {
        //     const { engine, scene, root } = GameCtrl.ins;
        //     engine.dispatch(SocketEvent.enterAvatar_ToG, [myAvatar]);
        //     // add avatar loaded event
        //     engine.on('avatarModelLoaded', (avatar) => {
        //         console.log('avatarModelLoaded', avatar);
        //         const cubeEntity = root.createChild("cube");
        //         cubeEntity.addComponent(RotateScript);
        //         const cube = cubeEntity.addComponent(MeshRenderer);
        //         cube.mesh = PrimitiveMesh.createCuboid(engine, 2, 2, 2);
        //         const material = new BlinnPhongMaterial(engine);
        //         cube.setMaterial(material);
        //     })
        // })
    }, [])


    return <div style={{ height: '500px' }}>
        <canvas id="canvas" style={{
            width: '100%',
            height: '100%',
            outline: 'none',
        }}/>
    </div>
};