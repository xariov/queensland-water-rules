/**
 * The question bank: hand-authored exemplars plus generated batches.
 * Generated files are build artifacts produced by scripts/integrate-generated.ts,
 * which validates and trial-renders every question before it lands here and
 * maintains ./generated/index.ts.
 */

import type { Question } from '../model.ts';
import { deriveTags } from '../tags.ts';
import { exemplarQuestions } from './exemplars.ts';
import { generatedQuestions } from './generated/index.ts';

export const allQuestions: Question[] = [
  ...exemplarQuestions,
  ...generatedQuestions,
].map((question) => ({
  ...question,
  tags: question.tags?.length ? question.tags : deriveTags(question),
}));
