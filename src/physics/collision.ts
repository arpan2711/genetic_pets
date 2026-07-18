import { PNode } from "./Node";
import { NODE_COLLISION_RADIUS, NODE_COLLISION_ITERATIONS } from "./constants";

const MIN_DISTANCE = NODE_COLLISION_RADIUS * 2;

/** Pushes apart overlapping nodes belonging to different bodies, so they don't merge. */
export function resolveBodyCollisions(bodies: PNode[][]): void {
  for (let iter = 0; iter < NODE_COLLISION_ITERATIONS; iter++) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        resolvePair(bodies[i], bodies[j]);
      }
    }
  }
}

function resolvePair(a: PNode[], b: PNode[]): void {
  for (const nodeA of a) {
    for (const nodeB of b) {
      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const distSq = dx * dx + dy * dy;
      if (distSq >= MIN_DISTANCE * MIN_DISTANCE || distSq === 0) continue;

      const dist = Math.sqrt(distSq);
      const overlap = (MIN_DISTANCE - dist) / 2;
      const nx = dx / dist;
      const ny = dy / dist;

      nodeA.x -= nx * overlap;
      nodeA.y -= ny * overlap;
      nodeB.x += nx * overlap;
      nodeB.y += ny * overlap;
    }
  }
}
