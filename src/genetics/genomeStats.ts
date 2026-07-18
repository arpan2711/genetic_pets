import { Genome } from "./genome";

export interface GenomeStats {
  nodeCount: number;
  muscleCount: number;
  avgStiffness: number;
  avgAmplitude: number;
  avgFrequency: number;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function summarizeGenome(genome: Genome): GenomeStats {
  return {
    nodeCount: genome.nodes.length,
    muscleCount: genome.muscles.length,
    avgStiffness: average(genome.muscles.map((m) => m.stiffness)),
    avgAmplitude: average(genome.muscles.map((m) => m.amplitude)),
    avgFrequency: average(genome.muscles.map((m) => m.frequency)),
  };
}
