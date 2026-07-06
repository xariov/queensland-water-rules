/**
 * Structural validation for scenes: catches authoring mistakes before a
 * scene ships in the question bank. Returns human-readable problems; an
 * empty array means the scene is structurally sound.
 */

import type {
  ChannelLayout, Layout, OpenWaterLayout, Scene, Vessel, WaterFeature,
} from './model.ts';

const MARK_TYPES = new Set([
  'lateralPort', 'lateralStarboard', 'cardinalNorth', 'cardinalEast',
  'cardinalSouth', 'cardinalWest', 'isolatedDanger', 'safeWater', 'special',
]);

const CARD_ICONS = new Set([
  'lifejacket', 'epirb', 'flare', 'vSheet', 'fireExtinguisher', 'anchor',
  'radio', 'fuel', 'firstAid', 'torch', 'chart', 'divingFlag', 'skiFlag',
  'checklist', 'weather', 'bar', 'licence', 'registration', 'alcohol',
  'pwc', 'killSwitch', 'lifebuoy', 'mayday', 'signalMirror',
]);

const VESSEL_KINDS = new Set([
  'powerboat', 'sailboat', 'pwc', 'ship', 'fishingVessel', 'paddlecraft',
]);

interface Frame {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function frameOf(layout: OpenWaterLayout | ChannelLayout): Frame {
  if (layout.kind === 'openWater') {
    return {
      minX: -layout.width / 2, maxX: layout.width / 2,
      minY: -layout.height / 2, maxY: layout.height / 2,
    };
  }
  const banks = layout.banks ?? 'both';
  const halfChannel = layout.channelWidth / 2;
  const margin = 8 + 14;
  return {
    minX: -halfChannel - (banks === 'both' || banks === 'west' ? margin : 16),
    maxX: halfChannel + (banks === 'both' || banks === 'east' ? margin : 16),
    minY: -layout.length / 2, maxY: layout.length / 2,
  };
}

function inFrame(frame: Frame, x: number, y: number): boolean {
  return x >= frame.minX && x <= frame.maxX && y >= frame.minY && y <= frame.maxY;
}

function checkFeatures(
  layout: OpenWaterLayout | ChannelLayout,
  vessels: Vessel[],
  problems: string[],
): void {
  const frame = frameOf(layout);
  const seen = new Set<string>();
  const features = layout.features ?? [];
  for (const feature of features) {
    if (!feature.id) problems.push(`feature of kind '${feature.kind}' is missing an id`);
    if (seen.has(feature.id)) problems.push(`duplicate feature id '${feature.id}'`);
    seen.add(feature.id);
    switch (feature.kind) {
      case 'mark':
        if (!MARK_TYPES.has(feature.markType)) {
          problems.push(`mark '${feature.id}' has unknown markType '${feature.markType}'`);
        }
        if (feature.structure === 'pile'
          && feature.markType !== 'lateralPort' && feature.markType !== 'lateralStarboard') {
          problems.push(`mark '${feature.id}': pile structure is only drawn for lateral marks`);
        }
        if (!inFrame(frame, feature.x, feature.y)) {
          problems.push(`mark '${feature.id}' sits outside the water frame`);
        }
        break;
      case 'shallows':
        if (feature.radius <= 0) problems.push(`shallows '${feature.id}' needs a positive radius`);
        if (!inFrame(frame, feature.x, feature.y)) {
          problems.push(`shallows '${feature.id}' sits outside the water frame`);
        }
        break;
      case 'swimArea':
        if (feature.width <= 0 || feature.height <= 0) {
          problems.push(`swimArea '${feature.id}' needs positive width and height`);
        }
        if (!inFrame(frame, feature.x, feature.y)) {
          problems.push(`swimArea '${feature.id}' sits outside the water frame`);
        }
        break;
      case 'jetty':
        if (feature.length <= 0) problems.push(`jetty '${feature.id}' needs a positive length`);
        if (layout.kind === 'channel' && feature.side !== 'west' && feature.side !== 'east') {
          problems.push(`jetty '${feature.id}': channels only support west or east jetties`);
        }
        if (layout.kind === 'openWater' && !(layout.shores ?? []).some((shore) => shore.side === feature.side)) {
          problems.push(`jetty '${feature.id}' extends from side '${feature.side}' which has no shore`);
        }
        break;
      case 'boatRamp':
        if (layout.kind === 'channel' && feature.side !== 'west' && feature.side !== 'east') {
          problems.push(`boatRamp '${feature.id}': channels only support west or east ramps`);
        }
        if (layout.kind === 'openWater' && !(layout.shores ?? []).some((shore) => shore.side === feature.side)) {
          problems.push(`boatRamp '${feature.id}' sits on side '${feature.side}' which has no shore`);
        }
        break;
      case 'distanceRing': {
        if (feature.radius <= 0) problems.push(`distanceRing '${feature.id}' needs a positive radius`);
        if (!feature.label) problems.push(`distanceRing '${feature.id}' needs a label`);
        if (typeof feature.around === 'string') {
          const vessel = vessels.some((candidate) => candidate.id === feature.around);
          const target = features.some((candidate) =>
            candidate.kind !== 'distanceRing' && candidate.id === feature.around
            && 'x' in candidate && 'y' in candidate);
          if (!vessel && !target) {
            problems.push(`distanceRing '${feature.id}' circles unknown id '${feature.around}'`);
          }
        }
        break;
      }
    }
  }
}

function checkShores(layout: OpenWaterLayout, problems: string[]): void {
  const seen = new Set<string>();
  for (const shore of layout.shores ?? []) {
    if (seen.has(shore.side)) problems.push(`duplicate shore on side '${shore.side}'`);
    seen.add(shore.side);
    const limit = shore.side === 'north' || shore.side === 'south'
      ? layout.height / 2
      : layout.width / 2;
    if (shore.depth <= 0 || shore.depth >= limit) {
      problems.push(`shore on '${shore.side}' has depth ${shore.depth}, expected between 0 and ${limit}`);
    }
  }
}

function checkVessels(scene: Scene, layout: Layout, problems: string[]): void {
  const ids = new Set<string>();
  for (const vessel of scene.vessels) {
    const label = `vessel '${vessel.id}'`;
    if (!/^[A-Z]$/.test(vessel.id)) {
      problems.push(`${label}: ids are single capital letters`);
    }
    if (ids.has(vessel.id)) problems.push(`duplicate vessel id '${vessel.id}'`);
    ids.add(vessel.id);
    if (vessel.vesselKind !== undefined && !VESSEL_KINDS.has(vessel.vesselKind)) {
      problems.push(`${label} has unknown kind '${vessel.vesselKind}'`);
    }
    if (!Number.isFinite(vessel.heading) || vessel.heading < 0 || vessel.heading >= 360) {
      problems.push(`${label} heading ${vessel.heading} is outside [0, 360)`);
    }
    if (vessel.sails !== undefined && vessel.vesselKind !== 'sailboat') {
      problems.push(`${label} declares sails but is not a sailboat`);
    }
    if (vessel.trawling && vessel.vesselKind !== 'fishingVessel') {
      problems.push(`${label} declares trawling but is not a fishingVessel`);
    }
    if (vessel.towing && (vessel.vesselKind === 'paddlecraft' || vessel.vesselKind === 'ship'
      || vessel.vesselKind === 'sailboat')) {
      problems.push(`${label} of kind '${vessel.vesselKind}' cannot tow a skier or tube`);
    }
    if ((vessel.anchored || vessel.moored) && vessel.movement) {
      problems.push(`${label} is anchored or moored and cannot also move`);
    }
    if (vessel.anchored && vessel.moored) {
      problems.push(`${label} cannot be both anchored and moored`);
    }
    if (vessel.movement?.kind === 'asternOf') {
      const target = vessel.movement.vessel;
      if (target === vessel.id) problems.push(`${label} cannot pass astern of itself`);
      else if (!scene.vessels.some((candidate) => candidate.id === target)) {
        problems.push(`${label} passes astern of unknown vessel '${target}'`);
      }
    }
    if (layout.kind === 'openWater' || layout.kind === 'channel') {
      const frame = frameOf(layout);
      if (!inFrame(frame, vessel.x, vessel.y)) {
        problems.push(`${label} sits outside the water frame`);
      }
    }
  }
}

export function validateScene(scene: Scene): string[] {
  const problems: string[] = [];
  if (!scene.id) problems.push('scene is missing an id');
  if (!scene.title) problems.push('scene is missing a title');
  const layout = scene.layout;

  switch (layout.kind) {
    case 'openWater':
      if (layout.width < 30 || layout.width > 400) {
        problems.push(`openWater width ${layout.width} is outside [30, 400]`);
      }
      if (layout.height < 30 || layout.height > 400) {
        problems.push(`openWater height ${layout.height} is outside [30, 400]`);
      }
      checkShores(layout, problems);
      checkFeatures(layout, scene.vessels, problems);
      break;
    case 'channel':
      if (layout.length < 40 || layout.length > 400) {
        problems.push(`channel length ${layout.length} is outside [40, 400]`);
      }
      if (layout.channelWidth < 10 || layout.channelWidth > 120) {
        problems.push(`channel width ${layout.channelWidth} is outside [10, 120]`);
      }
      checkFeatures(layout, scene.vessels, problems);
      break;
    case 'lightsView':
      if (layout.lights.length === 0) problems.push('lightsView needs at least one light');
      for (const light of layout.lights) {
        if (light.x < 0 || light.x > 100 || light.y < 0 || light.y > 60) {
          problems.push(`light at (${light.x}, ${light.y}) is outside the 100 x 60 panel`);
        }
      }
      if (scene.vessels.length > 0) problems.push('lightsView scenes must not declare vessels');
      if ((scene.swimmers ?? []).length > 0) problems.push('lightsView scenes must not declare swimmers');
      break;
    case 'card':
      if (!CARD_ICONS.has(layout.icon)) problems.push(`card has unknown icon '${layout.icon}'`);
      if (layout.label !== undefined && layout.label.length > 44) {
        problems.push('card label is longer than 44 characters');
      }
      if (scene.night) problems.push('card scenes do not support night');
      if (scene.vessels.length > 0) problems.push('card scenes must not declare vessels');
      if ((scene.swimmers ?? []).length > 0) problems.push('card scenes must not declare swimmers');
      break;
  }

  checkVessels(scene, layout, problems);

  if (layout.kind === 'openWater' || layout.kind === 'channel') {
    const frame = frameOf(layout);
    for (const swimmer of scene.swimmers ?? []) {
      if (!inFrame(frame, swimmer.x, swimmer.y)) {
        problems.push(`swimmer at (${swimmer.x}, ${swimmer.y}) is outside the water frame`);
      }
    }
  }

  return problems;
}

export type { WaterFeature };
