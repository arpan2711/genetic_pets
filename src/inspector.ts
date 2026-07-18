import { Population, GenerationRecord } from "./sim/Population";
import { Creature } from "./sim/Creature";
import { summarizeGenome } from "./genetics/genomeStats";
import { drawCreature } from "./render/renderer";
import { GENERATION_DURATION_STEPS, GROUND_Y } from "./physics/constants";

export interface InspectorHooks {
  pauseMain: () => void;
  resumeMainIfWasRunning: () => void;
}

const INSPECTOR_START_X = 60;
const GROUND_SCREEN_Y = 140;

export function initInspector(getPopulation: () => Population, hooks: InspectorHooks) {
  const panel = document.getElementById("history-panel") as HTMLElement;
  const listView = document.getElementById("panel-list") as HTMLElement;
  const inspectorView = document.getElementById("panel-inspector") as HTMLElement;
  const canvas = document.getElementById("inspector-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const statsEl = document.getElementById("inspector-stats") as HTMLElement;
  const backBtn = document.getElementById("inspector-back") as HTMLButtonElement;
  const closeBtn = document.getElementById("panel-close") as HTMLButtonElement;
  const toggleBtn = document.getElementById("btn-history") as HTMLButtonElement;

  let isOpen = false;
  let replayCreature: Creature | null = null;
  let replayCameraX = 0;
  let rafId: number | null = null;

  function renderList(): void {
    const history = getPopulation().history;
    listView.innerHTML = "";
    if (history.length === 0) {
      const empty = document.createElement("p");
      empty.className = "panel-empty";
      empty.textContent = "No generations completed yet — let it run a bit.";
      listView.appendChild(empty);
      return;
    }
    for (const record of [...history].reverse()) {
      const item = document.createElement("button");
      item.className = "panel-list-item";
      item.innerHTML = `<span>Gen ${record.generation}</span><span class="panel-list-fitness">${record.bestFitness.toFixed(1)}px</span>`;
      item.addEventListener("click", () => openReplay(record));
      listView.appendChild(item);
    }
  }

  function stopReplayLoop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function replayTick(): void {
    if (!replayCreature) return;
    replayCreature.step();
    if (replayCreature.age >= GENERATION_DURATION_STEPS) {
      replayCreature = new Creature(replayCreature.genome, INSPECTOR_START_X);
    }

    const target = Math.max(0, replayCreature.centerX() - canvas.width * 0.3);
    replayCameraX += (target - replayCameraX) * 0.05;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#10141a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-replayCameraX, GROUND_SCREEN_Y - GROUND_Y);
    ctx.strokeStyle = "#333c4a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2000, GROUND_Y);
    ctx.lineTo(5000, GROUND_Y);
    ctx.stroke();
    drawCreature(ctx, replayCreature, { isLeader: true });
    ctx.restore();

    rafId = requestAnimationFrame(replayTick);
  }

  function openReplay(record: GenerationRecord): void {
    hooks.pauseMain();
    listView.hidden = true;
    inspectorView.hidden = false;

    const stats = summarizeGenome(record.bestGenome);
    statsEl.innerHTML = `
      <tr><td>Generation</td><td>${record.generation}</td></tr>
      <tr><td>Best fitness</td><td>${record.bestFitness.toFixed(1)}px</td></tr>
      <tr><td>Population avg</td><td>${record.avgFitness.toFixed(1)}px</td></tr>
      <tr><td>Nodes</td><td>${stats.nodeCount}</td></tr>
      <tr><td>Muscles</td><td>${stats.muscleCount}</td></tr>
      <tr><td>Avg stiffness</td><td>${stats.avgStiffness.toFixed(2)}</td></tr>
      <tr><td>Avg amplitude</td><td>${stats.avgAmplitude.toFixed(1)}</td></tr>
      <tr><td>Avg frequency</td><td>${stats.avgFrequency.toFixed(2)}</td></tr>
    `;

    stopReplayLoop();
    replayCreature = new Creature(record.bestGenome, INSPECTOR_START_X);
    replayCameraX = 0;
    replayTick();
  }

  function backToList(): void {
    stopReplayLoop();
    replayCreature = null;
    listView.hidden = false;
    inspectorView.hidden = true;
    renderList();
  }

  function open(): void {
    isOpen = true;
    panel.classList.add("open");
    renderList();
  }

  function close(): void {
    isOpen = false;
    panel.classList.remove("open");
    stopReplayLoop();
    replayCreature = null;
    listView.hidden = false;
    inspectorView.hidden = true;
    hooks.resumeMainIfWasRunning();
  }

  function toggle(): void {
    if (isOpen) close();
    else open();
  }

  backBtn.addEventListener("click", backToList);
  closeBtn.addEventListener("click", close);
  toggleBtn.addEventListener("click", toggle);

  return {
    toggle,
    refreshListIfOpen: () => {
      if (isOpen && !listView.hidden) renderList();
    },
  };
}
