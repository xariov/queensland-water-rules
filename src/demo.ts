/** Renderer spike gallery: every scenario side by side, for eyeballing. */

import './style.css';
import { renderScene } from './render/renderScene.ts';
import { scenarios } from './scene/scenarios.ts';
import { validateScene } from './scene/validate.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = '<main class="demo"></main>';
const main = app.querySelector('.demo')!;

for (const scene of scenarios) {
  const problems = validateScene(scene);
  const figure = document.createElement('figure');
  figure.className = 'demo-scene';
  figure.innerHTML = `
    <div class="demo-svg">${renderScene(scene)}</div>
    <figcaption>
      <strong>${scene.title}</strong>
      ${problems.length > 0 ? `<span class="demo-problems">${problems.join('; ')}</span>` : ''}
    </figcaption>
  `;
  figure.addEventListener('click', () => {
    const svgHolder = figure.querySelector('.demo-svg')!;
    svgHolder.innerHTML = renderScene(scene);
    figure.classList.remove('playing');
    requestAnimationFrame(() => figure.classList.add('playing'));
  });
  main.append(figure);
}
