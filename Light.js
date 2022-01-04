import { Node } from './Node.js';

export class Light extends Node {

    constructor() {
        super();

        Object.assign(this, {
            ambientColor     : [51, 51, 51],
            diffuseColor     : [255, 255, 255],
            specularColor    : [0, 0, 0],
            shininess        : 1,
            attenuatuion     : [1.0, 0, 0.0002]
        });
    }

}