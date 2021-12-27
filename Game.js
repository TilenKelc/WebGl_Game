import { Application } from '../../common/engine/Application.js';
import { mat4, vec3, quat } from '../../lib/gl-matrix-module.js';

import { GUI } from '../../lib/dat.gui.module.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Camera } from './Camera.js';
import { Renderer } from './Renderer.js';

import { Drone } from './Drone.js';
import { Box } from './Box.js';
import { BoxManager } from './BoxManager.js';
import { Light } from './Light.js';

class App extends Application {

    initHandlers() {
        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.mouseZoomHandler = this.mouseZoomHandler.bind(this);
        this.mouseClickHandler = this.mouseClickHandler.bind(this);
        this.keys = {};

        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        document.addEventListener('wheel', this.mouseZoomHandler);
        document.addEventListener('click', this.mouseClickHandler);

        this.light = new Light();
    }

    async start() {
        const gl = this.gl;

        this.initHandlers();

        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/scene/scene.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);

        this.time = Date.now();
        this.startTime = this.time;
        

        this.camera = new Camera();
        this.scene.addNode(this.camera);
        this.scene.addNode(this.light);
        
        // find drone
        this.drone = null;
        this.scene.traverse(node => {
            if (node instanceof Drone) {
                this.drone = node;
            }
        });

        // find box
        this.boxManager = new BoxManager();
        let box = null;
        this.scene.traverse(node => {
            if (node instanceof Box) {
                box = node;
            }
        });
        this.boxManager.mesh = box.mesh;

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();  

        this.scene.removeNode(box);

        console.log(this.scene);
        console.log(quat);
    }

    update(){
        this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if(this.drone){                     
            this.drone.update(dt, this.keys, this.camera);     
            this.camera.update(this.drone);
        }

        if(this.boxManager){
            this.boxManager.update();

            if(this.boxManager.drop){
                this.boxManager.addBox(this.scene, this.drone);
            }
            this.boxManager.drop = false;
        }
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera, this.light);
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
        const c = this.camera;
        const dx = e.movementX;
        const dy = e.movementY;

        let pitchChange = dy * c.mouseSensitivity;
        c.pitch -= pitchChange;

        let yawChange = dx * c.mouseSensitivity;
        c.yaw -= yawChange;

        //console.log(c.yaw)
        /*
        const dx = e.movementX;
        const c = this.drone;
        console.log(dx);
        console.log(c.rotation[1]);
        c.rotation[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;
        console.log(c.rotation[1]);

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;*/
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    mouseZoomHandler(e){
        const c = this.camera;
        let scale = c.distance;

        scale += e.deltaY * -0.01;
        c.distance = Math.min(Math.max(5, scale), 200);
    }

    mouseClickHandler(e){
        /*
        if(!this.boxManager.countDown){
            this.boxManager.drop = true;
            this.boxManager.countDown = true;
        }
        */
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app.light, 'ambient', 0.0, 1.0);
    gui.add(app.light, 'diffuse', 0.0, 1.0);
    gui.add(app.light, 'specular', 0.0, 1.0);
    gui.add(app.light, 'shininess', 0.0, 1000.0);
    gui.addColor(app.light, 'color');
    for (let i = 0; i < 3; i++) {
        gui.add(app.light.position, i, -10.0, 10.0).name('position.' + String.fromCharCode('x'.charCodeAt(0) + i));
    }
    gui.add(app, 'enableMouseLook');
});
