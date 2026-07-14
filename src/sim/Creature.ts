import { PNode } from "../physics/Node";
import { Muscle } from "../physics/Muscle";
import { Genome } from "../genetics/genome";
import { GRAVITY, GROUND_Y, GROUND_FRICTION, AIR_DAMPING, RELAX_ITERATIONS } from "../physics/constants";

export class Creature {
  genome: Genome;
  nodes: PNode[];
  muscles: Muscle[];
  age = 0;
  startCenterX: number;

  constructor(genome: Genome, startX: number) {
    this.genome = genome;
    this.nodes = genome.nodes.map((n) => new PNode(startX + n.x, GROUND_Y - 60 + n.y));
    this.muscles = genome.muscles.map(
      (m) => new Muscle(this.nodes[m.a], this.nodes[m.b], { ...m }),
    );
    this.startCenterX = this.centerX();
  }

  centerX(): number {
    let sum = 0;
    for (const n of this.nodes) sum += n.x;
    return sum / this.nodes.length;
  }

  fitness(): number {
    return this.centerX() - this.startCenterX;
  }

  step(): void {
    this.age++;

    for (const node of this.nodes) {
      const vx = (node.x - node.oldX) * AIR_DAMPING;
      const vy = (node.y - node.oldY) * AIR_DAMPING;
      node.oldX = node.x;
      node.oldY = node.y;
      node.x += vx;
      node.y += vy + GRAVITY;
    }

    for (let i = 0; i < RELAX_ITERATIONS; i++) {
      for (const muscle of this.muscles) {
        muscle.relax(this.age);
      }
    }

    for (const node of this.nodes) {
      if (node.y > GROUND_Y) {
        const vx = node.x - node.oldX;
        node.y = GROUND_Y;
        node.oldY = node.y + Math.abs(vx) * 0.05;
        node.oldX = node.x - vx * GROUND_FRICTION;
      }
    }
  }
}
