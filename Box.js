import { mat4, vec3, quat } from '../../lib/gl-matrix-module.js';
import { Node } from './Node.js';

export class Box extends Node {

    constructor(options = {}) {
        super(options);

        this.fallSpeed = 10;
    }

    update(){
        const c = this;
        
        let vec = vec3.create();
        mat4.getTranslation(vec, c.matrix);
        
        if(vec[1] >= -10){
            vec3.add(vec, vec, vec3.fromValues(0, -c.fallSpeed * 0.01, 0));
            c.translation = vec;
            c.updateMatrix();
        }
    }
}
