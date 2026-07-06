import { describe, expect, it } from 'vitest';
import {
  applyAnswer, currentQuestionId, newPass, REQUEUE_DISTANCE, shuffled,
} from './selection.ts';

/** Deterministic random source cycling through the given values. */
function fixedRandom(values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}

const IDS = ['q1', 'q2', 'q3', 'q4', 'q5'];

describe('shuffled', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [...IDS];
    const result = shuffled(input, fixedRandom([0.3, 0.7, 0.1, 0.9]));
    expect(input).toEqual(IDS);
    expect([...result].sort()).toEqual([...IDS].sort());
  });
});

describe('the practice queue', () => {
  it('deals every question exactly once when all answers are correct', () => {
    let state = newPass(IDS, fixedRandom([0.5]));
    const dealt: string[] = [];
    for (let i = 0; i < IDS.length; i++) {
      dealt.push(currentQuestionId(state)!);
      state = applyAnswer(state, IDS, fixedRandom([0.5]), true);
    }
    expect([...dealt].sort()).toEqual([...IDS].sort());
  });

  it('requeues a wrong answer into the bottom half of the remaining queue', () => {
    const longIds = Array.from({ length: 12 }, (_, i) => `n${i}`);
    let state = { queue: [...longIds], pass: 1 };
    const first = longIds[0];
    state = applyAnswer(state, longIds, fixedRandom([0]), false);
    expect(state.pass).toBe(1);
    // 11 remain, so it lands at floor(11/2) = 5 (also >= REQUEUE_DISTANCE).
    expect(state.queue.indexOf(first)).toBe(Math.max(REQUEUE_DISTANCE, 5));
    expect(state.queue.filter((id) => id === first)).toHaveLength(1);
  });

  it('requeues at the end when fewer questions remain than the requeue distance', () => {
    let state = { queue: ['q1', 'q2'], pass: 1 };
    state = applyAnswer(state, IDS, fixedRandom([0]), false);
    expect(state.queue).toEqual(['q2', 'q1']);
  });

  it('starts a new shuffled pass when the queue is exhausted', () => {
    let state = { queue: ['q3'], pass: 1 };
    state = applyAnswer(state, IDS, fixedRandom([0.2]), true);
    expect(state.pass).toBe(2);
    expect([...state.queue].sort()).toEqual([...IDS].sort());
  });

  it('a wrong answer on the final question stays in the current pass', () => {
    let state = { queue: ['q3'], pass: 1 };
    state = applyAnswer(state, IDS, fixedRandom([0.2]), false);
    expect(state.pass).toBe(1);
    expect(state.queue).toEqual(['q3']);
  });
});
