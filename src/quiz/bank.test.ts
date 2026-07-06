import { describe, expect, it } from 'vitest';
import { allQuestions } from './bank/index.ts';
import { topics } from './topics.ts';
import { validateBank } from './validateQuestion.ts';
import { renderScene } from '../render/renderScene.ts';
import { TAG_VOCABULARY } from './tags.ts';

describe('question bank', () => {
  it('is structurally valid', () => {
    expect(validateBank(allQuestions, topics)).toEqual([]);
  });

  it('has substantial coverage', () => {
    expect(allQuestions.length).toBeGreaterThanOrEqual(220);
    const areas = new Set(topics.map((topic) => topic.area));
    expect(areas.size).toBeGreaterThanOrEqual(10);
  });

  it('covers every topic', () => {
    for (const topic of topics) {
      const count = allQuestions.filter((question) => question.topicId === topic.id).length;
      expect(count, `topic ${topic.id}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('tags every question from the vocabulary', () => {
    const vocabulary = new Set<string>(TAG_VOCABULARY);
    for (const question of allQuestions) {
      expect(question.tags && question.tags.length, question.id).toBeTruthy();
      for (const tag of question.tags!) {
        expect(vocabulary.has(tag), `${question.id} tag '${tag}'`).toBe(true);
      }
    }
  });

  it('cites a source for every question', () => {
    for (const question of allQuestions) {
      expect(question.citations.length, question.id).toBeGreaterThan(0);
    }
  });

  it('renders every scene, including all its vessels', () => {
    for (const question of allQuestions) {
      const svg = renderScene(question.scene);
      expect(svg.startsWith('<svg '), question.id).toBe(true);
      for (const vessel of question.scene.vessels) {
        expect(svg, `${question.id} vessel ${vessel.id}`).toContain(`data-vessel-id="${vessel.id}"`);
      }
      for (const _ of question.scene.swimmers ?? []) {
        expect(svg, `${question.id} swimmers`).toContain('data-element="swimmer"');
      }
    }
  });
});
