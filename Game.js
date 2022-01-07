import { Application } from "../../common/engine/Application.js";
import { mat4, vec3, quat } from "../../lib/gl-matrix-module.js";

<<<<<<< HEAD
=======
import { GUI } from "../../lib/dat.gui.module.js";

>>>>>>> c412af4a60b697943ce2fe5b59332e578c072869
import { GLTFLoader } from "./GLTFLoader.js";
import { Camera } from "./Camera.js";
import { Renderer } from "./Renderer.js";
import { Physics } from "./Physics.js";
import { Drone } from "./Drone.js";
import { Box } from "./Box.js";
import { BoxManager } from "./BoxManager.js";
import { Light } from "./Light.js";
<<<<<<< HEAD
export class App extends Application {
  constructor(canvas) {
    super(canvas);
    this.finalScore = 0;
    this.score = document.getElementById("score");
  }
=======
class App extends Application {
  constructor() {
    super(canvas);
    this.finalScore = 0;
    this.score = document.getElementById("score");
    this.music = document.getElementById("music");
    //mute using mute key on keyboard
    document.onkeydown = function (event) {
      if (event.key == "m" || event.key == "M") {
        if (!music.muted) {
          music.muted = true;
          muteButton.style.background =
            "url('https://img.icons8.com/ios/50/000000/mute--v1.png')";
        } else {
          music.muted = false;
          muteButton.style.background =
            "url('https://img.icons8.com/ios/50/000000/mute--v2.png')";
        }
      }
      return true;
    };
    this.muteButton = document.getElementById("muteMusic");
    this.muteButton.addEventListener("click", this.mute);
    document
      .getElementById("startButton")
      .addEventListener("click", this.startGame);
    document.getElementById("restartButton").onclick = this.restart;
  }

>>>>>>> c412af4a60b697943ce2fe5b59332e578c072869
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
<<<<<<< HEAD
=======
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
>>>>>>> c412af4a60b697943ce2fe5b59332e578c072869
    }
  }

<<<<<<< HEAD
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
=======
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

  restart() {
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("webgl2");
    context.clear(context.DEPTH_BUFFER_BIT);
    document.getElementsByClassName("dg main a")[0].remove();
    finalScore = 0;
    startGame();
    document.getElementById("endScreen").style.display = "none";
  }
  //score counter
  addPoints() {
    finalScore += 10;
    score.innerHTML = finalScore;
  }
  //mute and unmute
  mute() {
    if (!music.muted) {
      music.muted = true;
      this.style.background =
        "url('https://img.icons8.com/ios/50/000000/mute--v1.png')";
    } else {
      music.muted = false;
      this.style.background =
        "url('https://img.icons8.com/ios/50/000000/mute--v2.png')";
    }
  }

  //timer
  countdown(minutes) {
    let seconds = 60;
    let mins = minutes;
    function tick() {
      let timer = document.getElementById("timer");
      let current_minutes = mins - 1;
      seconds--;
      timer.innerHTML =
        current_minutes.toString() +
        ":" +
        (seconds < 10 ? "0" : "") +
        String(seconds);
      if (seconds > 0) {
        setTimeout(tick, 1000);
      } else {
        if (mins > 1) {
          countdown(mins - 1);
        }
      }
      if (timer.innerHTML == "0:00") {
        document.getElementById("endScreen").style.display = "block";
        document.getElementById("finalScore").innerHTML = finalScore;
        score.innerHTML = 0;
      }
    }
    tick();
  }
}

//start screen
function startGame() {
  showGame();
  let quitButton = document.getElementById("back");
  let scoreCounter = document.getElementById("scoreCounter");
  let title = document.getElementById("testimage");
  quitButton.style.display = "block";
  scoreCounter.style.display = "block";
  title.style.display = "none";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("timer").style.display = "block";
  countdown(5);
}
window.startGame = startGame;
//display actual game
function showGame() {
  const canvas = document.querySelector("canvas");
  canvas.style.background = "none";
  const app = new App(canvas);
  const gui = new GUI();
  for (let i = 0; i < 4; i++) {
    gui.addColor(app.lights[i], "ambientColor");
    gui.addColor(app.lights[i], "diffuseColor");
    gui.addColor(app.lights[i], "specularColor");
    gui.add(app.lights[i], "shininess", 0.0, 1000.0);
  }
  gui.add(app, "enableMouseLook");
>>>>>>> c412af4a60b697943ce2fe5b59332e578c072869
}
