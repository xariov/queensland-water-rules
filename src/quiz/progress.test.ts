import { describe, expect, it } from 'vitest';
import {
  emptyProgress, loadProgress, loadSession, masteredCount, PROGRESS_KEY,
  recordAnswer, saveProgress, saveSession, SESSION_KEY, type StringStorage,
} from './progress.ts';

function memoryStorage(initial: Record<string, string> = {}): StringStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

const fixedNow = () => new Date('2026-06-10T10:00:00.000Z');

describe('progress store', () => {
  it('starts empty and round-trips through storage', () => {
    const storage = memoryStorage();
    let progress = loadProgress(storage);
    expect(progress).toEqual(emptyProgress());

    progress = recordAnswer(progress, 'q1', true, fixedNow);
    progress = recordAnswer(progress, 'q1', false, fixedNow);
    saveProgress(storage, progress);

    const reloaded = loadProgress(storage);
    expect(reloaded.questions['q1']).toEqual({
      seen: 2, correct: 1, wrong: 1,
      lastResult: 'wrong', lastSeenAt: '2026-06-10T10:00:00.000Z',
    });
  });

  it('recovers from corrupt stored progress', () => {
    const storage = memoryStorage({ [PROGRESS_KEY]: 'not json {' });
    expect(loadProgress(storage)).toEqual(emptyProgress());
  });

  it('counts mastery as answered correctly at least once', () => {
    let progress = emptyProgress();
    progress = recordAnswer(progress, 'q1', true, fixedNow);
    progress = recordAnswer(progress, 'q2', false, fixedNow);
    expect(masteredCount(progress, ['q1', 'q2', 'q3'])).toBe(1);
  });
});

describe('session persistence', () => {
  it('round-trips the queue state', () => {
    const storage = memoryStorage();
    saveSession(storage, { queue: ['q2', 'q1'], pass: 3 });
    expect(loadSession(storage, ['q1', 'q2'])).toEqual({ queue: ['q2', 'q1'], pass: 3, filter: null });
  });

  it('round-trips an active selection filter', () => {
    const storage = memoryStorage();
    saveSession(storage, {
      queue: ['q1'], pass: 1,
      filter: { tags: ['roundabouts'], search: 'small' },
    });
    expect(loadSession(storage, ['q1'])).toEqual({
      queue: ['q1'], pass: 1,
      filter: { tags: ['roundabouts'], search: 'small' },
    });
  });

  it('discards a stored session referencing questions no longer in the bank', () => {
    const storage = memoryStorage({
      [SESSION_KEY]: JSON.stringify({ queue: ['q1', 'removed'], pass: 1 }),
    });
    expect(loadSession(storage, ['q1', 'q2'])).toBeNull();
  });

  it('discards corrupt or empty sessions', () => {
    expect(loadSession(memoryStorage({ [SESSION_KEY]: '][' }), ['q1'])).toBeNull();
    expect(loadSession(
      memoryStorage({ [SESSION_KEY]: JSON.stringify({ queue: [], pass: 1 }) }),
      ['q1'],
    )).toBeNull();
  });
});
