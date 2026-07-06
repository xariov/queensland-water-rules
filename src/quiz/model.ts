/**
 * Quiz content model. Every question is anchored to the specific rule it
 * tests so anyone can validate a question against the law when it seems
 * wrong (the PRD's flag-and-fix loop depends on this).
 */

import type { Scene } from '../scene/model.ts';

export interface Topic {
  id: string;
  title: string;
  /** Subject area grouping shown alongside the topic, e.g. 'Give way'. */
  area: string;
  summary: string;
  /**
   * Short references to the rules this topic covers, e.g. 'TOMSR s24' or
   * 'COLREGS rule 15'.
   */
  sourceRefs: string[];
}

export interface Citation {
  /** Human-readable reference, e.g. 'TOMSR 2016, section 24 (lifejackets)'. */
  reference: string;
  url: string;
}

export interface Question {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citations: Citation[];
  scene: Scene;
  /**
   * Concept tags for cross-topic grouping (e.g. 'give way' + 'night').
   * Derived automatically from the topic and question text when
   * not set explicitly; see tags.ts for the vocabulary.
   */
  tags?: string[];
}
