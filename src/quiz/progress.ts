/**
 * Per-device progress, kept in browser local storage (no accounts, no
 * backend). The format is versioned so it can become the synced profile
 * format if accounts arrive later, per the PRD.
 */

import type { QuestionFilter } from './filter.ts';
import type { QueueState } from './selection.ts';

/** The persisted practice session: the queue plus any active selection. */
export interface StoredSession extends QueueState {
  filter?: QuestionFilter | null;
}

export interface QuestionProgress {
  seen: number;
  correct: number;
  wrong: number;
  lastResult: 'correct' | 'wrong';
  lastSeenAt: string;
}

export interface ProgressV1 {
  version: 1;
  questions: Record<string, QuestionProgress>;
  /** Current run of consecutive correct answers. */
  streak?: number;
  /** Best streak ever achieved on this device. */
  bestStreak?: number;
}

/** The subset of the Storage interface we rely on; injectable for tests. */
export interface StringStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const PROGRESS_KEY = 'queensland-water-rules.progress.v1';
export const SESSION_KEY = 'queensland-water-rules.session.v1';

export const emptyProgress = (): ProgressV1 => ({ version: 1, questions: {} });

export function loadProgress(storage: StringStorage): ProgressV1 {
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (raw === null) return emptyProgress();
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' && parsed !== null
      && (parsed as ProgressV1).version === 1
      && typeof (parsed as ProgressV1).questions === 'object'
    ) {
      return parsed as ProgressV1;
    }
    return emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(storage: StringStorage, progress: ProgressV1): void {
  storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function recordAnswer(
  progress: ProgressV1,
  questionId: string,
  correct: boolean,
  now: () => Date = () => new Date(),
): ProgressV1 {
  const previous = progress.questions[questionId] ?? {
    seen: 0, correct: 0, wrong: 0, lastResult: 'wrong' as const, lastSeenAt: '',
  };
  const streak = correct ? (progress.streak ?? 0) + 1 : 0;
  return {
    version: 1,
    questions: {
      ...progress.questions,
      [questionId]: {
        seen: previous.seen + 1,
        correct: previous.correct + (correct ? 1 : 0),
        wrong: previous.wrong + (correct ? 0 : 1),
        lastResult: correct ? 'correct' : 'wrong',
        lastSeenAt: now().toISOString(),
      },
    },
    streak,
    bestStreak: Math.max(progress.bestStreak ?? 0, streak),
  };
}

/** Questions the user is still getting wrong (for mistake practice). */
export function isMistake(progress: ProgressV1, questionId: string): boolean {
  const record = progress.questions[questionId];
  if (!record) return false;
  return record.lastResult === 'wrong' || record.wrong > record.correct;
}

/** Questions answered correctly at least once: the simple mastery measure. */
export function masteredCount(progress: ProgressV1, questionIds: readonly string[]): number {
  return questionIds.filter((id) => (progress.questions[id]?.correct ?? 0) > 0).length;
}

/** Restore a persisted session, discarding it if the bank has changed. */
export function loadSession(storage: StringStorage, validIds: readonly string[]): StoredSession | null {
  try {
    const raw = storage.getItem(SESSION_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    const state = parsed as StoredSession;
    if (
      typeof state !== 'object' || state === null
      || !Array.isArray(state.queue) || typeof state.pass !== 'number'
    ) {
      return null;
    }
    const valid = new Set(validIds);
    if (state.queue.length === 0 || !state.queue.every((id) => valid.has(id))) return null;
    const filter = state.filter && Array.isArray(state.filter.tags)
      && typeof state.filter.search === 'string'
      ? { tags: state.filter.tags.filter((tag) => typeof tag === 'string'), search: state.filter.search }
      : null;
    return { queue: state.queue, pass: state.pass, filter };
  } catch {
    return null;
  }
}

export function saveSession(storage: StringStorage, state: StoredSession): void {
  storage.setItem(SESSION_KEY, JSON.stringify(state));
}
