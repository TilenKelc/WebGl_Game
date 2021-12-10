import { Application } from '../../common/engine/Application.js';
import { GUI } from '../../lib/dat.gui.module.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Camera } from './Camera.js';
import { Node } from './Node.js';
import { Renderer } from './Renderer.js';

import { mat4, vec3, quat } from '../../lib/gl-matrix-module.js';
import { Plane } from './Plane.js';


class App extends Application {

    initHandlers() {
        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.mouseZoomHandler = this.mouseZoomHandler.bind(this);
        this.keys = {};

        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        document.addEventListener('wheel', this.mouseZoomHandler);
    }

    async start() {
        const gl = this.gl;

        this.initHandlers();

        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/scene/example_scene.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        
        /*
        this.camera = await this.loader.loadNode('Camera');

        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }*/
        
        this.time = Date.now();
        this.startTime = this.time;

        this.camera = new Camera();
        this.scene.addNode(this.camera);
        
        //find plane node
        this.plane = null;
        this.scene.traverse(node => {
            if (node instanceof Plane) {
                this.plane = node;
            }
        });

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();  

        //this.camera.matrix = mat4.clone(this.plane.matrix);
        //this.camera.updateTransform();
        
        //console.log(this.camera.matrix);
        mat4.fromTranslation(this.camera.matrix, vec3.fromValues(0, 0, 5));

        //console.log(this.camera.matrix);
        
        //this.camera.matrix = mat4.fromTranslation(this.camera.matrix, [7, 5, 10]);
        this.scale = 10;
        console.log(this.scene);
    }

    update(){
        this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if(this.plane){                     
            this.plane.update(dt, this.keys);     
            this.camera.update(this.plane, this.scale);
            //console.log("plane"); 
            //console.log(this.plane.matrix);
            //console.log("camera")
            //console.log(this.camera.matrix);
        }
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.aspect = aspectRatio;
            this.camera.updateProjection();
        }
    }

    enableMouseLook() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (document.pointerLockElement === this.canvas) {
            this.canvas.addEventListener('mousemove', this.mousemoveHandler);
        } else {
            this.canvas.removeEventListener('mousemove', this.mousemoveHandler);
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this.plane;
        c.rotation[0] -= dy * c.mouseSensitivity;
        c.rotation[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        // Limit pitch
        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        // Constrain yaw to the range [0, pi * 2]
        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    mouseZoomHandler(e){
        this.scale += e.deltaY * -0.01;
        this.scale = Math.min(Math.max(5, this.scale), 10);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, 'enableMouseLook');});
