/**
 * Applies scene-text patches (answer-giveaway fixes) to the generated
 * question files. Patch files are JSON arrays of:
 *   { "id": "<question id>", "set": {
 *       "label"?: string | null,      // card label; null removes
 *       "badge"?: string | null,      // card badge; null removes
 *       "icon"?: string,              // card icon replacement
 *       "silhouette"?: string,        // lightsView silhouette
 *       "rings"?: [{ "id": "*" | string, "label": string }]
 *   } }
 *
 * Usage: node scripts/apply-scene-patches.ts <patches.json> [...more]
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Question } from '../src/quiz/model.ts';

const GENERATED_DIR = join(import.meta.dirname, '..', 'src', 'quiz', 'bank', 'generated');

interface Patch {
  id: string;
  set: {
    label?: string | null;
    badge?: string | null;
    icon?: string;
    silhouette?: string;
    rings?: { id: string; label: string }[];
  };
}

const patches = new Map<string, Patch['set']>();
for (const path of process.argv.slice(2)) {
  for (const patch of JSON.parse(readFileSync(path, 'utf8')) as Patch[]) {
    patches.set(patch.id, patch.set);
  }
}
console.log(`loaded ${patches.size} patches`);

let applied = 0;
const unmatched = new Set(patches.keys());
for (const file of readdirSync(GENERATED_DIR).filter((name) => name.endsWith('.json'))) {
  const path = join(GENERATED_DIR, file);
  const questions = JSON.parse(readFileSync(path, 'utf8')) as Question[];
  let changed = false;
  for (const question of questions) {
    const set = patches.get(question.id);
    if (!set) continue;
    unmatched.delete(question.id);
    const layout = question.scene.layout as unknown as Record<string, unknown>;
    if (layout.kind === 'card') {
      if ('label' in set) {
        if (set.label === null) delete layout.label;
        else layout.label = set.label;
      }
      if ('badge' in set) {
        if (set.badge === null) delete layout.badge;
        else layout.badge = set.badge;
      }
      if (set.icon) layout.icon = set.icon;
    }
    if (layout.kind === 'lightsView' && set.silhouette) {
      layout.silhouette = set.silhouette;
    }
    if ((layout.kind === 'openWater' || layout.kind === 'channel') && set.rings) {
      const features = (layout.features ?? []) as { kind: string; id: string; label?: string }[];
      for (const ringPatch of set.rings) {
        for (const feature of features) {
          if (feature.kind !== 'distanceRing') continue;
          if (ringPatch.id === '*' || feature.id === ringPatch.id) {
            feature.label = ringPatch.label;
          }
        }
      }
    }
    applied += 1;
    changed = true;
  }
  if (changed) writeFileSync(path, `${JSON.stringify(questions, null, 1)}\n`);
}

console.log(`applied ${applied} patches`);
if (unmatched.size > 0) {
  console.error(`UNMATCHED ids (likely exemplars, patch those by hand): ${[...unmatched].join(', ')}`);
}
