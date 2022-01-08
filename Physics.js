import { vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { Arrow } from './Arrow.js';
import { Box } from './Box.js';
import { Drone } from './Drone.js';
import { Target } from './Target.js';

export class Physics {

    constructor(scene){
        this.scene = scene;
        this.arrowCollision = false;
        this.addScore = false;
        this.removeItems = [];
    }

    update(dt) {
        this.arrowCollision = false;
        this.addScore = false;
        this.scene.traverse(node => {
            if(node instanceof Drone){
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                node.updateMatrix();
                this.scene.traverse(other => {
                    if(other.aabb.min != null && other.aabb.max != null){
                        if(node !== other) {
                            if(other instanceof Arrow){
                                this.resolveCollision(node, other, true);
                            }else{
                                this.resolveCollision(node, other, false);
                            }
                        }
                    }
                });
            }else if(node instanceof Box){
                this.scene.traverse(other => {
                    if(other.aabb.min != null && other.aabb.max != null){
                        if(node !== other) {
                            this.resolveCollision(node, other, true);
                        }
                    }
                });
            }
        });
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b, check) {
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();
        
        const scalea = mat4.getScaling(mat4.create(), ta);
        const scaleb = mat4.getScaling(mat4.create(), tb);

        let mina = vec3.multiply(vec3.create(), scalea, a.aabb.min);
        let maxa = vec3.multiply(vec3.create(), scalea, a.aabb.max);
        let minb = vec3.multiply(vec3.create(), scaleb, b.aabb.min);
        let maxb = vec3.multiply(vec3.create(), scaleb, b.aabb.max);

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        vec3.add(mina, posa, mina);
        vec3.add(maxa, posa, maxa);
        vec3.add(minb, posb, minb);
        vec3.add(maxb, posb, maxb);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });

        if(!isColliding){
            return;
        }

        if(check && isColliding){
            if((a instanceof Drone) && (b instanceof Arrow)){
                this.arrowCollision = true;
                return;
            }

            if(b instanceof Target){
                this.addScore = true;
            }
            this.removeItems.push(a);
            return;
        }

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), maxb, mina);
        const diffb = vec3.sub(vec3.create(), maxa, minb);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        vec3.add(a.translation, a.translation, minDirection);
        a.updateMatrix();
    }

}
