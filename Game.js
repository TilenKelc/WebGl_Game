import { Application } from '../../common/engine/Application.js';
import { GUI } from '../../lib/dat.gui.module.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Camera } from './Camera.js';
import { Node } from './Node.js';
import { Renderer } from './Renderer.js';

import { mat4, vec3, quat } from '../../lib/gl-matrix-module.js';
import { Plane } from './Plane.js';
import { Box } from './Box.js';
import { BoxManager } from './BoxManager.js';


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
        
        // find plane
        this.plane = null;
        this.scene.traverse(node => {
            if (node instanceof Plane) {
                this.plane = node;
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
        console.log(this.boxManager)
        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();  

        this.scene.removeNode(box);

        console.log(this.scene);
    }

    update(){
        this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if(this.plane){                     
            this.plane.update(dt, this.keys);     
            this.camera.update(this.plane);
        }

        if(this.boxManager){
            this.boxManager.update();

            if(this.boxManager.drop){
                this.boxManager.addBox(this.scene, this.plane);
            }
            this.boxManager.drop = false;
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
        const c = this.camera;
        const dx = e.movementX;
        const dy = e.movementY;

        let pitchChange = dy * c.mouseSensitivity;
        c.pitch -= pitchChange;

        let yawChange = dx * c.mouseSensitivity;
        c.yaw -= yawChange;
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
        c.distance = Math.min(Math.max(5, scale), 20);
    }

    mouseClickHandler(e){
        if(!this.boxManager.countDown){
            this.boxManager.drop = true;
            this.boxManager.countDown = true;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, 'enableMouseLook');
});
