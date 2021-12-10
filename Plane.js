import { mat4, vec3 } from '../../lib/gl-matrix-module.js';
import { Node } from './Node.js';

export class Plane extends Node{

    constructor(options = {}) {
        super(options);

        this.fuel = 100;
        this.velocity = vec3.set(vec3.create(), 0, 0, 0);
        this.mouseSensitivity = 0.002;
        this.maxSpeed = 3;
        this.friction = 0.2;
        this.acceleration = 20;

        this.roll = 0;
        this.pitch = 0;

    }

    update(dt, keys){
        this.keys = keys;
        const c = this;
    
        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
             Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));
            
        const up = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), -Math.sin(c.rotation[0]), -Math.cos(c.rotation[1]));
    


        // 1: add movement acceleration
        let acc = vec3.create();
        if(this.keys['Space']){
            vec3.add(acc, acc, forward);
        }
        if(this.keys['KeyW']){
            vec3.add(acc, acc, up);
        }
        if(this.keys['KeyS']){
            vec3.sub(acc, acc, forward);
        }
        if(this.keys['KeyD']){
            vec3.add(acc, acc, right);
        }
        if(this.keys['KeyA']){
            //console.log(acc);
            //console.log(acc);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'] &&
            !this.keys['Space'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }
    
        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
    
        // 5: update translation
        vec3.scaleAndAdd(c.translation, c.translation, c.velocity, dt);
        //vec3.scaleAndAdd(c.rotation, c.rotation, c.velocity, dt);
    
        // 6: update the final transform
        mat4.fromTranslation(c.matrix, c.translation);
        //mat4.rotateX(t, t, c.rotation[2]);
        //mat4.rotateY(t, t, 1);

    }
}
