/**
 * Question filtering for the lesson picker: select by concept tags, by a
 * free-text search, or both. Tags and search ADD to each other (union): a
 * question is included if it carries any selected tag or matches the search,
 * so stacking criteria broadens the selection rather than narrowing it to
 * nothing. "Practice my mistakes" is a separate restriction.
 */

import type { Question, Topic } from './model.ts';
import { isMistake, type ProgressV1 } from './progress.ts';

export interface QuestionFilter {
  tags: string[];
  search: string;
  /** Restrict to questions the user is still getting wrong. */
  mistakesOnly?: boolean;
}

export function isFilterEmpty(filter: QuestionFilter | null): boolean {
  return filter === null
    || (filter.tags.length === 0 && filter.search.trim() === '' && filter.mistakesOnly !== true);
}

/** Everything searchable about a question, lowercased. */
function haystack(question: Question, topicsById: Map<string, Topic>): string {
  const topic = topicsById.get(question.topicId);
  return [
    question.question,
    ...question.options,
    question.explanation,
    question.scene.title,
    topic?.title ?? '',
    topic?.area ?? '',
    ...(question.tags ?? []),
  ].join(' ').toLowerCase();
}

export function filterQuestions(
  questions: Question[],
  filter: QuestionFilter,
  topics: Topic[],
  progress?: ProgressV1,
): Question[] {
  const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
  const words = filter.search.toLowerCase().split(/\s+/).filter((word) => word !== '');
  const hasTags = filter.tags.length > 0;
  const hasSearch = words.length > 0;
  return questions.filter((question) => {
    if (filter.mistakesOnly === true && (!progress || !isMistake(progress, question.id))) {
      return false;
    }
    if (!hasTags && !hasSearch) return true;
    const tags = new Set(question.tags ?? []);
    const tagMatch = hasTags && filter.tags.some((tag) => tags.has(tag));
    const searchMatch = hasSearch
      && words.every((word) => haystack(question, topicsById).includes(word));
    return tagMatch || searchMatch;
  });
}
