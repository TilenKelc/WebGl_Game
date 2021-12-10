import { mat4, vec3, quat } from '../../lib/gl-matrix-module.js';
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

        this.yawSensitivity = 0.02;
        this.yaw = 0;
        this.pitch = 0;

    }

    update(dt, keys){
        const c = this;
    
        
        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
             Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));
            
        //const up = vec3.set(vec3.create(),
        //    -Math.sin(c.rotation[1]), , -Math.cos(c.rotation[1]));
    


        // 1: add movement acceleration
        let acc = vec3.create();
        if(keys['Space']){
            vec3.add(acc, acc, forward);
        }
        if(keys['KeyW']){
            vec3.add(acc, acc, forward);
        }
        if(keys['KeyS']){
            vec3.sub(acc, acc, forward);
        }
        if(keys['KeyD']){
            vec3.add(acc, acc, right);
        }
        
        
        if(keys['KeyQ']){
            /*
            if(this.roll < 30){
                mat4.rotateX(c.matrix, c.matrix, this.roll * 0.001);
                c.updateTransform();
                this.roll += 1;
            }*/
            mat4.rotateZ(c.matrix, c.matrix, this.yawSensitivity);
            c.updateTransform();
        }/*else{
            if(this.roll > 0){
                mat4.rotateX(c.matrix, c.matrix, -this.roll * 0.001);
                c.updateTransform();
                this.roll -= 1;
            } 
        }*/
        


        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!keys['KeyW'] &&
            !keys['KeyS'] &&
            !keys['KeyD'] &&
            !keys['KeyA'] &&
            !keys['Space'])
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
        mat4.fromRotationTranslationScale(c.matrix, c.rotation, c.translation, c.scale);
    }
}
