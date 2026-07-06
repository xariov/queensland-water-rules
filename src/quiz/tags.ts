/**
 * Concept tags for cross-topic browsing. A question's tags are derived
 * from its topic and wording unless the author sets them explicitly.
 */

import type { Question } from './model.ts';

export const TAG_VOCABULARY = [
  'give way',
  'buoys and marks',
  'navigation lights',
  'sound signals',
  'lifejackets',
  'safety equipment',
  'speed limits',
  'distance rules',
  'pwc',
  'sailing vessels',
  'night',
  'anchoring',
  'emergencies',
  'marine radio',
  'flares',
  'epirb',
  'weather',
  'tides',
  'bar crossings',
  'fuel',
  'alcohol',
  'licensing',
  'registration',
  'children',
  'towing and skiing',
  'channels',
  'ships',
  'general knowledge',
] as const;

export type Tag = (typeof TAG_VOCABULARY)[number];

/** Base tags applied to every question in a topic. */
const TOPIC_TAGS: Record<string, Tag[]> = {
  licences: ['licensing'],
  registration: ['registration'],
  'speed-distance': ['speed limits', 'distance rules'],
  alcohol: ['alcohol'],
  incidents: ['general knowledge'],
  'lifejacket-types': ['lifejackets', 'safety equipment'],
  'lifejacket-wearing': ['lifejackets'],
  'signalling-equipment': ['safety equipment'],
  'fire-safety': ['safety equipment', 'fuel'],
  'equipment-scales': ['safety equipment'],
  'water-limits': ['general knowledge'],
  'give-way-power': ['give way'],
  'give-way-sail': ['give way', 'sailing vessels'],
  'channels-traffic': ['give way', 'channels'],
  'lateral-marks': ['buoys and marks', 'channels'],
  'cardinal-marks': ['buoys and marks'],
  'nav-lights': ['navigation lights', 'night'],
  'shapes-sounds': ['sound signals'],
  anchoring: ['anchoring'],
  'boat-handling': ['general knowledge'],
  weather: ['weather'],
  'tides-bars': ['tides', 'bar crossings'],
  planning: ['fuel', 'general knowledge'],
  emergencies: ['emergencies'],
  distress: ['emergencies', 'marine radio'],
  pwc: ['pwc'],
  towing: ['towing and skiing'],
};

/** Extra tags derived from the question and scene wording. */
const KEYWORD_TAGS: [RegExp, Tag][] = [
  [/\bgive way|stand.on|keep clear\b/i, 'give way'],
  [/\bbuoy|beacon|mark\b/i, 'buoys and marks'],
  [/\blight|sidelight|masthead|all.round\b/i, 'navigation lights'],
  [/\bblast|horn|whistle|fog signal\b/i, 'sound signals'],
  [/\blifejacket|life jacket|pfd\b/i, 'lifejackets'],
  [/\bknots?\b.*\bwithin\b|\bwithin\b.*\bmetres\b/i, 'distance rules'],
  [/\bspeed\b/i, 'speed limits'],
  [/\bpwc|personal watercraft|jet ?ski\b/i, 'pwc'],
  [/\bsail/i, 'sailing vessels'],
  [/\bnight|sunset|sunrise|dark\b/i, 'night'],
  [/\banchor/i, 'anchoring'],
  [/\bcapsize|overboard|hypothermia|first aid|drsabcd|emergency\b/i, 'emergencies'],
  [/\bvhf|radio|channel 16|mayday|pan pan\b/i, 'marine radio'],
  [/\bflare|smoke signal|v sheet\b/i, 'flares'],
  [/\bepirb|beacon.*406|plb\b/i, 'epirb'],
  [/\bweather|forecast|wind|warning\b/i, 'weather'],
  [/\btide|high water|low water|chart datum\b/i, 'tides'],
  [/\bbar crossing|coastal bar\b/i, 'bar crossings'],
  [/\bfuel|refuel|petrol\b/i, 'fuel'],
  [/\balcohol|0\.05|drink|drug\b/i, 'alcohol'],
  [/\blicence|licensed|rmdl|pwcl\b/i, 'licensing'],
  [/\bregist/i, 'registration'],
  [/\bchild|children|under 12\b/i, 'children'],
  [/\bski|towing|tow rope|tube\b/i, 'towing and skiing'],
  [/\bchannel(?! 16)|fairway\b/i, 'channels'],
  [/\bship\b/i, 'ships'],
];

export function deriveTags(question: Question): Tag[] {
  const tags = new Set<Tag>(TOPIC_TAGS[question.topicId] ?? []);
  const haystack = `${question.question} ${question.scene.title}`;
  for (const [pattern, tag] of KEYWORD_TAGS) {
    if (pattern.test(haystack)) tags.add(tag);
  }
  if (tags.size === 0) tags.add('general knowledge');
  return [...tags];
}
