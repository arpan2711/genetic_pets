import { Population } from "../sim/Population";
import { Creature } from "../sim/Creature";
import { GROUND_Y } from "../physics/constants";
import { convexHull } from "./hull";

export interface DrawCreatureOptions {
  isLeader: boolean;
}

export function drawCreature(
  ctx: CanvasRenderingContext2D,
  creature: Creature,
  { isLeader }: DrawCreatureOptions,
): void {
  const hue = creature.genome.hue;

  // Soft body fill (convex hull of the nodes).
  const hull = convexHull(creature.nodes.map((n) => ({ x: n.x, y: n.y })));
  if (hull.length >= 3) {
    ctx.beginPath();
    ctx.moveTo(hull[0].x, hull[0].y);
    for (let i = 1; i < hull.length; i++) ctx.lineTo(hull[i].x, hull[i].y);
    ctx.closePath();
    ctx.fillStyle = isLeader ? `hsla(${hue}, 70%, 60%, 0.45)` : `hsla(${hue}, 55%, 55%, 0.18)`;
    ctx.fill();
  }

  // Muscles (tension-colored), subtle on top of the fill.
  for (const muscle of creature.muscles) {
    const t = muscle.tension(creature.age);
    const tensionHue = t > 0 ? 0 : 210;
    const lightness = 45 + Math.abs(t) * 20;
    ctx.strokeStyle = isLeader
      ? `hsla(${tensionHue}, 80%, ${lightness}%, 0.9)`
      : `hsla(${tensionHue}, 40%, 60%, 0.25)`;
    ctx.lineWidth = isLeader ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(muscle.a.x, muscle.a.y);
    ctx.lineTo(muscle.b.x, muscle.b.y);
    ctx.stroke();
  }

  // Nodes (rounded joints).
  for (const node of creature.nodes) {
    ctx.fillStyle = isLeader ? `hsl(${hue}, 75%, 68%)` : `hsla(${hue}, 40%, 65%, 0.5)`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, isLeader ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Face: a small eye near the topmost node, pupil biased toward current heading.
  const head = creature.nodes.reduce((top, n) => (n.y < top.y ? n : top), creature.nodes[0]);
  const vx = head.x - head.oldX;
  const eyeR = isLeader ? 3.2 : 2;
  ctx.fillStyle = isLeader ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(head.x, head.y - 4, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = isLeader ? "#1a1a1a" : "rgba(20,20,20,0.6)";
  ctx.beginPath();
  ctx.arc(head.x + Math.max(-1, Math.min(1, vx)) * 1.2, head.y - 4, eyeR * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround(ctx: CanvasRenderingContext2D): void {
  const { width } = ctx.canvas;

  const shadow = ctx.createLinearGradient(0, GROUND_Y - 24, 0, GROUND_Y);
  shadow.addColorStop(0, "rgba(0, 0, 0, 0)");
  shadow.addColorStop(1, "rgba(0, 0, 0, 0.25)");
  ctx.fillStyle = shadow;
  ctx.fillRect(0, GROUND_Y - 24, width, 24);

  ctx.strokeStyle = "#333c4a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(width, GROUND_Y);
  ctx.stroke();
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  population: Population,
  cameraX: number,
  focusMode: boolean,
): void {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#10141a";
  ctx.fillRect(0, 0, width, height);
  drawGround(ctx);

  const best = population.bestCreature();

  for (const creature of population.creatures) {
    const isLeader = creature === best;
    if (focusMode && !isLeader) continue;

    ctx.save();
    ctx.translate(-cameraX, 0);
    drawCreature(ctx, creature, { isLeader });
    ctx.restore();
  }
}
