/// <reference types="vite/client" />
/**
 * Entry point: shows the one-time disclaimer gate, then loads the quiz.
 * Acceptance is stored per device; bump the key version if the wording
 * changes materially, so users see the new text once.
 */

import '../style.css';

const DISCLAIMER_ACCEPTED_KEY = 'queensland-water-rules.disclaimer.v1';

function startQuiz(): void {
  void import('./app.ts');
}

// Installable and offline-capable (the service worker is a no-op in dev).
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('sw.js');
  });
}

if (localStorage.getItem(DISCLAIMER_ACCEPTED_KEY) !== null) {
  startQuiz();
} else {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = `
    <section class="gate">
      <h1>Queensland Water Rules</h1>
      <p>
        This is an unofficial practice tool for learning the rules tested by
        the Queensland recreational marine and PWC licence courses. Before
        you start, please understand what it is and is not:
      </p>
      <ul>
        <li>
          Questions are written against the
          <a href="https://www.legislation.qld.gov.au/view/whole/html/inforce/current/sl-2016-0154"
             target="_blank" rel="noreferrer">Transport Operations (Marine
          Safety) Regulation 2016</a>, the international collision
          regulations (COLREGS) and Maritime Safety Queensland guidance, and
          cite what they test so you can check the rules for yourself.
        </li>
        <li>
          It is a best-effort study aid. Questions, answers and diagrams are
          prepared and reviewed with care, but they have not all been
          individually verified by a maritime professional and may contain
          errors or simplifications.
        </li>
        <li>
          It is not legal advice, not the BoatSafe assessment, and not
          affiliated with the Queensland Government, Maritime Safety
          Queensland, or any BoatSafe training provider. Only an accredited
          provider can assess you for a licence.
        </li>
        <li>
          Rules change. The in-force legislation and
          <a href="https://www.msq.qld.gov.au/"
             target="_blank" rel="noreferrer">official Maritime Safety
          Queensland guidance</a> always take precedence over anything shown
          here. If a question looks wrong, use its flag link so it can be
          reviewed.
        </li>
      </ul>
      <label class="gate-accept">
        <input type="checkbox" id="gate-checkbox" />
        <span>
          I understand this is an unofficial practice tool that may contain
          errors, and I will rely on official sources for my legal
          obligations on the water.
        </span>
      </label>
      <button class="next" id="gate-start" type="button" disabled>Start practising</button>
    </section>
  `;

  const checkbox = document.querySelector<HTMLInputElement>('#gate-checkbox')!;
  const start = document.querySelector<HTMLButtonElement>('#gate-start')!;
  checkbox.addEventListener('change', () => {
    start.disabled = !checkbox.checked;
  });
  start.addEventListener('click', () => {
    if (!checkbox.checked) return;
    localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, new Date().toISOString());
    app.innerHTML = '';
    startQuiz();
  });
}
