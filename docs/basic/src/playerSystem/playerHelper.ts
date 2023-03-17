import { BlinnPhongMaterial, Entity, PrimitiveMesh, MeshRenderer, WebGLEngine } from 'oasis-engine';
import MapSystem from "../map/index";

export default class PlayerHelper {
    public entity: Entity;
    public player: Entity | null = null;

    private mapSystem: MapSystem;
    private engine: WebGLEngine;
    private inited: boolean = false;
    private sphere: Entity;
    private core1: Entity;
    private core2: Entity;
    private core3: Entity;
    private core4: Entity;
    private core6: Entity;
    private core7: Entity;
    private core8: Entity;
    private core9: Entity;
    private playerGridXZ: number[] = [0, 0];
    private lastDirEntity: number = 0;
    private dirEntity: Entity[];

    get rotateY() {
        if(this.player) {
            return this.player.transform.rotation.y;
        } else {
            return 90;
        }
    }

    get grid() {
        return this.playerGridXZ;
    }

    constructor(engine: WebGLEngine, mapSystem: MapSystem) {
        this.engine = engine;
        this.mapSystem = mapSystem;
        this.entity = this.engine.createEntity('player');

        this.engine.on('avatarPlay', () => {
            if(this.player) {
                const { x, z } = this.player.transform.position;
                this.move(x, z)
            }
            
        });
    }

    move(x: number, z: number) {
        if(!this.inited) {
            this.setup(x, z);
            return;
        }
        const [ gridX, gridZ ] = MapSystem.xz2Grid(x, z);
        if(this.isMoved(gridX, gridZ)) {

            this.engine.dispatch('gridCross', {
                gridX,
                gridZ,
                x,
                z, 
            });

            this.playerGridXZ = [gridX, gridZ];
            this.updateHelper(gridX, gridZ);

            const [ centerX, centerZ ] = MapSystem.gridXZ2xz(gridX, gridZ);
            this.entity.transform.setPosition(centerX, 0, centerZ);

            if(this.player) {
                const forward = this.getForwardDir(this.player.transform.rotation.y);
                this.updateDir(forward);
            }
        }
    }

    getForwardDir(rotateY: number) {
        const num = Math.floor((rotateY + 180) / 22.5) + 1;
        const dirs = {
            16: 2, // top
            1: 2,
            2: 1, // left - top
            3: 1,
            4: 4, // left
            5: 4,
            6: 7, // left - bottom
            7: 7,
            8: 8, // bottom
            9: 8,
            10: 9, // right - bottom
            11: 9,
            12: 6, // right
            13: 6,
            14: 3, // right - top
            15: 3,
        }
        const forward = dirs[num];
        return forward;
    }

    isMoved(gridX: number, gridZ: number) {
        return this.playerGridXZ[0] !== gridX || this.playerGridXZ[1] !== gridZ;
    }

    setup(x: number, z: number, player?: Entity) {
        if(player) {
            this.player = player;
        }
        const [ gridX, gridZ ] = MapSystem.xz2Grid(x, z);
        const [centerX, centerY] = this.mapSystem.formatXZ(x, z);
        this.entity.transform.setPosition(centerX, 0.1, centerY);

        this.playerGridXZ = [gridX, gridZ];

        const sphere = this.initSphere();
        this.entity.addChild(sphere);
        this.sphere = sphere;

        this.core1 = this.initCone(1);
        this.entity.addChild(this.core1);

        this.core2 = this.initCone(2);
        this.entity.addChild(this.core2);

        this.core3 = this.initCone(3);
        this.entity.addChild(this.core3);

        this.core4 = this.initCone(4);
        this.entity.addChild(this.core4);

        this.core6 = this.initCone(6);
        this.entity.addChild(this.core6);

        this.core7 = this.initCone(7);
        this.entity.addChild(this.core7);

        this.core8 = this.initCone(8);
        this.entity.addChild(this.core8);

        this.core9 = this.initCone(9);
        this.entity.addChild(this.core9);

        this.dirEntity = [
            this.core1, this.core2, this.core3, 
            this.core4, this.sphere, this.core6, 
            this.core7, this.core8, this.core9
        ];
        this.lastDirEntity = 1;
       
        this.inited = true;
    }

    initSphere(radius = 0.2) {
        const entity = this.engine.createEntity('sphere');
        const renderer = entity.addComponent(MeshRenderer);
        renderer.mesh = PrimitiveMesh.createSphere(this.engine, radius);
        const material = new BlinnPhongMaterial(this.engine);
        material.baseColor.set(1, 0, 0, 1);
        renderer.setMaterial(material);
        entity.transform.setPosition(0, radius, 0);
        return entity;
    }

    initCone(num: number) {
        /**
         * 1 2 3
         * 4 5 6
         * 7 8 9
         */
        const dir = { // [x, z, radio]
            1: [-1, -1, 225],
            2: [0, -1, 180],
            3: [1, -1, 135],
            4: [-1, 0, -90],
            6: [1, 0, 90],
            7: [-1, 1, -45],
            8: [0, 1, 0],
            9: [1, 1, 45],
        }
        const entity = this.engine.createEntity('cone');
        
        const renderer = entity.addComponent(MeshRenderer);
        const radius = 0.1;
        renderer.mesh = PrimitiveMesh.createCone(this.engine, radius, 1);
        // Create material
        const material = new BlinnPhongMaterial(this.engine);
        material.baseColor.set(1, 0, 0, 1);
        renderer.setMaterial(material);
        
        const [x, z, radio] = dir[num];
        entity.transform.rotate(90, radio, 0);
        entity.transform.setPosition(x, 0.2, z);
        return entity;
    }

    updateDir(dir: number) {
        if(this.lastDirEntity !== dir) {
            const entity = this.dirEntity[this.lastDirEntity - 1] as Entity; 
            const renderer = entity.getComponent(MeshRenderer) as MeshRenderer;
            const material = renderer.getMaterial() as BlinnPhongMaterial;
            material.baseColor.set(1, 0, 0, 1);

            const dirEntity = this.dirEntity[dir - 1] as Entity;
            const dirRenderer = dirEntity.getComponent(MeshRenderer) as MeshRenderer;
            const dirMaterial = dirRenderer.getMaterial() as BlinnPhongMaterial;
            dirMaterial.baseColor.set(1, 1, 0, 1);
            
            this.lastDirEntity = dir;
        }
    }

    updateHelper(gridX: number, gridZ: number) {
        const grids = this.mapSystem.getNineGrids(gridX, gridZ);
        this.updateVisible(grids)
    }

    updateVisible(grids: any[]) {
        const [
            grid1, grid2, grid3,
            grid4, grid5, grid6,
            grid7, grid8, grid9
        ] = grids;
        this.core1.isActive = !!grid1;
        this.core2.isActive = !!grid2;
        this.core3.isActive = !!grid3;
        this.core4.isActive = !!grid4;
        this.sphere.isActive = !!grid5;
        this.core6.isActive = !!grid6;
        this.core7.isActive = !!grid7;
        this.core8.isActive = !!grid8;
        this.core9.isActive = !!grid9;
    }
}