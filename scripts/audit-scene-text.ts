/** Dumps every question whose scene shows text or an identifying hint. */
import { allQuestions } from '../src/quiz/bank/index.ts';

for (const q of allQuestions) {
  const layout = q.scene.layout;
  const lines: string[] = [];
  if (layout.kind === 'card') {
    lines.push(`CARD icon=${layout.icon} label=${JSON.stringify(layout.label ?? '')} badge=${JSON.stringify(layout.badge ?? '')}`);
  }
  if (layout.kind === 'lightsView' && layout.silhouette && layout.silhouette !== 'none') {
    lines.push(`LIGHTS silhouette=${layout.silhouette}`);
  }
  if ((layout.kind === 'openWater' || layout.kind === 'channel')) {
    for (const f of layout.features ?? []) {
      if (f.kind === 'distanceRing') lines.push(`RING label=${JSON.stringify(f.label)}`);
    }
  }
  if (lines.length === 0) continue;
  console.log(`### ${q.id}`);
  console.log(`Q: ${q.question}`);
  console.log(`A: ${q.options[q.correctIndex]}`);
  for (const line of lines) console.log(line);
}
