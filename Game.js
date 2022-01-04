import { Application } from '../../common/engine/Application.js';
import { mat4, vec3, quat } from '../../lib/gl-matrix-module.js';

import { GUI } from '../../lib/dat.gui.module.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Camera } from './Camera.js';
import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
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
        this.mouseLock = false;
        this.keys = {};

        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        document.addEventListener('wheel', this.mouseZoomHandler);
        document.addEventListener('click', this.mouseClickHandler);

        this.boxManager = new BoxManager();
        //let lightLocations = [[200, 200], [-200, 200], [-200, -200], [200, -200]];
        
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

        let lightLocations = [[-5, -5], [-5, 5], [5, 5], [5, -5]];
        this.lights = []
        for (let i = 0; i < 4; i++) {
            let light = new Light();
            mat4.fromTranslation(light.matrix, [lightLocations[i][0], 5, lightLocations[i][1]]);;
            this.lights.push(light);
        }
        
        // find drone and box
        this.drone = null;
        let box = null;
        await this.scene.traverse(node => {
            if (node instanceof Drone) {
                this.drone = node;
            }else if(node instanceof Box){
                box = node;
            }
        });
        this.boxManager.mesh = box.mesh;        

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();  

        this.scene.removeNode(box);
        this.physics = new Physics(this.scene);

        console.log(this.scene);
    }

    update(){
        this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if(this.mouseLock){
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
    
            if (this.physics) {
                this.physics.update(dt);
            }
            
            if(this.scene){
                let lightCounter = 0;
                this.scene.traverse(node => {
                    if (node instanceof Light && lightCounter < 3) {
                        node.diffuseColor[lightCounter] = Math.sin(this.time / 1000 + lightCounter * Math.PI/2) * 255;
                        node.specularColor[lightCounter] = Math.sin(this.time / 1000 + lightCounter * Math.PI/3) * 255;
                        lightCounter++;
                    }
                });
            }
        }
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera, this.lights);
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
            this.mouseLock = true;
            this.canvas.addEventListener('mousemove', this.mousemoveHandler);
        } else {
            this.mouseLock = false;
            this.canvas.removeEventListener('mousemove', this.mousemoveHandler);
        }
    }

    mousemoveHandler(e) {
        const c = this.camera;
        const dx = e.movementX;
        const dy = e.movementY;

        let heightChange = dy * c.mouseSensitivity;
        //console.log(c.height -= heightChange)
        c.height -= heightChange;        

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
        c.distance = Math.min(Math.max(5, scale), 200);
    }

    mouseClickHandler(e){
        if(!this.boxManager.countDown && this.mouseLock){
            this.boxManager.drop = true;
            this.boxManager.countDown = true;
        }
    }
}

function showGame() {
    const canvas = document.querySelector('canvas');
    canvas.style.background='none';
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, 'enableMouseLook');

    //app.enableMouseLook();
};


//start screen
let startButtonPressed = document.getElementById('startButton');
let quitButton = document.getElementById('back');
let titleImage = document.getElementById('testimage');
let scoreCounter = document.getElementById('scoreCounter');
let score = document.getElementById('score');
startButtonPressed.onclick = function(){
    showGame();
    startButtonPressed.style.display = 'none';
    quitButton.style.display = 'block';
    titleImage.style.display ='none';
    scoreCounter.style.display='block';
    document.getElementById('startScreen').style.display = 'none';
}

let s = 0;
let addPoints = document.getElementById('addPoints');
addPoints.onclick = function(){
    s += 100;
    score.innerHTML = s;
}

//mute and unmute
let music = document.getElementById('music');
let muteButton = document.getElementById('muteMusic');
muteButton.onclick = function(){
    if(!music.muted){
        music.muted = true;
        muteButton.style.background = "url('https://img.icons8.com/ios/50/000000/mute--v1.png')";
    }
    else{
        music.muted = false;
        muteButton.style.background = "url('https://img.icons8.com/ios/50/000000/mute--v2.png')";
    }
}

//mute using mute key on keyboard
document.onkeydown = function(event){
    if(event.key == "m" || event.key == "M"){
        if(!music.muted){
            music.muted = true;
            muteButton.style.background = "url('https://img.icons8.com/ios/50/000000/mute--v1.png')";
        }
        else{
            music.muted = false;
            muteButton.style.background = "url('https://img.icons8.com/ios/50/000000/mute--v2.png')";
        }
    }
    return false;
}
