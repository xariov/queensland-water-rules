/**
 * The topic taxonomy: what the Queensland recreational marine licence
 * knowledge test covers, grouped into subject areas. Source references
 * point at the Transport Operations (Marine Safety) Regulation 2016
 * (TOMSR), the International Regulations for Preventing Collisions at
 * Sea (COLREGS), and MSQ guidance.
 */

import type { Topic } from './model.ts';

const licensingTopics: Topic[] = [
  {
    id: 'licences',
    title: 'Getting and keeping a licence',
    area: 'Licences and registration',
    summary: 'Who needs an RMDL or PWCL, minimum ages, competency statements, supervision and penalties.',
    sourceRefs: ['TOMSR s55', 'TOMSR s57', 'TOMSR s62', 'TOMSR s63'],
  },
  {
    id: 'registration',
    title: 'Registration and identification',
    area: 'Licences and registration',
    summary: 'Which ships must be registered, registration symbols, tenders and transfers.',
    sourceRefs: ['TOMSR s26'],
  },
];

const safeOperationTopics: Topic[] = [
  {
    id: 'speed-distance',
    title: 'Speed and distance rules',
    area: 'Safe operation',
    summary: 'The six knot rules near people, ships and structures, wash responsibility and safe speed.',
    sourceRefs: ['TOMSR s81', 'COLREGS rule 6'],
  },
  {
    id: 'alcohol',
    title: 'Alcohol and drugs',
    area: 'Safe operation',
    summary: 'Blood alcohol limits afloat, who they apply to, and when you are in control.',
    sourceRefs: ['TORUM Act s79'],
  },
  {
    id: 'incidents',
    title: 'Marine incidents and duties',
    area: 'Safe operation',
    summary: 'What counts as a marine incident, duties after a collision, and reporting deadlines.',
    sourceRefs: ['TOMS Act s89', 'TOMSR s58'],
  },
];

const equipmentTopics: Topic[] = [
  {
    id: 'lifejacket-types',
    title: 'Lifejacket levels and standards',
    area: 'Safety equipment',
    summary: 'AS 4758 levels 50S to 275, which levels suit which waters and craft, servicing inflatables.',
    sourceRefs: ['TOMSR s22', 'TOMSR s25'],
  },
  {
    id: 'lifejacket-wearing',
    title: 'When lifejackets must be worn',
    area: 'Safety equipment',
    summary: 'The wear rules from 1 December 2024: boating alone, at night, children, open areas and coastal bars.',
    sourceRefs: ['TOMSR s24'],
  },
  {
    id: 'signalling-equipment',
    title: 'Flares, V sheets and EPIRBs',
    area: 'Safety equipment',
    summary: 'Distress signalling equipment by water type, expiry dates, EPIRB registration and use.',
    sourceRefs: ['TOMSR s9', 'TOMSR s10', 'TOMSR s14'],
  },
  {
    id: 'fire-safety',
    title: 'Fuel and fire safety',
    area: 'Safety equipment',
    summary: 'Extinguisher types and classes, refuelling drill, gas and fume management.',
    sourceRefs: ['TOMSR s13', 'MSQ guidance'],
  },
  {
    id: 'equipment-scales',
    title: 'Equipment by water type',
    area: 'Safety equipment',
    summary: 'The minimum equipment lists for smooth, partially smooth and open waters, and for PWC.',
    sourceRefs: ['TOMSR s12', 'TOMSR s13', 'TOMSR s14', 'TOMSR s15'],
  },
];

const waterwaysTopics: Topic[] = [
  {
    id: 'water-limits',
    title: 'Smooth and partially smooth waters',
    area: 'Waterways',
    summary: 'What the water limit categories mean, where their boundaries run, and why they matter.',
    sourceRefs: ['TOMSR Sch 2', 'MSQ water limits maps'],
  },
];

const giveWayTopics: Topic[] = [
  {
    id: 'give-way-power',
    title: 'Power meets power',
    area: 'Give way',
    summary: 'Head-on, crossing and overtaking encounters between power-driven vessels.',
    sourceRefs: ['COLREGS rule 13', 'COLREGS rule 14', 'COLREGS rule 15'],
  },
  {
    id: 'give-way-sail',
    title: 'Sail, paddle and special vessels',
    area: 'Give way',
    summary: 'Sailing vessels, vessels fishing, restricted vessels and who keeps clear of whom.',
    sourceRefs: ['COLREGS rule 12', 'COLREGS rule 18'],
  },
  {
    id: 'channels-traffic',
    title: 'Channels and shipping',
    area: 'Give way',
    summary: 'Keeping starboard in channels, staying clear of big ships, and crossing traffic.',
    sourceRefs: ['COLREGS rule 9'],
  },
];

const marksTopics: Topic[] = [
  {
    id: 'lateral-marks',
    title: 'Lateral marks',
    area: 'Marks and buoys',
    summary: 'Port and starboard marks, the upstream direction, and pile beacons in IALA A.',
    sourceRefs: ['IALA A', 'MSQ beacons and buoys guidance'],
  },
  {
    id: 'cardinal-marks',
    title: 'Cardinal and other marks',
    area: 'Marks and buoys',
    summary: 'Cardinal, isolated danger, safe water and special marks: shapes, colors, topmarks and lights.',
    sourceRefs: ['IALA A'],
  },
];

const lightsTopics: Topic[] = [
  {
    id: 'nav-lights',
    title: 'Navigation lights',
    area: 'Lights, shapes and sounds',
    summary: 'Reading lights at night: sidelights, masthead, stern, all-round, anchored and towing vessels.',
    sourceRefs: ['COLREGS rules 21-25', 'COLREGS rule 30'],
  },
  {
    id: 'shapes-sounds',
    title: 'Day shapes and sound signals',
    area: 'Lights, shapes and sounds',
    summary: 'Anchor balls and other day shapes, maneuvering blasts and fog signals.',
    sourceRefs: ['COLREGS rules 27-28', 'COLREGS rules 32-35'],
  },
];

const seamanshipTopics: Topic[] = [
  {
    id: 'anchoring',
    title: 'Anchoring',
    area: 'Seamanship',
    summary: 'Anchor types, scope, setting and retrieving, fouled anchors and where not to anchor.',
    sourceRefs: ['MSQ anchoring guidance'],
  },
  {
    id: 'boat-handling',
    title: 'Boat handling and loading',
    area: 'Seamanship',
    summary: 'Loading and trim, capacity, wash, ropes and knots, and low-speed maneuvering.',
    sourceRefs: ['MSQ guidance', 'BoatSafe workbook'],
  },
];

const weatherTopics: Topic[] = [
  {
    id: 'weather',
    title: 'Weather',
    area: 'Weather and tides',
    summary: 'Forecasts, warnings, wind and sea state, and deciding not to go out.',
    sourceRefs: ['BoatSafe workbook s5'],
  },
  {
    id: 'tides-bars',
    title: 'Tides and coastal bars',
    area: 'Weather and tides',
    summary: 'Tide behavior, chart datum, and the timing and lifejacket rules for crossing coastal bars.',
    sourceRefs: ['TOMSR s24', 'BoatSafe workbook s5'],
  },
];

const planningTopics: Topic[] = [
  {
    id: 'planning',
    title: 'Trip planning and fuel',
    area: 'Planning and emergencies',
    summary: 'Voyage plans, telling someone ashore, fuel reserves and pre-departure checks.',
    sourceRefs: ['MSQ trip planning guidance'],
  },
  {
    id: 'emergencies',
    title: 'Capsize, overboard and first aid',
    area: 'Planning and emergencies',
    summary: 'Person overboard, capsize, staying with the boat, hypothermia and DRSABCD.',
    sourceRefs: ['BoatSafe workbook s6', 'DRSABCD factsheet'],
  },
  {
    id: 'distress',
    title: 'Distress signals and radio',
    area: 'Planning and emergencies',
    summary: 'Mayday and pan pan, VHF channel 16, flares, V sheets, EPIRB activation and other signals.',
    sourceRefs: ['COLREGS Annex IV', 'MSQ radio guidance'],
  },
];

const pwcTopics: Topic[] = [
  {
    id: 'pwc',
    title: 'Personal watercraft',
    area: 'PWC and towing',
    summary: 'PWC distance and speed rules, freestyling restrictions, kill switches and handling.',
    sourceRefs: ['TOMSR s82', 'TOMSR s86'],
  },
  {
    id: 'towing',
    title: 'Waterskiing and towing',
    area: 'PWC and towing',
    summary: 'Observers, tow rules, skier signals and keeping clear while towing.',
    sourceRefs: ['TOMSR s83', 'MSQ towing guidance'],
  },
];

export const topics: Topic[] = [
  ...licensingTopics,
  ...safeOperationTopics,
  ...equipmentTopics,
  ...waterwaysTopics,
  ...giveWayTopics,
  ...marksTopics,
  ...lightsTopics,
  ...seamanshipTopics,
  ...weatherTopics,
  ...planningTopics,
  ...pwcTopics,
];
