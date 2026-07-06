/**
 * The quiz: a continuous practice stream over the question bank, plus a
 * mock test mode shaped like the real BoatSafe knowledge assessment
 * (multiple choice, no feedback until the end, aiming for every answer
 * correct).
 */

import '../style.css';
import { renderScene } from '../render/renderScene.ts';
import { allQuestions } from './bank/index.ts';
import { topics } from './topics.ts';
import { TAG_VOCABULARY } from './tags.ts';
import { filterQuestions, isFilterEmpty, type QuestionFilter } from './filter.ts';
import { validateBank } from './validateQuestion.ts';
import type { Question } from './model.ts';
import {
  applyAnswer, currentQuestionId, newPass, type QueueState, shuffled,
} from './selection.ts';
import {
  emptyProgress, isMistake, loadProgress, loadSession, masteredCount,
  recordAnswer, saveProgress, saveSession,
} from './progress.ts';
import { earnedAwards, newAwards, type Award } from './awards.ts';
import { repositoryUrl } from './config.ts';

const MOCK_TEST_SIZE = 50;

const questions = allQuestions;
const questionsById = new Map(questions.map((question) => [question.id, question]));
const allIds = questions.map((question) => question.id);
const topicsById = new Map(topics.map((topic) => [topic.id, topic]));

const bankErrors = validateBank(questions, topics);
if (bankErrors.length > 0) console.error('Question bank validation failed', bankErrors);

const baseQuestions = questions;
const baseIds = allIds;

/** A question is mastered once it has been answered correctly at least once. */
const isMastered = (id: string): boolean => (progress.questions[id]?.correct ?? 0) > 0;

/** The questions a filter selects, before mastered ones are removed. */
const selectionFor = (filter: QuestionFilter | null): Question[] =>
  isFilterEmpty(filter) ? baseQuestions : filterQuestions(baseQuestions, filter!, topics, progress);

/**
 * The practice pool: the selection minus mastered questions, which never
 * reappear regardless of filters. If everything selected is mastered, fall
 * back to the whole selection so there is always something to practise.
 */
const poolFor = (filter: QuestionFilter | null): string[] => {
  const selection = selectionFor(filter);
  const unmastered = selection.filter((question) => !isMastered(question.id));
  return (unmastered.length > 0 ? unmastered : selection).map((question) => question.id);
};

/** Weak questions first, then unseen, when a fresh pass is dealt. */
const passPriority = () => ({
  isWrong: (id: string) => progress.questions[id]?.lastResult === 'wrong',
  isUnseen: (id: string) => progress.questions[id] === undefined,
});

const questionIdsByTag = new Map<string, string[]>();
for (const question of questions) {
  for (const tag of question.tags ?? []) {
    questionIdsByTag.set(tag, [...(questionIdsByTag.get(tag) ?? []), question.id]);
  }
}

let progress = loadProgress(localStorage);
const storedSession = loadSession(localStorage, baseIds);
let currentFilter: QuestionFilter | null = storedSession?.filter ?? null;
if (isFilterEmpty(currentFilter)) currentFilter = null;
let poolIds = poolFor(currentFilter);
let queueState: QueueState = storedSession ?? newPass(poolIds, Math.random, 1, passPriority());

// A shared link (#q=<id>) opens straight to that question, ahead of the rest,
// even if it is filtered out or already mastered.
const sharedId = parseSharedQuestionId();
if (sharedId !== null && questionsById.has(sharedId)) {
  currentFilter = null;
  poolIds = poolFor(null);
  const rest = shuffled(poolIds.filter((id) => id !== sharedId), Math.random);
  queueState = { queue: [sharedId, ...rest], pass: 1 };
}

/** Set when the current question has been answered; cleared on advance. */
let pendingNextState: QueueState | null = null;

/** Active mock test, or null while practising. */
interface TestState {
  ids: string[];
  index: number;
  wrongIds: string[];
}
let testState: TestState | null = null;

/** The selection being assembled in the browse panel, before practising. */
const draft: QuestionFilter = {
  tags: [...(currentFilter?.tags ?? [])],
  search: currentFilter?.search ?? '',
};

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <header class="quiz-header">
    <h1>Queensland Water Rules</h1>
    <div class="header-side">
      <p class="stats" id="stats"></p>
      <button class="header-link" id="browse-toggle" type="button">Browse</button>
      <button class="header-link" id="awards-toggle" type="button">Awards</button>
      <button class="header-link" id="mock-test" type="button">Mock test</button>
      <button class="header-link" id="clear-pool" type="button" title="Practice all questions" hidden>All</button>
      <button class="header-link" id="reset" type="button">Reset progress</button>
    </div>
  </header>
  <section class="browse" id="browse" hidden>
    <input
      class="search" id="search" type="search"
      placeholder="Search questions, e.g. cardinal mark"
    />
    <div class="tag-picker" id="tag-picker"></div>
    <p class="browse-count" id="browse-count"></p>
    <ul class="results" id="results"></ul>
    <div class="browse-actions">
      <button class="header-link" id="practice-mistakes" type="button"></button>
      <button class="next" id="practice-selection" type="button">Practice this selection</button>
    </div>
  </section>
  <section class="awards" id="awards" hidden></section>
  <div class="toasts" id="toasts"></div>
  <main class="quiz">
    <figure class="scene" id="scene-frame">
      <div id="scene"></div>
      <button class="play" id="play" type="button" hidden>Replay</button>
    </figure>
    <section class="panel">
      <div class="panel-head">
        <p class="topic" id="topic"></p>
        <button class="share-link" id="share" type="button" title="Copy a link to this question">Share</button>
      </div>
      <p class="tags" id="tags"></p>
      <h2 class="question" id="question"></h2>
      <div class="options" id="options"></div>
      <div class="feedback" id="feedback" hidden>
        <p class="verdict" id="verdict"></p>
        <p class="explanation" id="explanation"></p>
        <p class="citations-label">Rules tested:</p>
        <ul class="citations" id="citations"></ul>
        <div class="actions">
          <a class="flag" id="flag" target="_blank" rel="noreferrer" hidden>Flag this question</a>
          <button class="next" id="next">Next question</button>
        </div>
      </div>
      <div class="test-results" id="test-results" hidden></div>
    </section>
  </main>
`;

const elements = {
  stats: document.querySelector<HTMLParagraphElement>('#stats')!,
  browseToggle: document.querySelector<HTMLButtonElement>('#browse-toggle')!,
  clearPool: document.querySelector<HTMLButtonElement>('#clear-pool')!,
  reset: document.querySelector<HTMLButtonElement>('#reset')!,
  browse: document.querySelector<HTMLElement>('#browse')!,
  awardsToggle: document.querySelector<HTMLButtonElement>('#awards-toggle')!,
  awardsPanel: document.querySelector<HTMLElement>('#awards')!,
  mockTest: document.querySelector<HTMLButtonElement>('#mock-test')!,
  practiceMistakes: document.querySelector<HTMLButtonElement>('#practice-mistakes')!,
  toasts: document.querySelector<HTMLDivElement>('#toasts')!,
  search: document.querySelector<HTMLInputElement>('#search')!,
  tagPicker: document.querySelector<HTMLDivElement>('#tag-picker')!,
  browseCount: document.querySelector<HTMLParagraphElement>('#browse-count')!,
  results: document.querySelector<HTMLUListElement>('#results')!,
  practiceSelection: document.querySelector<HTMLButtonElement>('#practice-selection')!,
  scene: document.querySelector<HTMLElement>('#scene')!,
  sceneFrame: document.querySelector<HTMLElement>('#scene-frame')!,
  play: document.querySelector<HTMLButtonElement>('#play')!,
  topic: document.querySelector<HTMLParagraphElement>('#topic')!,
  share: document.querySelector<HTMLButtonElement>('#share')!,
  tags: document.querySelector<HTMLParagraphElement>('#tags')!,
  question: document.querySelector<HTMLHeadingElement>('#question')!,
  options: document.querySelector<HTMLDivElement>('#options')!,
  feedback: document.querySelector<HTMLDivElement>('#feedback')!,
  verdict: document.querySelector<HTMLParagraphElement>('#verdict')!,
  explanation: document.querySelector<HTMLParagraphElement>('#explanation')!,
  citations: document.querySelector<HTMLUListElement>('#citations')!,
  flag: document.querySelector<HTMLAnchorElement>('#flag')!,
  next: document.querySelector<HTMLButtonElement>('#next')!,
  testResults: document.querySelector<HTMLDivElement>('#test-results')!,
};

function flagUrl(question: Question): string | null {
  if (repositoryUrl === null) return null;
  const title = `Question flag: ${question.id}`;
  const body = [
    `Question: ${question.question}`,
    '',
    'Cited rules:',
    ...question.citations.map((citation) => `- ${citation.reference} (${citation.url})`),
    '',
    'What seems wrong with this question?',
    '',
  ].join('\n');
  return `${repositoryUrl}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

/** The shared question id encoded in the URL hash (#q=<id>), if any. */
function parseSharedQuestionId(): string | null {
  const match = /^#q=(.+)$/.exec(window.location.hash);
  return match ? decodeURIComponent(match[1]) : null;
}

/** A shareable link that opens the app at a specific question. */
function shareUrl(questionId: string): string {
  return `${window.location.origin}${window.location.pathname}#q=${encodeURIComponent(questionId)}`;
}

/** A brief, self-dismissing toast (reused for award and share confirmations). */
function showToast(message: string): void {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  elements.toasts.append(toast);
  window.setTimeout(() => toast.classList.add('fading'), 2400);
  window.setTimeout(() => toast.remove(), 3200);
}

function persistSession(state: QueueState): void {
  saveSession(localStorage, { ...state, filter: currentFilter });
}

function renderStats(): void {
  if (testState !== null) {
    elements.stats.textContent = `Question ${Math.min(testState.index + 1, testState.ids.length)} of ${testState.ids.length}`;
    elements.clearPool.hidden = true;
    return;
  }
  // Count over the whole selection (mastered included) so progress climbs to
  // 100% even though the practice pool drops mastered questions.
  const selection = selectionFor(currentFilter).map((question) => question.id);
  const mastered = masteredCount(progress, selection);
  elements.stats.textContent = currentFilter
    ? `Mastered ${mastered} of ${selection.length} selected`
    : `Mastered ${mastered} of ${selection.length}`;
  elements.clearPool.hidden = currentFilter === null;
}

// ---- Browse panel ----------------------------------------------------------

function tagMastery(tag: string): string {
  const ids = questionIdsByTag.get(tag) ?? [];
  if (ids.length === 0) return '';
  return ` ${Math.round((masteredCount(progress, ids) / ids.length) * 100)}%`;
}

function refreshTagChips(): void {
  for (const chip of elements.tagPicker.querySelectorAll<HTMLButtonElement>('.tag')) {
    const tag = chip.dataset.tag!;
    chip.querySelector('.tag-mastery')!.textContent = tagMastery(tag);
  }
}

for (const tag of TAG_VOCABULARY) {
  const chip = document.createElement('button');
  chip.className = 'tag selectable';
  chip.type = 'button';
  chip.dataset.tag = tag;
  chip.innerHTML = '<span></span><span class="tag-mastery"></span>';
  chip.querySelector('span')!.textContent = tag;
  chip.classList.toggle('selected', draft.tags.includes(tag));
  chip.addEventListener('click', () => {
    const index = draft.tags.indexOf(tag);
    if (index >= 0) draft.tags.splice(index, 1);
    else draft.tags.push(tag);
    chip.classList.toggle('selected', index < 0);
    renderBrowseResults();
  });
  elements.tagPicker.append(chip);
}
refreshTagChips();
elements.search.value = draft.search;

function refreshMistakesButton(): void {
  const count = baseIds.filter((id) => isMistake(progress, id)).length;
  elements.practiceMistakes.textContent = `Practice my mistakes (${count})`;
  elements.practiceMistakes.disabled = count === 0;
}
refreshMistakesButton();

elements.practiceMistakes.addEventListener('click', () => {
  draft.tags.length = 0;
  draft.search = '';
  elements.search.value = '';
  for (const chip of elements.tagPicker.querySelectorAll('.selected')) chip.classList.remove('selected');
  currentFilter = { tags: [], search: '', mistakesOnly: true };
  poolIds = poolFor(currentFilter);
  if (poolIds.length === 0) return;
  queueState = newPass(poolIds, Math.random, 1, passPriority());
  persistSession(queueState);
  elements.browse.hidden = true;
  renderQuestion();
  window.scrollTo({ top: 0 });
});

// Keyboard: 1-4 answer in display order, Enter advances, P replays.
document.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (event.key >= '1' && event.key <= '4') {
    const buttons = elements.options.querySelectorAll<HTMLButtonElement>('.option');
    buttons[Number(event.key) - 1]?.click();
  } else if (event.key === 'Enter' && !elements.feedback.hidden) {
    event.preventDefault();
    elements.next.click();
  } else if (event.key.toLowerCase() === 'p' && !elements.play.hidden) {
    elements.play.click();
  }
});

// ---- Awards ----------------------------------------------------------------

const TIER_LABELS = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', milestone: '★' } as const;

function renderAwardsPanel(): void {
  const awards = earnedAwards(progress, questions, topics);
  const mastered = masteredCount(progress, allIds);
  const overallPercent = Math.round((mastered / allIds.length) * 100);

  const areaRows = [...new Set(topics.map((topic) => topic.area))].map((area) => {
    const ids = questions
      .filter((question) => topicsById.get(question.topicId)?.area === area)
      .map((question) => question.id);
    const percent = ids.length === 0 ? 0 : Math.round((masteredCount(progress, ids) / ids.length) * 100);
    return `<div class="coverage-row"><span class="coverage-name"></span>
      <span class="coverage-bar"><span class="coverage-fill" style="width: ${percent}%"></span></span>
      <span class="coverage-percent">${percent}%</span></div>`;
  });

  elements.awardsPanel.innerHTML = `
    <h2>Knowledge coverage</h2>
    <p class="coverage-summary">You have demonstrated ${mastered} of ${allIds.length} questions (${overallPercent}%).
       Best streak: ${progress.bestStreak ?? 0}.</p>
    <div class="coverage" id="coverage"></div>
    <h2>Awards (${awards.length})</h2>
    <div class="award-grid" id="award-grid"></div>
  `;
  const coverage = elements.awardsPanel.querySelector('#coverage')!;
  const areas = [...new Set(topics.map((topic) => topic.area))];
  coverage.innerHTML = areaRows.join('');
  coverage.querySelectorAll('.coverage-name').forEach((node, index) => {
    node.textContent = areas[index];
  });
  const grid = elements.awardsPanel.querySelector('#award-grid')!;
  if (awards.length === 0) {
    grid.innerHTML = '<p class="coverage-summary">No awards yet - they arrive as you master tags, areas and streaks.</p>';
  }
  for (const award of awards) {
    const chip = document.createElement('span');
    chip.className = `award award-${award.tier}`;
    chip.title = award.detail;
    chip.textContent = award.tier === 'milestone'
      ? award.title
      : `${award.title} - ${TIER_LABELS[award.tier]}`;
    grid.append(chip);
  }
}

function showAwardToasts(awards: Award[]): void {
  for (const award of awards) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = award.tier === 'milestone'
      ? `Award earned: ${award.title}`
      : `Award earned: ${award.title} - ${TIER_LABELS[award.tier]}`;
    elements.toasts.append(toast);
    window.setTimeout(() => toast.classList.add('fading'), 3200);
    window.setTimeout(() => toast.remove(), 4000);
  }
}

elements.awardsToggle.addEventListener('click', () => {
  elements.awardsPanel.hidden = !elements.awardsPanel.hidden;
  if (!elements.awardsPanel.hidden) {
    elements.browse.hidden = true;
    renderAwardsPanel();
  }
});

function renderBrowseResults(): void {
  draft.search = elements.search.value;
  const matches = filterQuestions(baseQuestions, draft, topics);
  elements.browseCount.textContent = `${matches.length} matching question${matches.length === 1 ? '' : 's'}`;
  elements.practiceSelection.disabled = matches.length === 0;
  elements.results.innerHTML = '';
  for (const question of matches.slice(0, 60)) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    const topic = topicsById.get(question.topicId);
    const snippet = question.question.length > 110
      ? `${question.question.slice(0, 110)}...`
      : question.question;
    button.innerHTML = `<span class="result-text"></span><span class="result-topic"></span>`;
    button.querySelector('.result-text')!.textContent = snippet;
    button.querySelector('.result-topic')!.textContent = topic ? `${topic.area} - ${topic.title}` : '';
    button.addEventListener('click', () => startSelection(question.id));
    item.append(button);
    elements.results.append(item);
  }
  if (matches.length > 60) {
    const more = document.createElement('li');
    more.className = 'results-more';
    more.textContent = `...and ${matches.length - 60} more`;
    elements.results.append(more);
  }
}

/** Begin practising the drafted selection, optionally with a chosen first question. */
function startSelection(firstQuestionId?: string): void {
  endTest();
  currentFilter = isFilterEmpty(draft) ? null : { tags: [...draft.tags], search: draft.search };
  poolIds = poolFor(currentFilter);
  if (poolIds.length === 0) return;
  const rest = shuffled(poolIds.filter((id) => id !== firstQuestionId), Math.random);
  queueState = {
    queue: firstQuestionId ? [firstQuestionId, ...rest] : rest,
    pass: 1,
  };
  persistSession(queueState);
  elements.browse.hidden = true;
  renderQuestion();
  window.scrollTo({ top: 0 });
}

function clearSelection(): void {
  currentFilter = null;
  draft.tags.length = 0;
  draft.search = '';
  elements.search.value = '';
  for (const chip of elements.tagPicker.querySelectorAll('.selected')) {
    chip.classList.remove('selected');
  }
  poolIds = poolFor(null);
  queueState = newPass(poolIds, Math.random, 1, passPriority());
  persistSession(queueState);
  elements.browse.hidden = true;
  renderQuestion();
}

elements.browseToggle.addEventListener('click', () => {
  elements.browse.hidden = !elements.browse.hidden;
  if (!elements.browse.hidden) {
    elements.awardsPanel.hidden = true;
    refreshTagChips();
    renderBrowseResults();
    elements.search.focus();
  }
});
elements.search.addEventListener('input', renderBrowseResults);
elements.practiceSelection.addEventListener('click', () => startSelection());
elements.clearPool.addEventListener('click', clearSelection);

// ---- Mock test -------------------------------------------------------------

/**
 * A stratified draw across subject areas, proportional to each area's share
 * of the bank, mirroring how the real assessment spreads its questions.
 */
function pickMockTest(count: number): string[] {
  const areas = [...new Set(topics.map((topic) => topic.area))];
  const idsByArea = areas.map((area) => shuffled(
    questions
      .filter((question) => topicsById.get(question.topicId)?.area === area)
      .map((question) => question.id),
    Math.random,
  ));
  const total = questions.length;
  const target = Math.min(count, total);
  const picked: string[] = [];
  const leftovers: string[][] = [];
  for (const ids of idsByArea) {
    const share = Math.floor((target * ids.length) / total);
    picked.push(...ids.slice(0, share));
    leftovers.push(ids.slice(share));
  }
  let index = 0;
  while (picked.length < target && leftovers.some((pool) => pool.length > 0)) {
    const pool = leftovers[index % leftovers.length];
    const id = pool.shift();
    if (id !== undefined) picked.push(id);
    index += 1;
  }
  return shuffled(picked, Math.random);
}

function startTest(): void {
  testState = { ids: pickMockTest(MOCK_TEST_SIZE), index: 0, wrongIds: [] };
  elements.browse.hidden = true;
  elements.awardsPanel.hidden = true;
  elements.mockTest.textContent = 'Exit test';
  elements.testResults.hidden = true;
  renderQuestion();
  window.scrollTo({ top: 0 });
}

function endTest(): void {
  if (testState === null) return;
  testState = null;
  elements.mockTest.textContent = 'Mock test';
  elements.testResults.hidden = true;
  elements.share.hidden = false;
}

function renderTestResults(finished: TestState): void {
  const total = finished.ids.length;
  const wrong = finished.wrongIds;
  const scored = total - wrong.length;
  currentQuestion = null;
  elements.scene.innerHTML = '';
  elements.play.hidden = true;
  elements.topic.textContent = 'Mock test result';
  elements.tags.innerHTML = '';
  elements.question.textContent = wrong.length === 0
    ? `${scored} of ${total} correct. You would have passed this one.`
    : `${scored} of ${total} correct.`;
  elements.options.innerHTML = '';
  elements.feedback.hidden = true;

  const note = document.createElement('p');
  note.className = 'test-note';
  note.textContent = 'The real BoatSafe assessment requires every answer correct: anything you miss is retrained and retested on the day.';
  elements.testResults.innerHTML = '';
  elements.testResults.append(note);

  if (wrong.length > 0) {
    const list = document.createElement('ul');
    list.className = 'test-misses';
    for (const id of wrong) {
      const question = questionsById.get(id)!;
      const item = document.createElement('li');
      const text = document.createElement('p');
      text.className = 'test-miss-question';
      text.textContent = question.question;
      const answer = document.createElement('p');
      answer.className = 'test-miss-answer';
      answer.textContent = `Correct answer: ${question.options[question.correctIndex]}`;
      const why = document.createElement('p');
      why.className = 'test-miss-explanation';
      why.textContent = question.explanation;
      item.append(text, answer, why);
      list.append(item);
    }
    elements.testResults.append(list);

    const retry = document.createElement('button');
    retry.className = 'next';
    retry.type = 'button';
    retry.textContent = `Practice these ${wrong.length} question${wrong.length === 1 ? '' : 's'}`;
    retry.addEventListener('click', () => {
      endTest();
      currentFilter = null;
      queueState = { queue: shuffled(wrong, Math.random), pass: 1 };
      renderQuestion();
      window.scrollTo({ top: 0 });
    });
    elements.testResults.append(retry);
  }

  const done = document.createElement('button');
  done.className = 'header-link';
  done.type = 'button';
  done.textContent = 'Back to practice';
  done.addEventListener('click', () => {
    endTest();
    renderQuestion();
    window.scrollTo({ top: 0 });
  });
  elements.testResults.append(done);
  elements.testResults.hidden = false;
  renderStats();
}

elements.mockTest.addEventListener('click', () => {
  if (testState !== null) {
    endTest();
    renderQuestion();
    return;
  }
  startTest();
});

// ---- Question flow ---------------------------------------------------------

let currentQuestion: Question | null = null;
let playbackEndTimer: number | undefined;

/**
 * (Re)build the scene and play its movements once. Rebuilding the DOM is
 * what makes Replay reliable: restarting a compositor-driven offset-path
 * animation by toggling a class on an SVG subtree is flaky, but fresh
 * nodes always animate (the same reason a page refresh always plays).
 */
function renderSceneFrame(): void {
  if (currentQuestion === null) return;
  window.clearTimeout(playbackEndTimer);
  elements.scene.innerHTML = renderScene(currentQuestion.scene);
  elements.sceneFrame.classList.remove('playing');
  const animated = [...elements.scene.querySelectorAll<SVGGElement>('[data-animated]')];
  elements.play.hidden = animated.length === 0;
  if (animated.length === 0) return;

  const seconds = (variable: string, style: CSSStyleDeclaration): number =>
    Number.parseFloat(style.getPropertyValue(variable)) || 0;
  const longest = Math.max(...animated.map((vessel) => {
    const style = vessel.style;
    return seconds('--drive-duration', style) + seconds('--drive-delay', style);
  }));
  requestAnimationFrame(() => {
    elements.sceneFrame.classList.add('playing');
    playbackEndTimer = window.setTimeout(
      () => elements.sceneFrame.classList.remove('playing'),
      (longest + 0.8) * 1000,
    );
  });
}

function renderQuestion(): void {
  const questionId = testState !== null
    ? testState.ids[testState.index]
    : currentQuestionId(queueState);
  if (questionId === undefined || questionId === null) return;
  const question = questionsById.get(questionId)!;
  pendingNextState = null;

  currentQuestion = question;
  elements.testResults.hidden = true;
  renderSceneFrame();
  const topic = topicsById.get(question.topicId);
  elements.topic.textContent = testState !== null
    ? 'Mock test'
    : topic ? `${topic.area} - ${topic.title}` : '';
  elements.share.hidden = testState !== null;
  elements.tags.innerHTML = '';
  if (testState === null) {
    for (const tag of question.tags ?? []) {
      const chip = document.createElement('button');
      chip.className = 'tag';
      chip.type = 'button';
      chip.title = `Practice '${tag}' questions`;
      chip.textContent = tag;
      chip.addEventListener('click', () => {
        draft.tags.length = 0;
        draft.tags.push(tag);
        draft.search = '';
        elements.search.value = '';
        startSelection();
      });
      elements.tags.append(chip);
    }
  }
  elements.question.textContent = question.question;
  elements.feedback.hidden = true;
  elements.options.innerHTML = '';

  // Present the options in a random order; the bank stores the correct
  // answer first for authoring convenience.
  const order = shuffled(question.options.map((_, index) => index), Math.random);
  for (const optionIndex of order) {
    const button = document.createElement('button');
    button.className = 'option';
    button.type = 'button';
    button.dataset.optionIndex = String(optionIndex);
    button.textContent = question.options[optionIndex];
    button.addEventListener('click', () => answerChosen(question, optionIndex, button));
    elements.options.append(button);
  }
  renderStats();
}

function answerChosen(question: Question, chosenIndex: number, chosenButton: HTMLButtonElement): void {
  const correct = chosenIndex === question.correctIndex;

  if (testState !== null) {
    // Test mode: record the answer silently and move straight on, like the
    // real assessment sheet. Results and review come at the end.
    progress = recordAnswer(progress, question.id, correct);
    saveProgress(localStorage, progress);
    refreshMistakesButton();
    if (!correct) testState.wrongIds.push(question.id);
    testState.index += 1;
    if (testState.index >= testState.ids.length) {
      const finished = testState;
      testState = null;
      elements.mockTest.textContent = 'Mock test';
      renderTestResults(finished);
    } else {
      renderQuestion();
      window.scrollTo({ top: 0 });
    }
    return;
  }

  if (pendingNextState !== null) return;
  const awardsBefore = earnedAwards(progress, questions, topics);
  progress = recordAnswer(progress, question.id, correct);
  saveProgress(localStorage, progress);
  showAwardToasts(newAwards(awardsBefore, earnedAwards(progress, questions, topics)));
  refreshMistakesButton();
  // Recompute the pool so a question just mastered is gone from future passes.
  poolIds = poolFor(currentFilter);
  pendingNextState = applyAnswer(queueState, poolIds, Math.random, correct, passPriority());
  persistSession(pendingNextState);

  const buttons = [...elements.options.querySelectorAll<HTMLButtonElement>('.option')];
  for (const button of buttons) {
    button.disabled = true;
    if (Number(button.dataset.optionIndex) === question.correctIndex) {
      button.classList.add('correct');
    }
  }
  if (!correct) chosenButton.classList.add('wrong');

  elements.verdict.textContent = correct ? 'Correct' : 'Not quite';
  elements.verdict.dataset.result = correct ? 'correct' : 'wrong';
  elements.explanation.textContent = question.explanation;
  elements.citations.innerHTML = '';
  for (const citation of question.citations) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = citation.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = citation.reference;
    item.append(link);
    elements.citations.append(item);
  }
  const flag = flagUrl(question);
  elements.flag.hidden = flag === null;
  if (flag !== null) elements.flag.href = flag;
  elements.feedback.hidden = false;
  elements.next.focus();
  renderStats();
}

elements.reset.addEventListener('click', () => {
  if (!window.confirm('Reset all progress on this device?')) return;
  endTest();
  progress = emptyProgress();
  saveProgress(localStorage, progress);
  currentFilter = null;
  poolIds = poolFor(null);
  queueState = newPass(poolIds, Math.random, 1, passPriority());
  persistSession(queueState);
  refreshTagChips();
  refreshMistakesButton();
  renderStats();
  renderQuestion();
});

elements.share.addEventListener('click', () => {
  if (currentQuestion === null) return;
  const url = shareUrl(currentQuestion.id);
  if (typeof navigator.share === 'function') {
    void navigator.share({ title: 'Queensland Water Rules', url }).catch(() => { /* cancelled */ });
    return;
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied')).catch(() => showToast(url));
  } else {
    showToast(url);
  }
});

elements.play.addEventListener('click', renderSceneFrame);

elements.next.addEventListener('click', () => {
  if (pendingNextState === null) return;
  queueState = pendingNextState;
  renderQuestion();
  window.scrollTo({ top: 0 });
});

renderQuestion();
