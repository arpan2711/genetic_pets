import "./style.css";
import { Population } from "./sim/Population";
import { drawFrame } from "./render/renderer";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const statGeneration = document.getElementById("stat-generation")!;
const statBest = document.getElementById("stat-best")!;
const statAvg = document.getElementById("stat-avg")!;
const btnPause = document.getElementById("btn-pause")!;
const speedButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".speed-btn"));

function resizeCanvas(): void {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const population = new Population();
let paused = false;
let speed = 1;
let cameraX = 0;

btnPause.addEventListener("click", () => {
  paused = !paused;
  btnPause.textContent = paused ? "Resume" : "Pause";
});

speedButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    speed = Number(btn.dataset.speed);
    speedButtons.forEach((b) => b.classList.toggle("active", b === btn));
  });
});
speedButtons[0]?.classList.add("active");

function updateHud(): void {
  statGeneration.textContent = String(population.generation);
  statBest.textContent = population.lastBest.toFixed(1);
  statAvg.textContent = population.lastAvg.toFixed(1);
}

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
      }
    }
  }

  drawFrame(ctx, population, cameraX);
  requestAnimationFrame(tick);
}

updateHud();
requestAnimationFrame(tick);
