import { vec3 } from '../../lib/gl-matrix-module.js';
import { Node } from './Node.js';

export class Arrow extends Node {

    constructor(options = {}) {
        super(options);

        this.sensitivity = 1.5;
        this.counter = 15;
        this.directionUp = true;
    }

    update(dt, pos){
        const c = this;

        if(c.directionUp){
            if(c.counter < 17){
                c.counter += dt * c.sensitivity;
            }else{
                c.directionUp = false;
            }
        }else{
            if(c.counter > 13){
                c.counter -= dt * c.sensitivity;
            }else{
                c.directionUp = true;
            }
        }

        c.translation = vec3.fromValues(pos[0], pos[1] + c.counter, pos[2]);

        c.rotation[1] -= dt * c.sensitivity / 2;
        const pi = Math.PI;
        const twopi = pi * 2;
        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
        c.updateMatrix();
    }
}