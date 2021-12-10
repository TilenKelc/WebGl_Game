import { mat4, vec3 } from '../../lib/gl-matrix-module.js';
import { Node } from './Node.js';

export class Camera extends Node {

    constructor(options = {}) {
        super(options);

        this.aspect = options.aspect || 1.5;
        this.fov = options.fov || 1.5;
        this.near = options.near || 1;
        this.far = options.far || Infinity;
        
        this.mode = Camera.MODE_ORBIT;
        this.mouseSensitivity = 0.002;

        this.projection = mat4.create();
        this.updateProjection();
    }

    updateProjection() {
        mat4.perspective(this.projection,
            this.fov, this.aspect,
            this.near, this.far);
    }

    update(plane, scale){
        this.plane = plane;
        this.scale = scale;
        const c = this;

        const vec = vec3.clone(this.plane.translation);
        vec3.add(vec, vec, vec3.fromValues(0, 0, this.scale));
        mat4.fromTranslation(c.matrix, vec);

    }
}
