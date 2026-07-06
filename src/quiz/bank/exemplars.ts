/**
 * Hand-authored exemplar questions. These set the authoring pattern the
 * generation pipeline follows: correct answer stored first (the app
 * shuffles display order), plain factual explanations, and citations to
 * the actual rule. Facts follow docs/rule-corrections.md where the
 * workbook is outdated.
 */

import type { Question } from '../model.ts';
import {
  colregsCitation, msqBuoyage, msqLifejackets, msqPwc, msqSpeedLimits,
  tomsrCitation,
} from '../citations.ts';
import { cardScene, channelScene, lightsScene, openWaterScene } from './scenes.ts';

export const exemplarQuestions: Question[] = [
  {
    id: 'gwp-crossing-starboard',
    topicId: 'give-way-power',
    question: 'Powerboats A and B are crossing as shown. B is approaching from A’s starboard side. Who must give way?',
    options: [
      'A must give way, and should pass astern of B.',
      'B must give way, because A is the larger vessel.',
      'Both must stop until the other passes.',
      'Whoever is travelling faster must give way.',
    ],
    correctIndex: 0,
    explanation: 'When two power-driven vessels cross, the vessel that has the other on its starboard side must keep out of the way, and should avoid crossing ahead of the other vessel. Passing astern makes your intention obvious.',
    citations: [colregsCitation('15', 'crossing situation'), colregsCitation('16', 'action by give-way vessel')],
    scene: openWaterScene('gwp-crossing-starboard', 'Crossing: B approaches from A’s starboard side', [
      { id: 'A', x: -32, y: 8, heading: 90, movement: { kind: 'asternOf', vessel: 'B' } },
      { id: 'B', x: 18, y: 38, heading: 0, movement: { kind: 'straight', distance: 55 } },
    ]),
  },
  {
    id: 'gwp-head-on',
    topicId: 'give-way-power',
    question: 'Two powerboats meet head on. What should each skipper do?',
    options: [
      'Alter course to starboard so they pass port side to port side.',
      'Alter course to port so they pass starboard to starboard.',
      'The smaller boat must stop and let the larger one pass.',
      'Both should hold course and speed exactly.',
    ],
    correctIndex: 0,
    explanation: 'In a head-on meeting between power-driven vessels, each alters course to starboard and passes down the other’s port side, the same way road traffic keeps left in Australia is reversed on the water.',
    citations: [colregsCitation('14', 'head-on situation')],
    scene: openWaterScene('gwp-head-on', 'Head-on meeting between two powerboats', [
      { id: 'A', x: 0, y: 38, heading: 5, movement: { kind: 'turnTo', heading: 40 } },
      { id: 'B', x: 6, y: -38, heading: 185, movement: { kind: 'turnTo', heading: 220 } },
    ]),
  },
  {
    id: 'gws-sail-meets-power',
    topicId: 'give-way-sail',
    question: 'Powerboat B is crossing paths with sailing vessel A, which is under sail alone. Who gives way?',
    options: [
      'B gives way: a power-driven vessel keeps out of the way of a sailing vessel.',
      'A gives way: sail always gives way to power.',
      'Neither: the vessel on the right has right of way regardless of type.',
      'A gives way only if B sounds one short blast.',
    ],
    correctIndex: 0,
    explanation: 'A power-driven vessel underway must keep out of the way of a sailing vessel, unless the sailing vessel is overtaking. If the sailboat were motoring, with or without sails up, it would count as power-driven and normal power rules would apply.',
    citations: [colregsCitation('18', 'responsibilities between vessels')],
    scene: openWaterScene('gws-sail-meets-power', 'Sailing vessel under sail crossing a powerboat', [
      { id: 'A', vesselKind: 'sailboat', x: -28, y: -14, heading: 135, movement: { kind: 'straight', distance: 42 } },
      { id: 'B', x: 24, y: 30, heading: 315, movement: { kind: 'asternOf', vessel: 'A' } },
    ]),
  },
  {
    id: 'ct-keep-starboard',
    topicId: 'channels-traffic',
    question: 'You are heading up a marked channel. Where should you position your boat?',
    options: [
      'As near as safe and practicable to the starboard (right hand) edge of the channel.',
      'In the middle of the channel where the water is deepest.',
      'Along the port edge so oncoming traffic passes on your starboard side.',
      'Anywhere, provided you stay inside the marks.',
    ],
    correctIndex: 0,
    explanation: 'In a narrow channel or fairway you keep as near to the outer limit on your starboard side as is safe and practicable, leaving room for oncoming vessels to do the same.',
    citations: [colregsCitation('9', 'narrow channels'), msqBuoyage],
    scene: channelScene('ct-keep-starboard', 'Travelling up a marked channel', [
      { id: 'A', x: 11, y: 30, heading: 0, movement: { kind: 'straight', distance: 62 } },
      { id: 'B', x: -11, y: -35, heading: 180, movement: { kind: 'straight', distance: 62 } },
    ]),
  },
  {
    id: 'lm-returning-port',
    topicId: 'lateral-marks',
    question: 'You are returning from seaward, travelling upstream. On which side should you keep the red can shaped marks?',
    options: [
      'On your port (left) side.',
      'On your starboard (right) side.',
      'Either side, as long as you stay between them.',
      'Directly ahead until you reach each one, then pass close alongside.',
    ],
    correctIndex: 0,
    explanation: 'Australia uses IALA region A buoyage. Travelling upstream, returning from seaward, port marks (red, can shaped) stay on your port side and starboard marks (green, conical) stay on your starboard side. Heading downstream, the sides swap.',
    citations: [msqBuoyage],
    scene: channelScene('lm-returning-port', 'Lateral marks in a channel, travelling upstream', [
      { id: 'A', x: 9, y: 42, heading: 0, movement: { kind: 'straight', distance: 70 } },
    ]),
  },
  {
    id: 'cm-north-mark',
    topicId: 'cardinal-marks',
    question: 'You see a mark with two black cones both pointing up, on a black over yellow pillar. Where is the safe water?',
    options: [
      'To the north of the mark.',
      'To the south of the mark.',
      'Directly at the mark.',
      'To the west of the mark.',
    ],
    correctIndex: 0,
    explanation: 'That is a north cardinal mark: both topmark cones point up, and the body is black above yellow. Cardinal marks are named for the side you pass them on, so safe water lies to the north and the danger sits south of the mark.',
    citations: [msqBuoyage],
    scene: openWaterScene('cm-north-mark', 'North cardinal mark clear of a shoal', [
      { id: 'A', x: -42, y: -34, heading: 120, holding: true, movement: { kind: 'straight', distance: 55 } },
    ], {
      width: 150,
      height: 130,
      animate: false,
      features: [
        { kind: 'shallows', id: 'shoal', x: 12, y: 24, radius: 15 },
        { kind: 'mark', id: 'north-mark', markType: 'cardinalNorth', x: 12, y: -6 },
      ],
    }),
  },
  {
    id: 'sd-six-knots',
    topicId: 'speed-distance',
    question: 'In a boat (not a PWC), what is the maximum speed within 30 metres of a person in the water?',
    options: [
      '6 knots.',
      '10 knots.',
      '4 knots.',
      'There is no fixed limit, only a duty to travel at a safe speed.',
    ],
    correctIndex: 0,
    explanation: 'Boats must not exceed 6 knots within 30 metres of a person in the water, or of a ship at anchor, moored, made fast to the shore or aground, or of a jetty, wharf, boat ramp or pontoon. The limit applies statewide whether or not a sign is posted.',
    citations: [tomsrCitation('81', 'speed near people and structures'), msqSpeedLimits],
    scene: openWaterScene('sd-six-knots', 'Powerboat near a swimmer with a 30 metre ring', [
      { id: 'A', x: -18, y: -6, heading: 115, movement: { kind: 'straight', distance: 34 } },
    ], {
      width: 140,
      height: 110,
      features: [
        { kind: 'distanceRing', id: 'ring-30', around: { x: 22, y: 18 }, radius: 30, label: '30 m' },
      ],
      swimmers: [{ x: 22, y: 18 }],
    }),
  },
  {
    id: 'pwc-sixty-metres',
    topicId: 'pwc',
    question: 'On a PWC, what is the maximum speed within 60 metres of a person in the water?',
    options: [
      '6 knots.',
      '10 knots.',
      '15 knots, if you keep a good lookout.',
      'The same as any boat: 6 knots within 30 metres.',
    ],
    correctIndex: 0,
    explanation: 'PWC distance rules are stricter than boat rules: 6 knots within 60 metres of people in the water, anchored or moored ships, jetties, ramps, pontoons, the boundary of a bathing reserve, and the shore. A separate rule caps PWCs at 10 knots within 30 metres of another moving ship.',
    citations: [tomsrCitation('82', 'operating personal watercraft'), msqPwc],
    scene: openWaterScene('pwc-sixty-metres', 'PWC near a swimmer with a 60 metre ring', [
      { id: 'A', vesselKind: 'pwc', x: -36, y: -20, heading: 130, movement: { kind: 'straight', distance: 36 } },
    ], {
      width: 170,
      height: 150,
      features: [
        { kind: 'distanceRing', id: 'ring-60', around: { x: 26, y: 24 }, radius: 60, label: '60 m' },
      ],
      swimmers: [{ x: 26, y: 24 }],
    }),
  },
  {
    id: 'lw-night-open-boat',
    topicId: 'lifejacket-wearing',
    question: 'You are underway at night in a 4.2 metre open dinghy with two adult friends. Who must wear a lifejacket?',
    options: [
      'Everyone on board aged 1 year or older.',
      'Only the skipper.',
      'Nobody, provided lifejackets are stowed within reach.',
      'Only anyone who cannot swim.',
    ],
    correctIndex: 0,
    explanation: 'Since 1 December 2024, everyone aged 1 year or older on an open boat under 4.8 metres underway between sunset and sunrise must wear a lifejacket. Carrying them within reach stopped being enough for these situations.',
    citations: [tomsrCitation('24', 'wearing lifejackets'), msqLifejackets],
    scene: openWaterScene('lw-night-open-boat', 'Small open boat underway at night', [
      { id: 'A', x: -10, y: 6, heading: 55, movement: { kind: 'straight', distance: 40 } },
      { id: 'B', x: 30, y: -25, heading: 0, anchored: true },
    ], { night: true }),
  },
  {
    id: 'lw-boating-alone',
    topicId: 'lifejacket-wearing',
    question: 'You head out fishing alone in daylight in a 4.5 metre open tinnie. What does the lifejacket law require?',
    options: [
      'You must wear a lifejacket while the boat is underway.',
      'Nothing beyond carrying a lifejacket on board.',
      'You must wear one only if you cross a coastal bar.',
      'You must wear one only after sunset.',
    ],
    correctIndex: 0,
    explanation: 'Since 1 December 2024, a person boating alone (or only with children under 12) on an open boat under 4.8 metres must wear a lifejacket while underway, even in daylight. Drifting still counts as underway.',
    citations: [tomsrCitation('24', 'wearing lifejackets'), msqLifejackets],
    scene: cardScene('lw-boating-alone', 'Lifejacket wear rules when boating alone', 'lifejacket', 'Boating alone in an open boat'),
  },
  {
    id: 'lt-level-pwc',
    topicId: 'lifejacket-types',
    question: 'Which lifejacket is correct for riding a PWC beyond smooth waters?',
    options: [
      'A level 50 lifejacket.',
      'A level 100 lifejacket.',
      'A level 150 lifejacket.',
      'Any AS 4758 lifejacket, including level 275.',
    ],
    correctIndex: 0,
    explanation: 'PWC riders wear level 50 (or 50S in smooth waters only). Higher level jackets with collars are unsuitable for PWC riding and level 100 jackets must not be used on a PWC.',
    citations: [tomsrCitation('22', 'lifejackets to be carried'), msqPwc],
    scene: cardScene('lt-level-pwc', 'PWC lifejacket level', 'pwc', 'Lifejackets for PWC riding'),
  },
  {
    id: 'se-epirb-when',
    topicId: 'signalling-equipment',
    question: 'When must a recreational boat carry a registered 406 MHz EPIRB?',
    options: [
      'When operating beyond smooth waters, or more than 2 nautical miles from land.',
      'Only when crossing a designated coastal bar.',
      'On every trip, in all waters.',
      'Only when operating at night.',
    ],
    correctIndex: 0,
    explanation: 'An EPIRB is required beyond smooth waters, beyond partially smooth waters, and any time you are more than 2 nautical miles from land. It must be a 406 MHz beacon registered with AMSA, and the registration renews every two years.',
    citations: [tomsrCitation('9', 'EPIRBs'), tomsrCitation('10', 'EPIRB registration')],
    scene: cardScene('se-epirb-when', 'When an EPIRB is required', 'epirb'),
  },
  {
    id: 'nl-power-lights',
    topicId: 'nav-lights',
    question: 'At night you see a white light above a red and a green light, all ahead of you. What are you looking at?',
    options: [
      'A power-driven vessel coming toward you head on.',
      'A sailing vessel crossing from your port side.',
      'A vessel at anchor.',
      'A vessel towing another vessel.',
    ],
    correctIndex: 0,
    explanation: 'Both sidelights visible together means the vessel is pointing at you; the white masthead light above them tells you it is power-driven. Prepare for a head-on meeting and alter course to starboard.',
    citations: [colregsCitation('23', 'power-driven vessels underway'), colregsCitation('14', 'head-on situation')],
    // Facing an approaching vessel, its port (red) light is on the
    // viewer's right and its starboard (green) light on the viewer's left.
    scene: lightsScene('nl-power-lights', 'Masthead light over both sidelights, dead ahead', [
      { color: 'white', x: 50, y: 22, size: 'small' },
      { color: 'green', x: 44, y: 31 },
      { color: 'red', x: 56, y: 31 },
    ]),
  },
  {
    id: 'nl-anchored',
    topicId: 'nav-lights',
    question: 'A vessel under 50 metres is anchored at night. What light must it show?',
    options: [
      'One all-round white light where it can best be seen.',
      'Red and green sidelights only.',
      'A flashing yellow light.',
      'No light, if it is inside a marina channel.',
    ],
    correctIndex: 0,
    explanation: 'An anchored vessel under 50 metres shows a single all-round white light. Underway lights (sidelights and stern light) are only for vessels underway; a drifting boat is still underway and keeps them on.',
    citations: [colregsCitation('30', 'anchored vessels and vessels aground')],
    scene: lightsScene('nl-anchored', 'A single all-round white light at night', [
      { color: 'white', x: 50, y: 26 },
    ]),
  },
  {
    id: 'ss-five-blasts',
    topicId: 'shapes-sounds',
    question: 'A ship close by sounds five short blasts at you. What does it mean?',
    options: [
      'It doubts your intentions or does not understand what you are doing.',
      'It is altering course to starboard.',
      'It intends to overtake you on your port side.',
      'It is wishing you a good trip.',
    ],
    correctIndex: 0,
    explanation: 'Five or more short rapid blasts is the wake-up signal: the other vessel doubts you are taking enough action to avoid a collision. Reassess immediately and keep well clear. One short blast means altering to starboard, two means altering to port.',
    citations: [colregsCitation('34', 'maneuvering and warning signals')],
    scene: channelScene('ss-five-blasts', 'Small boat crossing ahead of a ship in a channel', [
      { id: 'A', vesselKind: 'ship', x: 0, y: 40, heading: 0, movement: { kind: 'straight', distance: 62 } },
      { id: 'B', x: -22, y: -12, heading: 90, holding: true, movement: { kind: 'straight', distance: 40 } },
    ], { channelWidth: 56, animate: false }),
  },
  {
    id: 'anc-scope',
    topicId: 'anchoring',
    question: 'In good conditions, how much anchor line should you let out relative to the water depth?',
    options: [
      'At least 3 to 5 times the depth.',
      'Exactly the depth, so the boat stays directly above the anchor.',
      'Twice the depth, at most.',
      'Ten times the depth in all conditions.',
    ],
    correctIndex: 0,
    explanation: 'Scope gives the anchor a horizontal pull so it digs in. A ratio of at least 3:1 in calm conditions, and 5:1 or more as wind and sea build, is standard practice; short scope pulls the anchor out.',
    citations: [tomsrCitation('13', 'equipment for boats'), msqCitationFallback()],
    scene: openWaterScene('anc-scope', 'Anchored boat with scope laid out', [
      { id: 'A', x: 8, y: 10, heading: 30, anchored: true },
    ], { animate: false, width: 110, height: 95 }),
  },
  {
    id: 'em-capsize-stay',
    topicId: 'emergencies',
    question: 'Your boat capsizes offshore and stays afloat upside down. What should you do?',
    options: [
      'Stay with the boat and get as much of your body out of the water as possible.',
      'Swim for shore immediately while you still have energy.',
      'Dive under the hull to retrieve equipment first.',
      'Tread water beside the boat to stay warm.',
    ],
    correctIndex: 0,
    explanation: 'A capsized hull is easier for rescuers to spot than a swimmer and keeps you out of the water, slowing hypothermia. Swimming for shore is usually farther than it looks and costs heat and energy.',
    citations: [msqSafetyEquipmentRef()],
    scene: cardScene('em-capsize-stay', 'Capsize response', 'lifebuoy', 'After a capsize'),
  },
  {
    id: 'ds-mayday',
    topicId: 'distress',
    question: 'Your boat is taking on water fast and you fear for your lives. What is the correct radio call on VHF?',
    options: [
      'Mayday, mayday, mayday on channel 16.',
      'Pan pan, pan pan, pan pan on channel 16.',
      'Securite, securite, securite on channel 67.',
      'Any call on channel 88, which is monitored by rescue groups.',
    ],
    correctIndex: 0,
    explanation: 'Mayday is the distress call for grave and imminent danger to a vessel or life, made on VHF channel 16. Pan pan is for urgency without immediate danger; securite prefixes safety messages like weather warnings.',
    citations: [colregsCitation('Annex IV', 'distress signals')],
    scene: cardScene('ds-mayday', 'The distress call', 'radio', 'Calling for help'),
  },
  {
    id: 'lic-threshold',
    topicId: 'licences',
    question: 'From what engine power does a recreational boat driver need a marine licence in Queensland?',
    options: [
      'Over 4.5 kilowatts (about 6 horsepower).',
      'Over 3 kilowatts (about 4 horsepower).',
      'Any motorised vessel at all.',
      'Only boats capable of more than 10 knots.',
    ],
    correctIndex: 0,
    explanation: 'A recreational marine driver licence is required to operate a recreational boat with an engine over 4.5 kW. Registration has a different threshold: 3 kW. So some boats must be registered even though no licence is needed to drive them.',
    citations: [tomsrCitation('55', 'when a licence is required'), tomsrCitation('26', 'registration')],
    scene: cardScene('lic-threshold', 'Licence threshold', 'licence'),
  },
  {
    id: 'reg-threshold',
    topicId: 'registration',
    question: 'Which of these vessels must be registered in Queensland?',
    options: [
      'A dinghy with a 3.5 kilowatt outboard.',
      'A kayak with no motor.',
      'A sailing dinghy with no auxiliary engine.',
      'A tender running within 2 nautical miles of its registered mother ship.',
    ],
    correctIndex: 0,
    explanation: 'Registration applies from 3 kW of propulsion power. Unpowered craft are exempt, and so is a tender operating within 2 nautical miles of its registered parent ship.',
    citations: [tomsrCitation('26', 'which ships must be registered')],
    scene: cardScene('reg-threshold', 'Registration threshold', 'registration'),
  },
];

/**
 * Placeholder-free helpers for citations used once. Kept as functions so
 * the exemplar list reads uniformly.
 */
function msqCitationFallback(): { reference: string; url: string } {
  return {
    reference: 'Maritime Safety Queensland: anchoring guidance',
    url: 'https://www.msq.qld.gov.au/safety',
  };
}

function msqSafetyEquipmentRef(): { reference: string; url: string } {
  return {
    reference: 'Maritime Safety Queensland: preparing for emergencies',
    url: 'https://www.msq.qld.gov.au/safety',
  };
}
