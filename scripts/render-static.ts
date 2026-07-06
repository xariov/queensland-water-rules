/**
 * Out-of-browser smoke render: validates and renders every spike scene
 * and every bank scene to screenshots/<id>.html, exiting non-zero on any
 * validation failure. Proves the renderer has no DOM dependency and lets
 * a human eyeball any scene quickly.
 *
 * Usage: node scripts/render-static.ts [--sample N]
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderScene } from '../src/render/renderScene.ts';
import { validateScene } from '../src/scene/validate.ts';
import { scenarios } from '../src/scene/scenarios.ts';
import { allQuestions } from '../src/quiz/bank/index.ts';
import type { Scene } from '../src/scene/model.ts';

const OUT_DIR = join(import.meta.dirname, '..', 'screenshots');
mkdirSync(OUT_DIR, { recursive: true });

const sampleArg = process.argv.indexOf('--sample');
const sample = sampleArg >= 0 ? Number(process.argv[sampleArg + 1]) : null;

const scenes: Scene[] = [
  ...scenarios,
  ...allQuestions.map((question) => question.scene),
];
const selected = sample === null
  ? scenes
  : scenes.filter((_, index) => index % Math.ceil(scenes.length / sample) === 0);

let failures = 0;
for (const scene of selected) {
  const problems = validateScene(scene);
  if (problems.length > 0) {
    failures += 1;
    console.error(`INVALID ${scene.id}: ${problems.join('; ')}`);
    continue;
  }
  const svg = renderScene(scene);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${scene.title}</title>
<style>body{margin:0;background:#20303c;display:grid;place-items:center;min-height:100vh}
figure{max-width:640px;width:92vw;margin:0}svg{width:100%;height:auto;border-radius:12px}
figcaption{color:#dfe8ee;font:14px system-ui;padding:10px 2px}</style></head>
<body><figure>${svg}<figcaption>${scene.title}</figcaption></figure></body></html>
`;
  writeFileSync(join(OUT_DIR, `${scene.id}.html`), html);
}

console.log(`rendered ${selected.length - failures} of ${selected.length} scenes to screenshots/`);
if (failures > 0) process.exit(1);
