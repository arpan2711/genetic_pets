export interface NodeGene {
  x: number;
  y: number;
}

export interface MuscleGene {
  a: number;
  b: number;
  stiffness: number;
  baseLength: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

export interface Genome {
  nodes: NodeGene[];
  muscles: MuscleGene[];
  hue: number;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

const MAX_MUSCLES_PER_NODE_PAIR_ATTEMPTS = 3;

export function randomGenome(): Genome {
  const nodeCount = Math.floor(rand(3, 7));
  const nodes: NodeGene[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2 + rand(-0.3, 0.3);
    const radius = rand(15, 35);
    nodes.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.6 - 20,
    });
  }

  const muscles: MuscleGene[] = [];
  // Ensure connectivity: chain the nodes together first.
  for (let i = 1; i < nodeCount; i++) {
    muscles.push(makeMuscleGene(nodes, i - 1, i));
  }
  // Add a handful of extra random edges for structural variety.
  const extraEdges = Math.floor(rand(0, nodeCount));
  for (let i = 0; i < extraEdges; i++) {
    let attempt = 0;
    while (attempt < MAX_MUSCLES_PER_NODE_PAIR_ATTEMPTS) {
      const a = Math.floor(rand(0, nodeCount));
      const b = Math.floor(rand(0, nodeCount));
      if (a !== b && !muscles.some((m) => (m.a === a && m.b === b) || (m.a === b && m.b === a))) {
        muscles.push(makeMuscleGene(nodes, a, b));
        break;
      }
      attempt++;
    }
  }

  return { nodes, muscles, hue: rand(0, 360) };
}

function makeMuscleGene(nodes: NodeGene[], a: number, b: number): MuscleGene {
  const dx = nodes[b].x - nodes[a].x;
  const dy = nodes[b].y - nodes[a].y;
  const baseLength = Math.sqrt(dx * dx + dy * dy) || 10;
  return {
    a,
    b,
    stiffness: rand(0.4, 0.9),
    baseLength,
    amplitude: baseLength * rand(0.2, 0.6),
    frequency: rand(0.5, 3),
    phase: rand(0, Math.PI * 2),
  };
}

export function cloneGenome(genome: Genome): Genome {
  return {
    nodes: genome.nodes.map((n) => ({ ...n })),
    muscles: genome.muscles.map((m) => ({ ...m })),
    hue: genome.hue,
  };
}

export const DEFAULT_MUTATION_RATE = 0.15;

export function mutateGenome(genome: Genome, mutationRate: number = DEFAULT_MUTATION_RATE): Genome {
  const clone = cloneGenome(genome);

  if (Math.random() < mutationRate) {
    clone.hue = (clone.hue + rand(-15, 15) + 360) % 360;
  }

  for (const node of clone.nodes) {
    if (Math.random() < mutationRate) {
      node.x += rand(-8, 8);
      node.y += rand(-8, 8);
    }
  }

  for (const muscle of clone.muscles) {
    if (Math.random() < mutationRate) {
      muscle.stiffness = clamp(muscle.stiffness + rand(-0.15, 0.15), 0.1, 1);
    }
    if (Math.random() < mutationRate) {
      muscle.baseLength = Math.max(5, muscle.baseLength + rand(-6, 6));
    }
    if (Math.random() < mutationRate) {
      muscle.amplitude = Math.max(0, muscle.amplitude + rand(-6, 6));
    }
    if (Math.random() < mutationRate) {
      muscle.frequency = clamp(muscle.frequency + rand(-0.4, 0.4), 0.1, 4);
    }
    if (Math.random() < mutationRate) {
      muscle.phase = muscle.phase + rand(-0.6, 0.6);
    }
  }

  // Occasional structural mutation: add or remove a muscle.
  if (Math.random() < 0.08 && clone.muscles.length > clone.nodes.length - 1) {
    clone.muscles.splice(Math.floor(rand(0, clone.muscles.length)), 1);
  } else if (Math.random() < 0.08 && clone.nodes.length > 1) {
    const a = Math.floor(rand(0, clone.nodes.length));
    const b = Math.floor(rand(0, clone.nodes.length));
    if (a !== b && !clone.muscles.some((m) => (m.a === a && m.b === b) || (m.a === b && m.b === a))) {
      clone.muscles.push(makeMuscleGene(clone.nodes, a, b));
    }
  }

  return clone;
}
