import { Genome, randomGenome, mutateGenome, cloneGenome, DEFAULT_MUTATION_RATE } from "../genetics/genome";
import { Creature } from "./Creature";
import { GENERATION_DURATION_STEPS } from "../physics/constants";

const POPULATION_SIZE = 20;
const ELITISM_COUNT = 2;
const RANDOM_COUNT = 2;
const TOURNAMENT_SIZE = 3;
const START_X = 150;

export interface GenerationRecord {
  generation: number;
  bestGenome: Genome;
  bestFitness: number;
  avgFitness: number;
}

export class Population {
  genomes: Genome[];
  creatures: Creature[];
  generation = 1;
  age = 0;
  bestFitnessEver = 0;
  lastBest = 0;
  lastAvg = 0;
  mutationRate = DEFAULT_MUTATION_RATE;
  history: GenerationRecord[] = [];

  constructor() {
    this.genomes = Array.from({ length: POPULATION_SIZE }, () => randomGenome());
    this.creatures = this.genomes.map((g) => new Creature(g, START_X));
  }

  step(): void {
    for (const creature of this.creatures) {
      creature.step();
    }
    this.age++;
  }

  isGenerationDone(): boolean {
    return this.age >= GENERATION_DURATION_STEPS;
  }

  bestCreature(): Creature {
    return this.creatures.reduce((best, c) => (c.fitness() > best.fitness() ? c : best), this.creatures[0]);
  }

  nextGeneration(): void {
    const ranked = [...this.creatures].sort((a, b) => b.fitness() - a.fitness());

    this.lastBest = ranked[0].fitness();
    this.lastAvg = ranked.reduce((sum, c) => sum + c.fitness(), 0) / ranked.length;
    this.bestFitnessEver = Math.max(this.bestFitnessEver, this.lastBest);

    this.history.push({
      generation: this.generation,
      bestGenome: cloneGenome(ranked[0].genome),
      bestFitness: this.lastBest,
      avgFitness: this.lastAvg,
    });

    const nextGenomes: Genome[] = [];

    for (let i = 0; i < ELITISM_COUNT && i < ranked.length; i++) {
      nextGenomes.push(cloneGenome(ranked[i].genome));
    }

    for (let i = 0; i < RANDOM_COUNT; i++) {
      nextGenomes.push(randomGenome());
    }

    while (nextGenomes.length < POPULATION_SIZE) {
      const parent = this.tournamentSelect(ranked);
      nextGenomes.push(mutateGenome(parent.genome, this.mutationRate));
    }

    this.genomes = nextGenomes;
    this.creatures = this.genomes.map((g) => new Creature(g, START_X));
    this.age = 0;
    this.generation++;
  }

  private tournamentSelect(ranked: Creature[]): Creature {
    let best: Creature | null = null;
    for (let i = 0; i < TOURNAMENT_SIZE; i++) {
      const candidate = ranked[Math.floor(Math.random() * ranked.length)];
      if (!best || candidate.fitness() > best.fitness()) {
        best = candidate;
      }
    }
    return best!;
  }
}
