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

## Status

Early — core simulation loop, physics, and genetic algorithm are being built out. See open issues / commits for current progress.
