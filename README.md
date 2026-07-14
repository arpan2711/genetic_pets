# Genetic Pets

A browser-based evolution simulator: soft-body creatures made of point-mass "nodes" connected by oscillating "muscles" are dropped into a 2D world with gravity and ground friction. Each generation, every creature is scored on how far it travels; the fittest are bred (with mutation) into the next generation. Over time, locomotion strategies emerge — walking, hopping, crawling — with no hand-coded animation, purely from selection pressure.

Inspired by [David Randall Miller's "I programmed some creatures. They Evolved."](https://youtu.be/N3tRFayqVtk)

## How it works

- **Creature**: a small graph of nodes (mass points) and muscles (springs whose rest length oscillates sinusoidally over time).
- **Genome**: per-creature parameters — node layout, muscle connections, and each muscle's amplitude/phase/frequency/base length.
- **Physics**: custom lightweight Verlet-style integration — gravity, ground collision, friction. No physics engine dependency.
- **Fitness**: net horizontal distance traveled during a fixed simulation window.
- **Evolution**: each generation, the population is ranked by fitness; top performers survive and are mutated (and optionally crossed over) to fill the next generation.

## Stack

TypeScript + HTML5 Canvas, built with Vite. Runs entirely client-side.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Current functioning

**Generation 1** — random genomes, no selection pressure yet. Creatures are small tangles of nodes/muscles twitching roughly in place.

![Generation 1](docs/generation-1.png)

**Generation 107** (same run, ~40s later at 16x speed) — selection has pushed the population toward larger, more spread-out body plans that cover real ground. Best fitness went from 0 to 3,114px; population average reached 1,477px.

![Generation 107](docs/generation-107.png)

## Analysis

![Fitness by generation](docs/fitness-chart.png)

Data from a single 107-generation run (population 20, elitism 2, 2 fresh-random per generation, rest bred via tournament selection + mutation):

- **Best fitness climbs in steps, not a smooth curve.** Elitism carries the current champion forward unchanged each generation, so the line is flat until a mutation of a top performer (or a lucky random genome) beats it — then it jumps and holds. This is expected behavior for a (μ+λ)-style elitist GA rather than a bug.
- **Average fitness is noisy and trails well behind best** (1,477 vs 3,114 at generation 107) because most of the population each generation is a fresh mutation of a parent — many mutations are neutral or harmful, so the mean reflects a lot of unsuccessful exploration around the current best, not convergence.
- **The gap between best and average is the diversity/exploration tradeoff.** A tighter gap would mean the population converges faster but explores less; a wider one (like here) means more of the search space gets tried at the cost of a lower average per generation.
- **No plateau yet by generation 107** — best fitness was still increasing at the end of the captured run, suggesting the current body plans (3-6 nodes, mutation-only, no crossover) haven't hit a hard ceiling.

### Ideas for further improvement

- Crossover between two fit parents (currently mutation-only / asexual reproduction).
- Adaptive mutation rate that shrinks as the population converges, to reduce late-run noise in the average.
- Larger populations or longer per-generation simulation windows to reduce the effect of a single lucky early step.

## Status

Core simulation loop, physics, and genetic algorithm are working end-to-end (see Analysis above for a real run). Next: crossover, richer creature morphologies, and a persisted leaderboard of best genomes.
