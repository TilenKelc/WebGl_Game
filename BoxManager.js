import { mat4, vec3, quat } from '../../lib/gl-matrix-module.js';
import { Box } from './Box.js';

export class BoxManager {
    constructor(options = {}) {
        // save first box mesh
        this.mesh =  options.mesh || null;
        this.boxes = options.boxes || [];
        this.maxNumOfBoxes = options.maxNumOfBoxes || 10;
        this.currentNumOfBoxes = 0;

        this.drop = false;

        this.countDown = false;
        this.timeToNext = 500;
        this.timeCounter = 0;
    }

    update(){
        const c = this;
        c.boxes.forEach(function(box) {
            box.update();
        });

        if(c.countDown){
            c.timeCounter += 1;
        }
        if(c.timeCounter >= c.timeToNext){
            c.timeCounter = 0;
            c.countDown = false;
        }
    }

    addBox(scene, drone){
        const c = this;

        if(c.currentNumOfBoxes < c.maxNumOfBoxes){
            let box = new Box();
            box.mesh = c.mesh;
            box.matrix = mat4.clone(drone.matrix);
            
            c.boxes.push(box);
            scene.addNode(box); 

            c.currentNumOfBoxes += 1;
        }
    }
}
