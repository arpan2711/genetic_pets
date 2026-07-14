import { PNode } from "./Node";
import { MUSCLE_ANGULAR_SCALE } from "./constants";

export interface MuscleParams {
  stiffness: number;
  baseLength: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

export class Muscle {
  a: PNode;
  b: PNode;
  params: MuscleParams;

  constructor(a: PNode, b: PNode, params: MuscleParams) {
    this.a = a;
    this.b = b;
    this.params = params;
  }

  restLength(age: number): number {
    const { baseLength, amplitude, frequency, phase } = this.params;
    return baseLength + amplitude * Math.sin(frequency * age * MUSCLE_ANGULAR_SCALE + phase);
  }

  /** Tension in [-1, 1]: how stretched (+) or compressed (-) the muscle currently is relative to its target. */
  tension(age: number): number {
    const dx = this.b.x - this.a.x;
    const dy = this.b.y - this.a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    const target = this.restLength(age);
    return Math.max(-1, Math.min(1, (dist - target) / (target || 1)));
  }

  relax(age: number): void {
    const dx = this.b.x - this.a.x;
    const dy = this.b.y - this.a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    const target = this.restLength(age);
    const diff = (dist - target) / dist;
    const correction = diff * 0.5 * this.params.stiffness;
    const offsetX = dx * correction;
    const offsetY = dy * correction;
    this.a.x += offsetX;
    this.a.y += offsetY;
    this.b.x -= offsetX;
    this.b.y -= offsetY;
  }
}
