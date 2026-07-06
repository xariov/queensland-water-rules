/**
 * Question selection, per the PRD session model: questions are dealt from a
 * shuffle of the whole bank without repeats until the pool is exhausted;
 * wrongly answered questions are requeued sooner (within the same pass).
 * When a pass is exhausted, a fresh shuffled pass begins.
 *
 * Pure functions over an explicit state value, so selection is trivially
 * testable and the state can be persisted as-is.
 */

export interface QueueState {
  /** Question ids remaining in this pass, current question first. */
  queue: string[];
  /** 1-based pass counter, for display. */
  pass: number;
}

export type RandomSource = () => number;

/** The fewest questions later a wrongly answered question may reappear. */
export const REQUEUE_DISTANCE = 5;

export function shuffled<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Lightweight spaced-repetition shaping: a fresh pass still deals every
 * question exactly once, but questions answered wrong last time surface
 * first, then never-seen questions, then the rest - each group shuffled.
 */
export interface PassPriority {
  isWrong(questionId: string): boolean;
  isUnseen(questionId: string): boolean;
}

export function newPass(
  allIds: readonly string[],
  random: RandomSource,
  pass = 1,
  priority?: PassPriority,
): QueueState {
  if (!priority) return { queue: shuffled(allIds, random), pass };
  const wrong: string[] = [];
  const unseen: string[] = [];
  const rest: string[] = [];
  for (const id of allIds) {
    if (priority.isWrong(id)) wrong.push(id);
    else if (priority.isUnseen(id)) unseen.push(id);
    else rest.push(id);
  }
  return {
    queue: [...shuffled(wrong, random), ...shuffled(unseen, random), ...shuffled(rest, random)],
    pass,
  };
}

export function currentQuestionId(state: QueueState): string | null {
  return state.queue[0] ?? null;
}

/**
 * Apply an answer to the current question. A wrong answer requeues the
 * question into the bottom half of the remaining queue (at least
 * REQUEUE_DISTANCE back), so it is not asked again straight away and there
 * is time for learning to settle; a correct answer retires it for this pass.
 * An exhausted queue rolls over into a freshly shuffled pass.
 */
export function applyAnswer(
  state: QueueState,
  allIds: readonly string[],
  random: RandomSource,
  correct: boolean,
  priority?: PassPriority,
): QueueState {
  const [current, ...rest] = state.queue;
  if (current === undefined) return state;
  const queue = [...rest];
  if (!correct) {
    const insertAt = Math.min(queue.length, Math.max(REQUEUE_DISTANCE, Math.floor(queue.length / 2)));
    queue.splice(insertAt, 0, current);
  }
  if (queue.length === 0) {
    return newPass(allIds, random, state.pass + 1, priority);
  }
  return { queue, pass: state.pass };
}
