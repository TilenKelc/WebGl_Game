import { App } from "./Game.js";
import { GUI } from "../../lib/dat.gui.module.js";

let app;
function showGame() {
  const canvas = document.querySelector("canvas");
  canvas.style.background = "none";
  app = new App(canvas);
  const gui = new GUI();
  for (let i = 0; i < 4; i++) {
    gui.addColor(app.lights[i], "ambientColor");
    gui.addColor(app.lights[i], "diffuseColor");
    gui.addColor(app.lights[i], "specularColor");
    gui.add(app.lights[i], "shininess", 0.0, 1000.0);
  }
  gui.add(app, "enableMouseLook");
}

function restart() {
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("webgl2");
  context.clear(context.DEPTH_BUFFER_BIT);
  document.getElementsByClassName("dg main a")[0].remove();
  finalScore = 0;
  startGame();
  document.getElementById("endScreen").style.display = "none";
}
window.restart = restart;
//start screen
let quitButton = document.getElementById("back");
let scoreCounter = document.getElementById("scoreCounter");
let title = document.getElementById("testimage");
function startGame() {
  showGame();
  quitButton.style.display = "block";
  scoreCounter.style.display = "block";
  title.style.display = "none";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("timer").style.display = "block";
  countdown(5);
}
window.startGame = startGame;

//mute and unmute
let music = document.getElementById("music");
let muteButton = document.getElementById("muteMusic");
muteButton.onclick = function () {
  if (!music.muted) {
    music.muted = true;
    muteButton.style.background =
      "url('https://img.icons8.com/ios/50/000000/mute--v1.png')";
  } else {
    music.muted = false;
    muteButton.style.background =
      "url('https://img.icons8.com/ios/50/000000/mute--v2.png')";
  }
};

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

//timer
function countdown(minutes) {
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
      document.getElementById("finalScore").innerHTML = app.finalScore;
      score.innerHTML = 0;
      document.exitPointerLock();
    }
  }
  tick();
}
