/**
 * Structural validation for quiz content. The generation pipeline (and for
 * now, hand authoring) must produce questions that pass these checks before
 * they can ship; anything unanchored to a rule citation is rejected.
 */

import { validateScene } from '../scene/validate.ts';
import type { Question, Topic } from './model.ts';

export function validateQuestion(question: Question, topics: Topic[]): string[] {
  const errors: string[] = [];
  const report = (message: string): void => {
    errors.push(`${question.id}: ${message}`);
  };

  if (!topics.some((topic) => topic.id === question.topicId)) {
    report(`unknown topic '${question.topicId}'`);
  }
  if (question.options.length < 2) {
    report('needs at least 2 options');
  }
  if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
    report(`correctIndex ${question.correctIndex} out of range`);
  }
  if (question.question.trim() === '') report('question text is empty');
  if (question.explanation.trim() === '') report('explanation is empty');
  // Options must lead with substantive text: a leading vessel label reads
  // like a broken multiple-choice letter once the options are shuffled.
  for (const option of question.options) {
    if (/^(Vessel |Boat |Skipper )?[A-D]( - |\. |, )/.test(option)) {
      report(`option leads with a vessel label: '${option.slice(0, 40)}'`);
    }
    if (!/[.?!]$/.test(option.trim())) {
      report(`option must end with a full stop: '${option.slice(0, 40)}'`);
    }
  }
  if (question.citations.length === 0) {
    report('every question must cite at least one rule or guidance source');
  }
  for (const citation of question.citations) {
    if (citation.reference.trim() === '') report('citation reference is empty');
    if (!citation.url.startsWith('https://')) {
      report(`citation url '${citation.url}' is not https`);
    }
  }
  if (question.scene.id !== question.id) {
    report(`scene id '${question.scene.id}' does not match question id`);
  }
  errors.push(...validateScene(question.scene));
  return errors;
}

export function validateBank(questions: Question[], topics: Topic[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  for (const question of questions) {
    if (seenIds.has(question.id)) errors.push(`duplicate question id '${question.id}'`);
    seenIds.add(question.id);
    errors.push(...validateQuestion(question, topics));
  }
  for (const topic of topics) {
    const count = questions.filter((question) => question.topicId === topic.id).length;
    if (count < 2) {
      errors.push(`topic '${topic.id}' has only ${count} question(s); minimum is 2`);
    }
  }
  return errors;
}
