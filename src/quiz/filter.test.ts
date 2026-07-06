import { describe, expect, it } from 'vitest';
import { filterQuestions, isFilterEmpty } from './filter.ts';
import { allQuestions } from './bank/index.ts';
import { topics } from './topics.ts';

describe('filterQuestions', () => {
  it('finds questions by free-text search across their content', () => {
    const matches = filterQuestions(allQuestions, { tags: [], search: 'cardinal mark' }, topics);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.map((q) => q.id)).toContain('cm-north-mark');
  });

  it('unions selected tags rather than intersecting them', () => {
    const both = filterQuestions(
      allQuestions, { tags: ['give way', 'lifejackets'], search: '' }, topics,
    );
    const giveWay = filterQuestions(allQuestions, { tags: ['give way'], search: '' }, topics);
    const lifejackets = filterQuestions(allQuestions, { tags: ['lifejackets'], search: '' }, topics);
    // Every match carries at least one of the selected tags...
    for (const question of both) {
      expect((question.tags ?? []).some((t) => t === 'give way' || t === 'lifejackets')).toBe(true);
    }
    // ...and the union is at least as large as either tag alone.
    expect(both.length).toBeGreaterThanOrEqual(Math.max(giveWay.length, lifejackets.length));
  });

  it('adds search matches to tag matches (union)', () => {
    const matches = filterQuestions(allQuestions, { tags: ['pwc'], search: 'sailing' }, topics);
    const pwcOnly = filterQuestions(allQuestions, { tags: ['pwc'], search: '' }, topics);
    const sailingOnly = filterQuestions(allQuestions, { tags: [], search: 'sailing' }, topics);
    const unionIds = new Set([...pwcOnly, ...sailingOnly].map((q) => q.id));
    // The combined filter is exactly the union of each criterion alone.
    expect(new Set(matches.map((q) => q.id))).toEqual(unionIds);
    expect(matches.length).toBeGreaterThan(pwcOnly.length);
    expect(matches.length).toBeGreaterThan(sailingOnly.length);
  });

  it('returns everything for an empty filter', () => {
    const matches = filterQuestions(allQuestions, { tags: [], search: '  ' }, topics);
    expect(matches.length).toBe(allQuestions.length);
  });
});

describe('isFilterEmpty', () => {
  it('treats null, no tags and blank search as empty', () => {
    expect(isFilterEmpty(null)).toBe(true);
    expect(isFilterEmpty({ tags: [], search: '' })).toBe(true);
    expect(isFilterEmpty({ tags: [], search: '  ' })).toBe(true);
    expect(isFilterEmpty({ tags: ['speed limits'], search: '' })).toBe(false);
    expect(isFilterEmpty({ tags: [], search: 'anchor' })).toBe(false);
  });
});
