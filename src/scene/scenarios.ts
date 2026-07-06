/**
 * Representative spike scenes exercising every renderer feature. Used by
 * the demo gallery, the static render script, and the validation tests.
 * Not part of the question bank.
 */

import type { Scene } from './model.ts';

export const crossingGiveWay: Scene = {
  id: 'spike-crossing-give-way',
  title: 'Two powerboats crossing, give way to starboard',
  layout: { kind: 'openWater', width: 130, height: 110 },
  vessels: [
    {
      id: 'A', x: -32, y: 8, heading: 90,
      movement: { kind: 'asternOf', vessel: 'B' },
    },
    {
      id: 'B', x: 18, y: 38, heading: 0,
      movement: { kind: 'straight', distance: 55 },
    },
  ],
};

export const sailMeetsPower: Scene = {
  id: 'spike-sail-meets-power',
  title: 'Sailing vessel meets a powerboat',
  layout: { kind: 'openWater', width: 130, height: 110 },
  vessels: [
    { id: 'A', vesselKind: 'sailboat', x: -28, y: -18, heading: 135, movement: { kind: 'straight', distance: 40 } },
    { id: 'B', x: 26, y: 30, heading: 315, movement: { kind: 'turnTo', heading: 0 } },
  ],
};

export const channelLaterals: Scene = {
  id: 'spike-channel-laterals',
  title: 'Marked channel with lateral buoys and pile beacons',
  layout: {
    kind: 'channel',
    length: 150,
    channelWidth: 40,
    upstream: 'north',
    features: [
      { kind: 'mark', id: 'p1', markType: 'lateralPort', x: -20, y: 48 },
      { kind: 'mark', id: 'p2', markType: 'lateralPort', x: -20, y: -6 },
      { kind: 'mark', id: 'p3', markType: 'lateralPort', structure: 'pile', x: -20, y: -58 },
      { kind: 'mark', id: 's1', markType: 'lateralStarboard', x: 20, y: 48 },
      { kind: 'mark', id: 's2', markType: 'lateralStarboard', structure: 'pile', x: 20, y: -6 },
      { kind: 'mark', id: 's3', markType: 'lateralStarboard', x: 20, y: -58 },
      { kind: 'jetty', id: 'jetty', side: 'west', at: 30, length: 14 },
    ],
  },
  vessels: [
    { id: 'A', x: 9, y: 30, heading: 0, movement: { kind: 'straight', distance: 60 } },
    { id: 'B', vesselKind: 'ship', x: -8, y: -35, heading: 180 },
  ],
};

export const cardinalDanger: Scene = {
  id: 'spike-cardinal-danger',
  title: 'Cardinal marks around a shoal',
  animate: false,
  layout: {
    kind: 'openWater',
    width: 170,
    height: 150,
    features: [
      { kind: 'shallows', id: 'shoal', x: 0, y: 0, radius: 17 },
      { kind: 'mark', id: 'nc', markType: 'cardinalNorth', x: 0, y: -34 },
      { kind: 'mark', id: 'ec', markType: 'cardinalEast', x: 34, y: 0 },
      { kind: 'mark', id: 'sc', markType: 'cardinalSouth', x: 0, y: 34 },
      { kind: 'mark', id: 'wc', markType: 'cardinalWest', x: -34, y: 0 },
      { kind: 'mark', id: 'id', markType: 'isolatedDanger', x: 58, y: -48 },
      { kind: 'mark', id: 'sw', markType: 'safeWater', x: -58, y: 48 },
      { kind: 'mark', id: 'sp', markType: 'special', x: 58, y: 48 },
    ],
  },
  vessels: [
    { id: 'A', x: -55, y: -40, heading: 120, holding: true, movement: { kind: 'straight', distance: 60 } },
  ],
};

export const beachOperations: Scene = {
  id: 'spike-beach-operations',
  title: 'Shore, swim area, jetty, ramp and distance rings',
  layout: {
    kind: 'openWater',
    width: 170,
    height: 140,
    shores: [{ side: 'south', depth: 26, kind: 'beach' }],
    features: [
      { kind: 'swimArea', id: 'swim', x: -48, y: 36, width: 42, height: 22 },
      { kind: 'jetty', id: 'jetty', side: 'south', at: 40, length: 22 },
      { kind: 'boatRamp', id: 'ramp', side: 'south', at: 70 },
      { kind: 'distanceRing', id: 'ring30', around: 'A', radius: 30, label: '30 m' },
    ],
  },
  vessels: [
    { id: 'A', x: 8, y: -10, heading: 90, movement: { kind: 'straight', distance: 40 } },
    { id: 'B', vesselKind: 'pwc', x: -20, y: -42, heading: 65, movement: { kind: 'straight', distance: 36 } },
  ],
  swimmers: [
    { x: -48, y: 34 },
    { x: -40, y: 40 },
  ],
};

export const nightMeeting: Scene = {
  id: 'spike-night-meeting',
  title: 'Vessels at night showing navigation lights',
  night: true,
  layout: {
    kind: 'openWater',
    width: 130,
    height: 110,
    features: [
      { kind: 'mark', id: 'p1', markType: 'lateralPort', x: -40, y: -30 },
    ],
  },
  vessels: [
    { id: 'A', x: -25, y: 20, heading: 45, movement: { kind: 'straight', distance: 40 } },
    { id: 'B', vesselKind: 'sailboat', x: 30, y: -14, heading: 225, movement: { kind: 'straight', distance: 30 } },
    { id: 'C', x: 34, y: 30, heading: 0, anchored: true },
  ],
};

export const towingAndTrawling: Scene = {
  id: 'spike-towing-and-trawling',
  title: 'Ski tow, trawler at work, kayak and moored boat',
  layout: {
    kind: 'openWater',
    width: 180,
    height: 150,
    shores: [{ side: 'east', depth: 22, kind: 'rocks' }],
    features: [
      { kind: 'jetty', id: 'jetty', side: 'east', at: 40, length: 16 },
    ],
  },
  vessels: [
    { id: 'A', x: -45, y: -30, heading: 170, towing: 'skier', movement: { kind: 'turnTo', heading: 240 } },
    { id: 'B', vesselKind: 'fishingVessel', trawling: true, x: 25, y: -42, heading: 250, movement: { kind: 'straight', distance: 30 } },
    { id: 'C', vesselKind: 'paddlecraft', x: -20, y: 42, heading: 20 },
    { id: 'D', x: 58, y: 40, heading: 90, moored: true },
  ],
};

export const lightsAhead: Scene = {
  id: 'spike-lights-ahead',
  title: 'Lights seen ahead at night: power vessel head-on',
  layout: {
    kind: 'lightsView',
    silhouette: 'powerboat',
    // Mirror rule: a bow-on vessel shows its red (port) light on the
    // viewer's right and green on the viewer's left.
    lights: [
      { color: 'white', x: 50, y: 22, size: 'small' },
      { color: 'green', x: 44, y: 31 },
      { color: 'red', x: 56, y: 31 },
    ],
  },
  vessels: [],
};

export const equipmentCard: Scene = {
  id: 'spike-equipment-card',
  title: 'Safety equipment pictogram card',
  layout: {
    kind: 'card',
    icon: 'lifejacket',
    label: 'Level 100 lifejacket',
    badge: 'x4',
  },
  vessels: [],
};

export const scenarios: Scene[] = [
  crossingGiveWay,
  sailMeetsPower,
  channelLaterals,
  cardinalDanger,
  beachOperations,
  nightMeeting,
  towingAndTrawling,
  lightsAhead,
  equipmentCard,
];
