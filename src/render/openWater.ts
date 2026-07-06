/** Open-water layout: a water frame, optional shores, fixed features. */

import type { OpenWaterLayout, Shore, Vessel } from '../scene/model.ts';
import type { LayoutRender } from './context.ts';
import { element } from './svg.ts';
import { formatNumber as fmt, vec, type Vec } from './geometry.ts';
import { COLORS } from './style.ts';
import {
  renderBoatRamp, renderJetty, renderMark, renderShallows, renderSwimArea,
} from './features.ts';
import { animationHold, movementExtent, movementPath, vesselPose } from './motion.ts';

const SHORE_FILL: Record<NonNullable<Shore['kind']>, string> = {
  beach: COLORS.sand,
  rocks: COLORS.rocks,
  built: COLORS.rockWall,
};

/** The water-side edge coordinate of a shore band. */
function shoreEdge(layout: OpenWaterLayout, side: Shore['side']): number | null {
  const shore = (layout.shores ?? []).find((candidate) => candidate.side === side);
  if (!shore) return null;
  switch (side) {
    case 'north': return -layout.height / 2 + shore.depth;
    case 'south': return layout.height / 2 - shore.depth;
    case 'west': return -layout.width / 2 + shore.depth;
    case 'east': return layout.width / 2 - shore.depth;
  }
}

function renderShore(layout: OpenWaterLayout, shore: Shore): string {
  const west = -layout.width / 2;
  const north = -layout.height / 2;
  const fill = SHORE_FILL[shore.kind ?? 'beach'];
  let x = west;
  let y = north;
  let width = layout.width;
  let height = layout.height;
  let foam: { x1: number; y1: number; x2: number; y2: number };
  switch (shore.side) {
    case 'north':
      height = shore.depth;
      foam = { x1: west, y1: north + shore.depth, x2: west + layout.width, y2: north + shore.depth };
      break;
    case 'south':
      y = layout.height / 2 - shore.depth;
      height = shore.depth;
      foam = { x1: west, y1: y, x2: west + layout.width, y2: y };
      break;
    case 'west':
      width = shore.depth;
      foam = { x1: west + shore.depth, y1: north, x2: west + shore.depth, y2: north + layout.height };
      break;
    case 'east':
      x = layout.width / 2 - shore.depth;
      width = shore.depth;
      foam = { x1: x, y1: north, x2: x, y2: north + layout.height };
      break;
  }
  return element(
    'g',
    { 'data-element': 'shore', 'data-side': shore.side },
    element('rect', {
      x: fmt(x), y: fmt(y), width: fmt(width), height: fmt(height), fill,
    }),
    element('line', {
      ...Object.fromEntries(Object.entries(foam).map(([key, value]) => [key, fmt(value)])),
      stroke: '#ffffff', 'stroke-width': 0.5, opacity: 0.55,
    }),
  );
}

export function renderOpenWater(layout: OpenWaterLayout, vessels: Vessel[]): LayoutRender {
  const surface: string[] = [];
  const contentPoints: Vec[] = [];
  const west = -layout.width / 2;
  const north = -layout.height / 2;

  surface.push(element('rect', {
    x: fmt(west), y: fmt(north), width: fmt(layout.width), height: fmt(layout.height),
    fill: COLORS.water,
  }));
  for (const shore of layout.shores ?? []) {
    surface.push(renderShore(layout, shore));
  }

  for (const feature of layout.features ?? []) {
    switch (feature.kind) {
      case 'shallows':
        surface.push(renderShallows(feature));
        contentPoints.push(vec(feature.x - feature.radius, feature.y - feature.radius));
        contentPoints.push(vec(feature.x + feature.radius, feature.y + feature.radius));
        break;
      case 'mark':
        surface.push(renderMark(feature, false));
        contentPoints.push(vec(feature.x, feature.y));
        break;
      case 'swimArea':
        surface.push(renderSwimArea(feature));
        contentPoints.push(vec(feature.x - feature.width / 2, feature.y - feature.height / 2));
        contentPoints.push(vec(feature.x + feature.width / 2, feature.y + feature.height / 2));
        break;
      case 'jetty': {
        const edge = shoreEdge(layout, feature.side);
        const start = edge === null
          ? edgePoint(layout, feature.side, feature.at)
          : pointOnShoreEdge(feature.side, edge, feature.at);
        const end = jettyEnd(feature.side, start, feature.length);
        surface.push(renderJetty(feature.id, start, end));
        contentPoints.push(start, end);
        break;
      }
      case 'boatRamp': {
        const edge = shoreEdge(layout, feature.side);
        const at = edge === null
          ? edgePoint(layout, feature.side, feature.at)
          : pointOnShoreEdge(feature.side, edge, feature.at);
        surface.push(renderBoatRamp(feature.id, at, rampRotation(feature.side)));
        contentPoints.push(at);
        break;
      }
      case 'distanceRing':
        // Rings can circle vessels, so the orchestrator draws them once
        // vessel positions are known.
        break;
    }
  }

  const defaultRun = Math.min(layout.width, layout.height) * 0.38;
  return {
    viewBox: { minX: west, minY: north, width: layout.width, height: layout.height },
    contentPoints,
    surface,
    vesselPose,
    movementPath: (vessel) => movementPath(vessel, vessels, defaultRun),
    animationHold,
    swimmerPlacement: (swimmer) => ({ position: vec(swimmer.x, swimmer.y) }),
  };
}

/** Marker helpers exported for the orchestrator (which owns vessel data). */
export { movementExtent };

function pointOnShoreEdge(side: Shore['side'], edge: number, at: number): Vec {
  return side === 'north' || side === 'south' ? vec(at, edge) : vec(edge, at);
}

/** The water end of a jetty: it extends away from its shore. */
function jettyEnd(side: Shore['side'], start: Vec, length: number): Vec {
  switch (side) {
    case 'north': return vec(start.x, start.y + length);
    case 'south': return vec(start.x, start.y - length);
    case 'west': return vec(start.x + length, start.y);
    case 'east': return vec(start.x - length, start.y);
  }
}

function edgePoint(layout: OpenWaterLayout, side: Shore['side'], at: number): Vec {
  switch (side) {
    case 'north': return vec(at, -layout.height / 2);
    case 'south': return vec(at, layout.height / 2);
    case 'west': return vec(-layout.width / 2, at);
    case 'east': return vec(layout.width / 2, at);
  }
}

/** Rotation that points the ramp's water end away from its shore. */
function rampRotation(side: Shore['side']): number {
  switch (side) {
    case 'north': return 0;
    case 'south': return 180;
    case 'west': return -90;
    case 'east': return 90;
  }
}
