/**
 * Gamification: awards for demonstrated knowledge. Mastery means answering
 * a question correctly at least once. Tag and area awards come in tiers
 * (bronze 50%, silver 80%, gold 100% of the pool mastered); milestones
 * cover whole-bank coverage and answer streaks. Awards are derived from
 * progress on the fly - nothing extra is stored, so they can never drift.
 */

import type { Question, Topic } from './model.ts';
import type { ProgressV1 } from './progress.ts';
import { masteredCount } from './progress.ts';

export type AwardTier = 'bronze' | 'silver' | 'gold' | 'milestone';

export interface Award {
  id: string;
  title: string;
  tier: AwardTier;
  detail: string;
}

const TIERS: [AwardTier, number][] = [['gold', 1], ['silver', 0.8], ['bronze', 0.5]];

/** Smallest pool worth an award; tiny pools would gild too easily. */
const MINIMUM_POOL = 4;

function poolAward(
  kind: 'tag' | 'area',
  name: string,
  ids: string[],
  progress: ProgressV1,
): Award | null {
  if (ids.length < MINIMUM_POOL) return null;
  const mastered = masteredCount(progress, ids);
  for (const [tier, threshold] of TIERS) {
    if (mastered >= Math.ceil(ids.length * threshold)) {
      return {
        id: `${kind}:${name}:${tier}`,
        title: name,
        tier,
        detail: `${mastered} of ${ids.length} mastered`,
      };
    }
  }
  return null;
}

export function earnedAwards(
  progress: ProgressV1,
  questions: Question[],
  topics: Topic[],
): Award[] {
  const awards: Award[] = [];

  const byTag = new Map<string, string[]>();
  const byArea = new Map<string, string[]>();
  const topicArea = new Map(topics.map((topic) => [topic.id, topic.area]));
  for (const question of questions) {
    for (const tag of question.tags ?? []) {
      byTag.set(tag, [...(byTag.get(tag) ?? []), question.id]);
    }
    const area = topicArea.get(question.topicId);
    if (area) byArea.set(area, [...(byArea.get(area) ?? []), question.id]);
  }
  for (const [area, ids] of byArea) {
    const award = poolAward('area', area, ids, progress);
    if (award) awards.push(award);
  }
  for (const [tag, ids] of byTag) {
    const award = poolAward('tag', tag, ids, progress);
    if (award) awards.push(award);
  }

  // Milestones.
  const allIds = questions.map((question) => question.id);
  const mastered = masteredCount(progress, allIds);
  if (mastered >= 1) {
    awards.push({ id: 'milestone:first', title: 'First steps', tier: 'milestone', detail: 'First question mastered' });
  }
  for (const fraction of [0.25, 0.5, 0.75, 1]) {
    if (mastered >= Math.ceil(allIds.length * fraction)) {
      awards.push({
        id: `milestone:bank-${fraction * 100}`,
        title: `${fraction * 100}% of the rule book`,
        tier: 'milestone',
        detail: `${mastered} of ${allIds.length} questions mastered`,
      });
    }
  }
  const bestStreak = progress.bestStreak ?? 0;
  for (const target of [5, 10, 25]) {
    if (bestStreak >= target) {
      awards.push({
        id: `milestone:streak-${target}`,
        title: `${target} in a row`,
        tier: 'milestone',
        detail: `Best streak: ${bestStreak}`,
      });
    }
  }
  return awards;
}

/** Awards in `after` that are not in `before` (for the earned toast). */
export function newAwards(before: Award[], after: Award[]): Award[] {
  const seen = new Set(before.map((award) => award.id));
  return after.filter((award) => !seen.has(award.id));
}
