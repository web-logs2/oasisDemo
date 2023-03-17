import { 
    MeshRenderer, 
    WebGLEngine, 
    Engine,
    Mesh,
    Shader,
    BaseMaterial,
    BufferMesh,
    IndexFormat,
    BufferBindFlag,
    Buffer,
    BufferUsage,
    VertexElement,
    VertexElementFormat,
    RenderFace,
    Entity,
} from 'oasis-engine';

import MapSystem from '../../map/index';

export default class Grass {
    // TODO grass instance 好像有点问题
    public grassEntity: Entity;

    private mapSystem: MapSystem;

    constructor(engine: WebGLEngine, mapSystem: MapSystem) {
        this.mapSystem = mapSystem;

        const shader = this.initCustomShader(0.2);
        const grassEntity = engine.createEntity('grass');
        this.grassEntity = grassEntity;
        

        const grassRenderer = grassEntity.addComponent(MeshRenderer);
        const material = new BaseMaterial(engine, shader);
        material.renderFace = RenderFace.Double;
        
        grassEntity.transform.rotate(0, 60, 0);
        grassRenderer.mesh = this.createCustomMesh(engine, 0.05); // Use `createCustomMesh()` to create custom instance cube mesh.
        grassRenderer.setMaterial(material);
    }

    initCustomShader(y: number): Shader {
        const shader = Shader.create(
          "CustomShader",
          `mat4 rotate(float rad, vec3 axis) {
                vec3 a = normalize(axis);
                float s = sin(rad);
                float c = cos(rad);
            return mat4(outerProduct(a,a) * (1.0-c) +
                mat3(c,     a.z*s,  -a.y*s,
                    -a.z*s, c,      a.x*s,
                    a.y*s,  -a.x*s, c));
            }
    
          uniform mat4 u_MVPMat;
            attribute vec4 POSITION;
            attribute vec3 INSTANCE_OFFSET;
            attribute vec3 INSTANCE_COLOR;
            
            uniform mat4 u_MVMat;
            
            varying vec3 v_position;
            varying vec3 v_color;
            
            void main() {
                vec4 position = POSITION;
                position.x += INSTANCE_OFFSET.x;
                // position.x += 2.0;
                position.z += INSTANCE_OFFSET.z;
                position.y += ${y};
    
                float randomAngle = INSTANCE_OFFSET.y;
                mat4 rotateY = rotate(randomAngle, vec3(0.0, 1.0, 0.0));
    
                gl_Position = u_MVPMat * rotateY *  position;
                gl_Position = u_MVPMat *  position;
      
                v_color = INSTANCE_COLOR;
            }`,
      
          `
            varying vec3 v_color;
            uniform vec4 u_color;
            
            void main() {
              gl_FragColor = vec4(0.0, 1.0, 0.0,1.0);
            }
            `
        );
        return shader;
    }

    createCustomMesh(engine: Engine, size: number): Mesh {
        const geometry = new BufferMesh(engine, "CustomCubeGeometry");
        const vertices: Float32Array = new Float32Array([
                -size, size * 2, -size, 
                -1, 0, 0, 
                -size, size * 2, size,
                 -1, 0, 0, 
                 -size, -size * 2, size, 
                 -1, 0, 0, 
                -size, -size * 2, -size, 
                -1, 0, 0,
        ]);

        // const grassGridOffset = 0.5;
        // const grassGrids: any[] = [];
        // this.mapSystem.grids.forEach((grid) => {
        //     if(grid.type === 'grass') {
        //         const [gridX, grixZ] = MapSystem.key2GridXZ(grid.id);
        //         const [x, z] = MapSystem.gridXZ2xz(gridX, grixZ);
        //         // const gridGrassCount = Math.floor(Math.random() * 6);
        //         const gridGrassCount = 1;
        //         for(let i = 0; i < gridGrassCount; i++) {
        //             grassGrids.push({
        //                 // x: x + (Math.random() - 0.5) * grassGridOffset,
        //                 // y: Math.random() * Math.PI * 2,
        //                 // z: z + (Math.random() - 0.5) * grassGridOffset
        //                 x,
        //                 y: Math.random() * Math.PI * 2,
        //                 z,
        //             })
        //         }
        //     }
        // })
        // console.log(grassGrids)
         const instanceCount = 500;
         const instanceStride = 6;
         // const instanceData: Float32Array = new Float32Array(instanceCount * instanceStride);
        // const instanceCount = grassGrids.length;
        const instanceData: Float32Array = new Float32Array(instanceCount * instanceStride);

        // const offset = 60;
        const offsetStep = 20;
        for (let i = 0; i < instanceCount; i++) {
          const offset = i * instanceStride;
          // instance offset
          instanceData[offset] = (Math.random() - 0.5) * offsetStep;
          instanceData[offset + 1] = Math.random() * Math.PI * 2;
          instanceData[offset + 2] = (Math.random() - 0.5) * offsetStep;
        // instanceData[offset] = grassGrids[i].x;
        // instanceData[offset + 1] = grassGrids[i].y;
        // instanceData[offset + 2] = grassGrids[i].z;
        // instanceData[offset] = 0.0;
        // instanceData[offset + 1] = 0.0;
        // instanceData[offset + 2] = 0.0;
          // instance color
          instanceData[offset + 3] = Math.random();
          instanceData[offset + 4] = Math.random();
          instanceData[offset + 5] = Math.random();
        }
      
        const indices: Uint16Array = new Uint16Array([ 0, 2, 1, 2, 0, 3]);
        const vertexBuffer = new Buffer(engine, BufferBindFlag.VertexBuffer, vertices, BufferUsage.Static);
        const instanceVertexBuffer = new Buffer(engine, BufferBindFlag.VertexBuffer, instanceData, BufferUsage.Static);
        const indexBuffer = new Buffer(engine, BufferBindFlag.IndexBuffer, indices, BufferUsage.Static);
      
        // Bind buffer
        geometry.setVertexBufferBinding(vertexBuffer, 24, 0);
        geometry.setVertexBufferBinding(instanceVertexBuffer, 24, 1);
        geometry.setIndexBufferBinding(indexBuffer, IndexFormat.UInt16);
      
        // Add vertexElements
        geometry.setVertexElements([
          new VertexElement("POSITION", 0, VertexElementFormat.Vector3, 0, 0), // Bind to VertexBuffer 0
          new VertexElement("NORMAL", 12, VertexElementFormat.Vector3, 0, 0), // Bind to VertexBuffer 0
          new VertexElement("INSTANCE_OFFSET", 0, VertexElementFormat.Vector3, 1, 1), // Bind instance offset to VertexBuffer 1, and enable instance by set instanceStepRate with 1
          new VertexElement("INSTANCE_COLOR", 12, VertexElementFormat.Vector3, 1, 1) // Bind instance color to VertexBuffer 1, and enable instance by set instanceStepRate with 1
        ]);
      
        // Add one sub geometry.
        geometry.addSubMesh(0, indices.length);
      
        geometry.instanceCount = instanceCount;
    
        const grassBoundSize = 20;
        const bounds = geometry.bounds;
        bounds.min.set(-grassBoundSize, -size, -grassBoundSize);
        bounds.max.set(grassBoundSize, size, grassBoundSize);
      
        return geometry;
    }
}
