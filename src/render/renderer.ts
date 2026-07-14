import { Population } from "../sim/Population";
import { GROUND_Y } from "../physics/constants";

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  population: Population,
  cameraX: number,
): void {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  // Ground.
  const groundScreenY = GROUND_Y;
  ctx.strokeStyle = "#333c4a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundScreenY);
  ctx.lineTo(width, groundScreenY);
  ctx.stroke();

  const best = population.bestCreature();

  for (const creature of population.creatures) {
    const isBest = creature === best;
    ctx.save();
    ctx.translate(-cameraX, 0);

    for (const muscle of creature.muscles) {
      const t = muscle.tension(creature.age);
      const hue = t > 0 ? 0 : 210;
      const lightness = 45 + Math.abs(t) * 20;
      ctx.strokeStyle = isBest
        ? `hsl(${hue}, 80%, ${lightness}%)`
        : `hsla(${hue}, 40%, 60%, 0.35)`;
      ctx.lineWidth = isBest ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(muscle.a.x, muscle.a.y);
      ctx.lineTo(muscle.b.x, muscle.b.y);
      ctx.stroke();
    }

    for (const node of creature.nodes) {
      ctx.fillStyle = isBest ? "#ffcf6e" : "rgba(140, 160, 200, 0.4)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, isBest ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
