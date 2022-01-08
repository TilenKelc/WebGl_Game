import { vec3 } from '../../lib/gl-matrix-module.js';
import { Box } from './Box.js';

export class Manager {
    constructor(options = {}){
        this.boxCopy = null;

        this.boxes = [];
        this.targets = [];

        this.setTarget = true;
        this.currentTarget = null;
        this.addArrow = false;
    }

    update(dt){
        const c = this;

        if(c.setTarget){
            c.currentTarget = c.targets[Math.floor(Math.random() * c.targets.length)];            
            c.setTarget = false;
            c.addArrow = true;
        }

        c.boxes.forEach(function(box) {
            box.update(dt);
        });
    }

    dropBox(scene, drone){
        const c = this;

        let box = new Box();
        box.mesh = c.boxCopy.mesh;

        box.aabb.min = c.boxCopy.mesh.primitives[0].attributes.POSITION.min;
        box.aabb.max = c.boxCopy.mesh.primitives[0].attributes.POSITION.max;

        box.scale = vec3.clone(c.boxCopy.scale);
        box.rotation = vec3.clone(drone.rotation);
        box.translation = vec3.fromValues(drone.translation[0], drone.translation[1] - 3, drone.translation[2]);
        box.updateMatrix();

        c.boxes.push(box);
        scene.addNode(box);
    }
}
