/**
 * Fixed water furniture: navigation marks, swim areas, jetties, ramps,
 * shallows and distance rings. Marks are drawn as upright pictograms at
 * their position (the same stylization road signs use in top-down road
 * scenes) so their shapes and colors read at a glance.
 */

import type { Mark, MarkType } from '../scene/model.ts';
import { element, text } from './svg.ts';
import { formatNumber as fmt } from './geometry.ts';
import { COLORS, MARKING } from './style.ts';

/** Overall pictogram height for a buoy, meters (scene units). */
export const MARK_HEIGHT = 5;

const MARK_LIGHT: Record<MarkType, string> = {
  lateralPort: COLORS.lightRed,
  lateralStarboard: COLORS.lightGreen,
  cardinalNorth: COLORS.lightWhite,
  cardinalEast: COLORS.lightWhite,
  cardinalSouth: COLORS.lightWhite,
  cardinalWest: COLORS.lightWhite,
  isolatedDanger: COLORS.lightWhite,
  safeWater: COLORS.lightWhite,
  special: COLORS.lightYellow,
};

/** A black cone topmark; direction 'up' points north/up the screen. */
function cone(cx: number, cy: number, direction: 'up' | 'down', size = 0.62): string {
  const tip = direction === 'up' ? cy - size : cy + size;
  const base = direction === 'up' ? cy + size * 0.55 : cy - size * 0.55;
  return element('polygon', {
    points: `${fmt(cx)},${fmt(tip)} ${fmt(cx - size * 0.7)},${fmt(base)} ${fmt(cx + size * 0.7)},${fmt(base)}`,
    fill: COLORS.markBlack,
  });
}

/** Horizontally banded buoy body, bands listed top to bottom. */
function bandedBody(bands: { color: string; fraction: number }[], width: number, height: number): string[] {
  const parts: string[] = [];
  let y = -height;
  for (const band of bands) {
    const bandHeight = height * band.fraction;
    parts.push(element('rect', {
      x: fmt(-width / 2), y: fmt(y), width: fmt(width), height: fmt(bandHeight),
      fill: band.color, stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 0.06,
    }));
    y += bandHeight;
  }
  return parts;
}

function topmark(markType: MarkType): string[] {
  const y = -MARK_HEIGHT * 0.62;
  switch (markType) {
    case 'cardinalNorth':
      return [cone(0, y - 1.0, 'up'), cone(0, y + 0.05, 'up')];
    case 'cardinalSouth':
      return [cone(0, y - 1.0, 'down'), cone(0, y + 0.05, 'down')];
    case 'cardinalEast':
      return [cone(0, y - 1.0, 'up'), cone(0, y + 0.05, 'down')];
    case 'cardinalWest':
      return [cone(0, y - 1.0, 'down'), cone(0, y + 0.05, 'up')];
    case 'isolatedDanger':
      return [
        element('circle', { cx: 0, cy: fmt(y - 0.85), r: 0.42, fill: COLORS.markBlack }),
        element('circle', { cx: 0, cy: fmt(y + 0.15), r: 0.42, fill: COLORS.markBlack }),
      ];
    case 'safeWater':
      return [element('circle', { cx: 0, cy: fmt(y - 0.35), r: 0.48, fill: COLORS.markRed })];
    case 'special': {
      const size = 0.55;
      const cy = y - 0.35;
      return [
        element('line', {
          x1: fmt(-size), y1: fmt(cy - size), x2: fmt(size), y2: fmt(cy + size),
          stroke: COLORS.markYellow, 'stroke-width': 0.3, 'stroke-linecap': 'round',
        }),
        element('line', {
          x1: fmt(-size), y1: fmt(cy + size), x2: fmt(size), y2: fmt(cy - size),
          stroke: COLORS.markYellow, 'stroke-width': 0.3, 'stroke-linecap': 'round',
        }),
      ];
    }
    case 'lateralStarboard':
      return [cone(0, y - 0.55, 'up', 0.72)];
    case 'lateralPort':
      return [element('rect', {
        x: -0.55, y: fmt(y - 1.05), width: 1.1, height: 1.0, fill: COLORS.markRed,
        stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 0.06,
      })];
  }
}

function buoyBody(markType: MarkType): string[] {
  const height = MARK_HEIGHT * 0.62;
  const width = 1.7;
  switch (markType) {
    case 'lateralPort':
      // Can profile: straight-sided cylinder, red.
      return bandedBody([{ color: COLORS.markRed, fraction: 1 }], width, height);
    case 'lateralStarboard':
      // Conical profile approximated by a tapering polygon, green.
      return [element('polygon', {
        points: `${fmt(-width * 0.28)},${fmt(-height)} ${fmt(width * 0.28)},${fmt(-height)} `
          + `${fmt(width / 2)},0 ${fmt(-width / 2)},0`,
        fill: COLORS.markGreen, stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 0.06,
      })];
    case 'cardinalNorth':
      return bandedBody([
        { color: COLORS.markBlack, fraction: 0.5 },
        { color: COLORS.markYellow, fraction: 0.5 },
      ], width, height);
    case 'cardinalSouth':
      return bandedBody([
        { color: COLORS.markYellow, fraction: 0.5 },
        { color: COLORS.markBlack, fraction: 0.5 },
      ], width, height);
    case 'cardinalEast':
      return bandedBody([
        { color: COLORS.markBlack, fraction: 0.38 },
        { color: COLORS.markYellow, fraction: 0.24 },
        { color: COLORS.markBlack, fraction: 0.38 },
      ], width, height);
    case 'cardinalWest':
      return bandedBody([
        { color: COLORS.markYellow, fraction: 0.38 },
        { color: COLORS.markBlack, fraction: 0.24 },
        { color: COLORS.markYellow, fraction: 0.38 },
      ], width, height);
    case 'isolatedDanger':
      return bandedBody([
        { color: COLORS.markBlack, fraction: 0.34 },
        { color: COLORS.markRed, fraction: 0.32 },
        { color: COLORS.markBlack, fraction: 0.34 },
      ], width, height);
    case 'safeWater': {
      // Red and white vertical stripes.
      const stripes = [-2, -1, 0, 1].map((i) => element('rect', {
        x: fmt(i * (width / 4)), y: fmt(-height),
        width: fmt(width / 4), height: fmt(height),
        fill: i % 2 === 0 ? COLORS.markWhite : COLORS.markRed,
      }));
      return [
        ...stripes,
        element('rect', {
          x: fmt(-width / 2), y: fmt(-height), width: fmt(width), height: fmt(height),
          fill: 'none', stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 0.06,
        }),
      ];
    }
    case 'special':
      return bandedBody([{ color: COLORS.markYellow, fraction: 1 }], width, height);
  }
}

export function renderMark(mark: Mark, night: boolean): string {
  const isLateral = mark.markType === 'lateralPort' || mark.markType === 'lateralStarboard';
  const body = mark.structure === 'pile' && isLateral
    ? [
      // A fixed pile beacon: grey post carrying the lateral daymark.
      element('line', {
        x1: 0, y1: 0, x2: 0, y2: fmt(-MARK_HEIGHT * 0.62),
        stroke: '#7d7a72', 'stroke-width': 0.3,
      }),
      mark.markType === 'lateralPort'
        ? element('rect', {
          x: -0.85, y: fmt(-MARK_HEIGHT * 0.62 - 1.7), width: 1.7, height: 1.7,
          fill: COLORS.markRed, stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 0.08,
        })
        : element('polygon', {
          points: `0,${fmt(-MARK_HEIGHT * 0.62 - 1.9)} -0.95,${fmt(-MARK_HEIGHT * 0.62)} 0.95,${fmt(-MARK_HEIGHT * 0.62)}`,
          fill: COLORS.markGreen, stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 0.08,
        }),
    ]
    : [...buoyBody(mark.markType), ...topmark(mark.markType)];
  const light = night
    ? [element('circle', {
      cx: 0, cy: fmt(-MARK_HEIGHT * 0.72), r: 0.5,
      fill: MARK_LIGHT[mark.markType], 'data-flash': 'true',
    }),
    element('circle', {
      cx: 0, cy: fmt(-MARK_HEIGHT * 0.72), r: 1.1,
      fill: MARK_LIGHT[mark.markType], opacity: 0.25,
    })]
    : [];
  return element(
    'g',
    {
      transform: `translate(${fmt(mark.x)}, ${fmt(mark.y)})`,
      'data-element': 'mark',
      'data-mark-id': mark.id,
      'data-mark-type': mark.markType,
    },
    // Waterline base ellipse grounds the upright pictogram on the water.
    element('ellipse', {
      cx: 0, cy: 0.15, rx: 1.15, ry: 0.42,
      fill: 'rgba(0,0,0,0.18)',
    }),
    ...body,
    ...light,
  );
}

export function renderSwimArea(area: { id: string; x: number; y: number; width: number; height: number }): string {
  const buoys: string[] = [];
  const perimeter = 2 * (area.width + area.height);
  const spacing = 6;
  for (let travelled = 0; travelled < perimeter; travelled += spacing) {
    let position: { x: number; y: number };
    let remaining = travelled;
    if (remaining < area.width) position = { x: area.x - area.width / 2 + remaining, y: area.y - area.height / 2 };
    else if ((remaining -= area.width) < area.height) position = { x: area.x + area.width / 2, y: area.y - area.height / 2 + remaining };
    else if ((remaining -= area.height) < area.width) position = { x: area.x + area.width / 2 - remaining, y: area.y + area.height / 2 };
    else position = { x: area.x - area.width / 2, y: area.y + area.height / 2 - (remaining - area.width) };
    buoys.push(element('circle', {
      cx: fmt(position.x), cy: fmt(position.y), r: 0.4,
      fill: COLORS.markYellow, stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 0.06,
    }));
  }
  return element(
    'g',
    { 'data-element': 'swim-area', 'data-feature-id': area.id },
    element('rect', {
      x: fmt(area.x - area.width / 2), y: fmt(area.y - area.height / 2),
      width: fmt(area.width), height: fmt(area.height),
      fill: 'rgba(242,196,51,0.10)', stroke: COLORS.markYellow,
      'stroke-width': 0.25, 'stroke-dasharray': MARKING.swimLineDash,
    }),
    ...buoys,
  );
}

/** A jetty deck: planked rectangle from (x1,y1) to (x2,y2) of the given width. */
export function renderJetty(
  id: string,
  from: { x: number; y: number },
  to: { x: number; y: number },
  width = 3,
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const planks: string[] = [];
  for (let along = 1.4; along < length; along += 1.6) {
    planks.push(element('line', {
      x1: fmt(along), y1: fmt(-width / 2 + 0.15), x2: fmt(along), y2: fmt(width / 2 - 0.15),
      stroke: COLORS.jettyEdge, 'stroke-width': 0.09, opacity: 0.7,
    }));
  }
  return element(
    'g',
    {
      transform: `translate(${fmt(from.x)}, ${fmt(from.y)}) rotate(${fmt(angle)})`,
      'data-element': 'jetty', 'data-feature-id': id,
    },
    element('rect', {
      x: 0, y: fmt(-width / 2), width: fmt(length), height: fmt(width), rx: 0.3,
      fill: COLORS.jetty, stroke: COLORS.jettyEdge, 'stroke-width': 0.18,
    }),
    ...planks,
  );
}

/** A boat ramp: a grey wedge running from the shore edge into the water. */
export function renderBoatRamp(
  id: string,
  shoreEdge: { x: number; y: number },
  intoWaterDegrees: number,
): string {
  return element(
    'g',
    {
      transform: `translate(${fmt(shoreEdge.x)}, ${fmt(shoreEdge.y)}) rotate(${fmt(intoWaterDegrees)})`,
      'data-element': 'boat-ramp', 'data-feature-id': id,
    },
    element('polygon', {
      points: '-3.2,-6 3.2,-6 4,7 -4,7',
      fill: COLORS.ramp, stroke: 'rgba(0,0,0,0.25)', 'stroke-width': 0.15,
    }),
    element('line', { x1: 0, y1: -5.5, x2: 0, y2: 6.5, stroke: '#ffffff', 'stroke-width': 0.16, 'stroke-dasharray': '1 1' }),
  );
}

export function renderShallows(shallows: { id: string; x: number; y: number; radius: number }): string {
  return element(
    'g',
    { 'data-element': 'shallows', 'data-feature-id': shallows.id },
    element('circle', {
      cx: fmt(shallows.x), cy: fmt(shallows.y), r: fmt(shallows.radius),
      fill: COLORS.shallows, opacity: 0.6,
    }),
    element('circle', {
      cx: fmt(shallows.x), cy: fmt(shallows.y), r: fmt(shallows.radius * 0.66),
      fill: COLORS.sand, opacity: 0.4,
    }),
  );
}

export function renderDistanceRing(
  id: string,
  center: { x: number; y: number },
  radius: number,
  label: string,
): string {
  return element(
    'g',
    { 'data-element': 'distance-ring', 'data-feature-id': id },
    element('circle', {
      cx: fmt(center.x), cy: fmt(center.y), r: fmt(radius),
      fill: 'none', stroke: COLORS.ringLine,
      'stroke-width': MARKING.ringWidth, 'stroke-dasharray': MARKING.ringDash, opacity: 0.85,
    }),
    element('line', {
      x1: fmt(center.x), y1: fmt(center.y), x2: fmt(center.x + radius), y2: fmt(center.y),
      stroke: COLORS.ringLine, 'stroke-width': 0.18, 'stroke-dasharray': '1 0.8', opacity: 0.6,
    }),
    text(label, {
      x: fmt(center.x + radius / 2), y: fmt(center.y - 0.9),
      fill: '#ffffff', stroke: 'rgba(0,0,0,0.45)', 'stroke-width': 0.14, 'paint-order': 'stroke',
      'font-size': 2.4, 'font-weight': 700, 'font-family': 'system-ui, sans-serif',
      'text-anchor': 'middle',
    }),
  );
}
