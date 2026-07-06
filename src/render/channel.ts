/**
 * Channel layout: a marked fairway running south to north between banks.
 * The navigable channel is drawn in deeper water color; lateral marks and
 * other features are placed by the scene author in frame coordinates.
 */

import type { ChannelLayout, Vessel } from '../scene/model.ts';
import type { LayoutRender } from './context.ts';
import { element } from './svg.ts';
import { formatNumber as fmt, vec, type Vec } from './geometry.ts';
import { COLORS } from './style.ts';
import {
  renderBoatRamp, renderJetty, renderMark, renderShallows, renderSwimArea,
} from './features.ts';
import { animationHold, movementPath, vesselPose } from './motion.ts';

/** Land band drawn outside each bank, meters. */
const BANK_DEPTH = 14;
/** Shallow fringe between the channel edge and the bank, meters. */
const FRINGE = 8;

export function renderChannel(layout: ChannelLayout, vessels: Vessel[]): LayoutRender {
  const banks = layout.banks ?? 'both';
  const halfChannel = layout.channelWidth / 2;
  const westLand = banks === 'both' || banks === 'west';
  const eastLand = banks === 'both' || banks === 'east';
  const west = -halfChannel - FRINGE - (westLand ? BANK_DEPTH : FRINGE);
  const east = halfChannel + FRINGE + (eastLand ? BANK_DEPTH : FRINGE);
  const north = -layout.length / 2;
  const surface: string[] = [];
  const contentPoints: Vec[] = [];

  // Shallow margin water across the frame, then the deeper marked channel.
  surface.push(element('rect', {
    x: fmt(west), y: fmt(north), width: fmt(east - west), height: fmt(layout.length),
    fill: COLORS.water,
  }));
  surface.push(element('rect', {
    x: fmt(-halfChannel), y: fmt(north), width: fmt(layout.channelWidth), height: fmt(layout.length),
    fill: COLORS.waterDeep, 'data-element': 'channel-water',
  }));
  if (westLand) {
    surface.push(element('rect', {
      x: fmt(west), y: fmt(north), width: fmt(BANK_DEPTH), height: fmt(layout.length),
      fill: COLORS.grass, 'data-element': 'bank',
    }));
    surface.push(element('line', {
      x1: fmt(west + BANK_DEPTH), y1: fmt(north), x2: fmt(west + BANK_DEPTH), y2: fmt(north + layout.length),
      stroke: COLORS.sand, 'stroke-width': 1.2,
    }));
  }
  if (eastLand) {
    surface.push(element('rect', {
      x: fmt(east - BANK_DEPTH), y: fmt(north), width: fmt(BANK_DEPTH), height: fmt(layout.length),
      fill: COLORS.grass, 'data-element': 'bank',
    }));
    surface.push(element('line', {
      x1: fmt(east - BANK_DEPTH), y1: fmt(north), x2: fmt(east - BANK_DEPTH), y2: fmt(north + layout.length),
      stroke: COLORS.sand, 'stroke-width': 1.2,
    }));
  }

  for (const feature of layout.features ?? []) {
    switch (feature.kind) {
      case 'mark':
        surface.push(renderMark(feature, false));
        contentPoints.push(vec(feature.x, feature.y));
        break;
      case 'shallows':
        surface.push(renderShallows(feature));
        contentPoints.push(vec(feature.x - feature.radius, feature.y - feature.radius));
        contentPoints.push(vec(feature.x + feature.radius, feature.y + feature.radius));
        break;
      case 'swimArea':
        surface.push(renderSwimArea(feature));
        contentPoints.push(vec(feature.x - feature.width / 2, feature.y - feature.height / 2));
        contentPoints.push(vec(feature.x + feature.width / 2, feature.y + feature.height / 2));
        break;
      case 'jetty': {
        if (feature.side !== 'west' && feature.side !== 'east') break;
        const bankEdge = feature.side === 'west' ? west + BANK_DEPTH : east - BANK_DEPTH;
        const start = vec(bankEdge, feature.at);
        const end = vec(
          feature.side === 'west' ? bankEdge + feature.length : bankEdge - feature.length,
          feature.at,
        );
        surface.push(renderJetty(feature.id, start, end));
        contentPoints.push(start, end);
        break;
      }
      case 'boatRamp': {
        if (feature.side !== 'west' && feature.side !== 'east') break;
        const bankEdge = feature.side === 'west' ? west + BANK_DEPTH : east - BANK_DEPTH;
        surface.push(renderBoatRamp(
          feature.id,
          vec(bankEdge, feature.at),
          feature.side === 'west' ? -90 : 90,
        ));
        contentPoints.push(vec(bankEdge, feature.at));
        break;
      }
      case 'distanceRing':
        break;
    }
  }

  const defaultRun = layout.length * 0.32;
  return {
    viewBox: { minX: west, minY: north, width: east - west, height: layout.length },
    contentPoints,
    spanX: [-halfChannel - FRINGE, halfChannel + FRINGE],
    surface,
    vesselPose,
    movementPath: (vessel) => movementPath(vessel, vessels, defaultRun),
    animationHold,
    swimmerPlacement: (swimmer) => ({ position: vec(swimmer.x, swimmer.y) }),
  };
}
