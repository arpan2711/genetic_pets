# The science behind Jitterlings

This project isn't just a physics toy — it's a small, from-scratch implementation of a **genetic algorithm (GA)**, a search technique from evolutionary computation. This doc explains the concepts being exercised and where the project sits relative to the research it's inspired by. For empirical results (actual numbers from actual runs), see the [README](../README.md)'s Analysis and Longer-runs sections — this doc stays conceptual so the two don't drift out of sync.

## What kind of algorithm this is

A genetic algorithm searches a space of candidate solutions by imitating natural selection:

```
population → evaluate fitness → select parents → produce offspring (variation) → repeat
```

Mapped onto this codebase:

| GA concept | This project |
|---|---|
| Genotype | `Genome` ([`src/genetics/genome.ts`](../src/genetics/genome.ts)) — a list of node positions and muscle parameters |
| Phenotype | `Creature` ([`src/sim/Creature.ts`](../src/sim/Creature.ts)) — the physical, simulated body built from a genome |
| Fitness function | `Creature.fitness()` — net horizontal distance traveled in a fixed time window |
| Selection | `Population.nextGeneration()` ([`src/sim/Population.ts`](../src/sim/Population.ts)) — elitism (top performers survive unchanged) + tournament selection (pick the best of a few random candidates) |
| Variation | `mutateGenome()` — gaussian-ish perturbation of numeric parameters, plus occasional structural mutation (add/remove a muscle) |
| Generation | One fixed-length simulation window (360 physics steps), after which the whole population is replaced |

There's no crossover (sexual recombination between two parents) yet — reproduction here is asexual, mutation-only. That's a deliberate simplification, and one of the "ideas for further improvement" below.

## Why genotype → phenotype indirection matters

The GA doesn't evolve *movements* directly — it evolves a compact genome that gets *built into* a body (nodes + muscles + oscillation parameters), and the movement emerges from running physics on that body. This indirect encoding is the actual research idea being explored, not an implementation detail: a small change to a gene (say, one muscle's phase) can cascade into a very different gait, and the search is over body-and-behavior jointly, not over a fixed body with tunable behavior. This is the same principle behind Karl Sims' foundational 1994 paper *"Evolved Virtual Creatures"* — arguably the origin of this entire genre of simulation — and behind the YouTube video (David Randall Miller, ["I programmed some creatures. They Evolved."](https://youtu.be/N3tRFayqVtk)) that this repo is a direct homage to. Jitterlings is a minimal, transparent reimplementation of that idea from scratch, not a novel research contribution.

## What the experiments are actually probing

The README's experiments aren't just "run it and see" — each observed pattern maps to a known GA phenomenon:

- **Stepped, not smooth, fitness curves.** Elitism means the current champion is carried forward unchanged every generation. The best-fitness line can only ever go up or stay flat, in discrete jumps, whenever a mutation (or a fresh random genome) beats the incumbent. A smooth curve would actually indicate something *else* is going on.
- **Exploitation vs. exploration.** A wide gap between best and average fitness means the population is spending most of its generations exploring mutations around the current best rather than converging — more of the search space gets tried, at the cost of a lower per-generation average. A narrow gap means the opposite trade: faster convergence, less exploration.
- **Fragile optima.** In the 479-generation run, the eventual champion was a minimal 3-node genome exploiting a "flip and launch" motion rather than a walking gait. Once elitism locks in a genome that's already close to maximally exploiting the fitness function with very little redundant structure, most mutations of it are net-negative — there's nowhere to go but down. That's why average fitness *drifted downward* after that genome took over, instead of the population catching up to it.
- **Run-to-run variance.** Two 479-generation runs plateaued at different fitness values via different strategies. With a small population (20) and mutation-only reproduction, which random genome an early generation happens to draw has an outsized, largely irreversible effect on the entire rest of the run — a textbook case of a GA's sensitivity to initial conditions and its random walk toward a local (not global) optimum.

## Open questions

Framed as questions rather than a backlog (see the README for the equivalent practical TODOs):

- Does adding crossover reduce run-to-run variance, by recombining structure instead of relying on a single lineage's mutations?
- Does an explicit penalty on "cheap" strategies (e.g. scoring sustained forward velocity instead of raw displacement) push evolution toward gait-like locomotion instead of degenerate tricks?
- Would occasionally reintroducing fresh random genomes deeper into a run (not just at generation 1) rescue a population stuck on a fragile optimum, or just waste generations?
- How much of the plateau is the fitness function's own ceiling (there's only so much horizontal distance to gain from a small body in 6 simulated seconds) versus the search actually getting stuck?
