import { mat4, vec3 } from '../../lib/gl-matrix-module.js';
import { Node } from './Node.js';

export class Drone extends Node{

    constructor(options = {}) {
        super(options);

        this.velocity = vec3.set(vec3.create(), 0, 0, 0);
        this.rotateSensitivity = 1.5;
        this.maxSpeed = 10;
        this.friction = 0.2;
        this.acceleration = 20;
        
        this.maxTilt = this.degreesToRadians(20);

        this.startPitch = this.degreesToRadians(110);
        this.pitch = this.startPitch;

        this.startRoll = this.degreesToRadians(0);
        this.roll = this.startRoll;
    }

    update(dt, keys){
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
             Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));
        const up = vec3.set(vec3.create(),
            0, c.rotation[0], 0);
                
        // 1: add movement acceleration
        let acc = vec3.create();
        
        // Up
        if(keys['Space']){
            vec3.add(acc, acc, up);
        }

        // Down
        if(keys['ShiftLeft']){
            vec3.sub(acc, acc, up);
        }

        //  Forward
        if(keys['KeyW']){
            if(c.pitch > c.startPitch - c.maxTilt){
                c.pitch -= dt * c.rotateSensitivity;
                c.rotation[0] = c.pitch;
            }
            vec3.add(acc, acc, forward);
        }else{
            if(c.pitch < c.startPitch){
                c.pitch += dt * c.rotateSensitivity;
                c.rotation[0] = c.pitch;
            }
        }
        
        // Backward
        if(keys['KeyS']){
            if(c.pitch < c.startPitch + c.maxTilt){
                c.pitch += dt * c.rotateSensitivity;
                c.rotation[0] = c.pitch;
            }
            vec3.sub(acc, acc, forward);
        }else{
            if(c.pitch > c.startPitch){
                c.pitch -= dt * c.rotateSensitivity;
                c.rotation[0] = c.pitch;
            }
        }

        // Left
        if(keys['KeyA']){ 
            c.rotation[1] += dt * c.rotateSensitivity;
            const pi = Math.PI;
            const twopi = pi * 2;
            c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
        }
        
        // Right
        if(keys['KeyD']){
            c.rotation[1] -= dt * c.rotateSensitivity;
            const pi = Math.PI;
            const twopi = pi * 2;
            c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
        }
        
        // 2: update velocity and rotation
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);
        
        // 3: if no movement, apply friction
        if (!keys['KeyW'] &&
            !keys['KeyS'] &&
            !keys['KeyD'] &&
            !keys['KeyA'] &&
            !keys['KeyE'] &&
            !keys['KeyQ'] &&
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
    
        // 6: update the final matrix
        c.updateMatrix();
    }

    degreesToRadians(degrees){
        return degrees * (Math.PI/180);
    }
}
