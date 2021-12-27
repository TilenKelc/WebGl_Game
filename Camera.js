import { mat4, vec3, quat } from '../../lib/gl-matrix-module.js';
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

        this.pitch = 0;
        this.yaw = 0;

        this.projection = mat4.create();
        this.view = mat4.create();
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
        //let camY = this.distance;
        let camZ = Math.cos(c.yaw) * c.distance;


        var viewMatrix = mat4.create();

        mat4.invert(viewMatrix, c.matrix);

        mat4.multiply(c.matrix, c.projection, viewMatrix);
        mat4.fromTranslation(c.matrix, vec3.fromValues(camX, 0, camZ));
        
        const vec = vec3.create();
        vec3.add(vec, vec3.clone(drone.translation), vec3.fromValues(camX, 0, camZ));
        var moveMatrix = mat4.create();
        mat4.fromTranslation(moveMatrix,  vec);
        mat4.multiply(c.matrix, c.matrix, moveMatrix);

        /*
        var tmp = mat4.create();
        mat4.lookAt(tmp, vec3.fromValues(c.matrix[12], c.matrix[13], c.matrix[14]), vec3.fromValues(plane.matrix[12], plane.matrix[13], plane.matrix[14]), vec3.fromValues(0, 1, 0));
        mat4.multiply(viewMatrix, viewMatrix, tmp);
        */

        var rotYMatrix = mat4.create();
        mat4.fromYRotation(rotYMatrix, c.yaw);
        mat4.multiply(c.matrix, c.matrix, rotYMatrix);

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

