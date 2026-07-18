import "./style.css";
import { Population } from "./sim/Population";
import { drawFrame } from "./render/renderer";
import { initInspector } from "./inspector";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const statGeneration = document.getElementById("stat-generation")!;
const statBest = document.getElementById("stat-best")!;
const statAvg = document.getElementById("stat-avg")!;
const btnPause = document.getElementById("btn-pause")!;
const btnReset = document.getElementById("btn-reset")!;
const btnFocus = document.getElementById("btn-focus")!;
const mutationSlider = document.getElementById("mutation-slider") as HTMLInputElement;
const mutationValue = document.getElementById("mutation-value")!;
const speedButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".speed-btn"));

function resizeCanvas(): void {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let population = new Population();
let paused = false;
let speed = 1;
let cameraX = 0;
let focusMode = false;

function updateHud(): void {
  statGeneration.textContent = String(population.generation);
  statBest.textContent = population.lastBest.toFixed(1);
  statAvg.textContent = population.lastAvg.toFixed(1);
}

let pausedBeforeInspector = false;
const inspector = initInspector(() => population, {
  pauseMain: () => {
    pausedBeforeInspector = paused;
    paused = true;
    btnPause.textContent = "Resume";
  },
  resumeMainIfWasRunning: () => {
    paused = pausedBeforeInspector;
    btnPause.textContent = paused ? "Resume" : "Pause";
  },
});

btnPause.addEventListener("click", () => {
  paused = !paused;
  btnPause.textContent = paused ? "Resume" : "Pause";
});

btnReset.addEventListener("click", () => {
  population = new Population();
  cameraX = 0;
  updateHud();
});

btnFocus.addEventListener("click", () => {
  focusMode = !focusMode;
  btnFocus.textContent = focusMode ? "Focus: Leader" : "Focus: All";
  btnFocus.classList.toggle("active", focusMode);
});

mutationSlider.addEventListener("input", () => {
  const rate = Number(mutationSlider.value);
  population.mutationRate = rate;
  mutationValue.textContent = rate.toFixed(2);
});

speedButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    speed = Number(btn.dataset.speed);
    speedButtons.forEach((b) => b.classList.toggle("active", b === btn));
  });
});
speedButtons[0]?.classList.add("active");

function updateCamera(): void {
  const best = population.bestCreature();
  const targetCamera = Math.max(0, best.centerX() - canvas.width * 0.3);
  cameraX += (targetCamera - cameraX) * 0.05;
}

function tick(): void {
  if (!paused) {
    for (let i = 0; i < speed; i++) {
      population.step();
      updateCamera();
      if (population.isGenerationDone()) {
        population.nextGeneration();
        updateHud();
        inspector.refreshListIfOpen();
      }
    }
  }

  drawFrame(ctx, population, cameraX, focusMode);
  requestAnimationFrame(tick);
}

updateHud();
requestAnimationFrame(tick);
