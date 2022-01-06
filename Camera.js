import { mat4, vec3 } from '../../lib/gl-matrix-module.js';
import { Node } from './Node.js';

export class Camera extends Node {

    constructor(options = {}) {
        super(options);

        this.aspect = options.aspect || 1.5;
        this.fov = options.fov || 1.5;
        this.near = options.near || 1;
        this.far = options.far || Infinity; 
        this.mouseSensitivity = 0.002;

        this.distance = 10;
        this.height = 0;
        this.lastHeight = this.height;

        this.yaw = 0;

        this.projection = mat4.create();
        this.updateProjection();
    }

    updateProjection() {
        mat4.perspective(this.projection,
            this.fov, this.aspect,
            this.near, this.far);
    }

    update(drone){
        const c = this;

        let camX = Math.sin(c.yaw) * c.distance;
        let camY = c.height;
        let camZ = Math.cos(c.yaw) * c.distance;

        let viewMatrix = mat4.create();
        mat4.invert(viewMatrix, c.matrix);

        mat4.multiply(c.matrix, c.projection, viewMatrix);
        mat4.fromTranslation(c.matrix, vec3.fromValues(camX, camY, camZ));
        
        let vec = vec3.create();
        vec3.add(vec, vec3.clone(drone.translation), vec3.fromValues(camX, 0, camZ));
        let moveMatrix = mat4.create();
        mat4.fromTranslation(moveMatrix,  vec);
        mat4.multiply(c.matrix, c.matrix, moveMatrix);        

        let rotYMatrix = mat4.create();
        mat4.fromYRotation(rotYMatrix, c.yaw);
        mat4.multiply(c.matrix, c.matrix, rotYMatrix);

        let pitch = -Math.tan(c.height / c.distance);
        let rotXMatrix = mat4.create();
        mat4.fromXRotation(rotXMatrix, pitch);
        mat4.multiply(c.matrix, c.matrix, rotXMatrix);

        //console.log(c.outOfBounds);


        /*
        var rotXMatrix = mat4.create();
        mat4.fromYRotation(rotXMatrix, c.pitch);

        var rotXMatrix = mat4.create();
        mat4.fromXRotation(rotXMatrix, -c.pitch);
        mat4.multiply(c.matrix, c.matrix, rotXMatrix);
        */
        //console.log(c.matrix[12], c.matrix[13], c.matrix[14])

        //mat4.lookAt(c.matrix, vec, vec)
    }
}

