import { Application } from "../../common/engine/Application.js";
import { mat4, vec3, quat } from "../../lib/gl-matrix-module.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Camera } from "./Camera.js";
import { Renderer } from "./Renderer.js";
import { Physics } from "./Physics.js";
import { Drone } from "./Drone.js";
import { Box } from "./Box.js";
import { BoxManager } from "./BoxManager.js";
import { Light } from "./Light.js";
export class App extends Application {
  constructor(canvas) {
    super(canvas);
    this.finalScore = 0;
    this.score = document.getElementById("score");
  }
  initHandlers() {
    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    this.mousemoveHandler = this.mousemoveHandler.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.mouseZoomHandler = this.mouseZoomHandler.bind(this);
    this.mouseClickHandler = this.mouseClickHandler.bind(this);
    this.mouseLock = false;
    this.keys = {};

    document.addEventListener(
      "pointerlockchange",
      this.pointerlockchangeHandler
    );
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
    document.addEventListener("wheel", this.mouseZoomHandler);
    document.addEventListener("click", this.mouseClickHandler);

    this.boxManager = new BoxManager();
    let lightLocations = [
      [-5, -5],
      [-5, 2],
      [-5, 5],
      [5, -5],
    ];
    this.lights = [];
    for (let i = 0; i < 4; i++) {
      let light = new Light();
      mat4.fromTranslation(light.matrix, [
        lightLocations[i][0],
        5,
        lightLocations[i][1],
      ]);
      this.lights.push(light);
    }
  }

  async start() {
    const gl = this.gl;

    this.initHandlers();

    this.loader = new GLTFLoader();
    await this.loader.load("../../common/models/scene/scene.gltf");

    this.scene = await this.loader.loadScene(this.loader.defaultScene);

    this.time = Date.now();
    this.startTime = this.time;

    this.camera = new Camera();
    this.scene.addNode(this.camera);

    for (let i = 0; i < 4; i++) {
      this.scene.addNode(this.lights[i]);
    }

    // find drone and box
    this.drone = null;
    let box = null;
    this.scene.traverse((node) => {
      if (node instanceof Drone) {
        this.drone = node;
      } else if (node instanceof Box) {
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

  update() {
    this.time = Date.now();
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;

    if (this.mouseLock) {
      if (this.drone) {
        //let distance = vec3.distance(this.drone.translation, vec3.fromValues(0, 0, 0));
        this.drone.update(dt, this.keys, this.camera);

        this.camera.update(this.drone);
      }

      if (this.boxManager) {
        this.boxManager.update();

        if (this.boxManager.drop) {
          this.boxManager.addBox(this.scene, this.drone);
        }
        this.boxManager.drop = false;
      }

      if (this.physics) {
        this.physics.update(dt);
      }
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
      this.mouseLock = true;
      this.canvas.addEventListener("mousemove", this.mousemoveHandler);
    } else {
      this.mouseLock = false;
      this.canvas.removeEventListener("mousemove", this.mousemoveHandler);
    }
  }

  mousemoveHandler(e) {
    const c = this.camera;
    const dx = e.movementX;
    const dy = e.movementY;

    let heightChange = dy * c.mouseSensitivity;
    if (heightChange < 0) {
      if (c.height < 3) {
        c.height -= heightChange;
      }
    } else {
      if (c.height > -3) {
        c.height -= heightChange;
      }
    }

    let yawChange = dx * c.mouseSensitivity;
    c.yaw -= yawChange;
  }

  keydownHandler(e) {
    this.keys[e.code] = true;
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }

  mouseZoomHandler(e) {
    const c = this.camera;
    let scale = c.distance;

    scale += e.deltaY * -0.01;
    c.distance = Math.min(Math.max(7, scale), 20);
  }

  mouseClickHandler(e) {
    if (!this.boxManager.countDown && this.mouseLock) {
      this.boxManager.drop = true;
      this.boxManager.countDown = true;
      addPoints();
    }
  }
  //score counter
  addPoints() {
    this.finalScore += 100;
    this.score.innerHTML = finalScore;
  }
}
