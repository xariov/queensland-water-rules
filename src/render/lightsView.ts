/**
 * Lights-view layout: what a skipper sees ahead at night. A dark seascape
 * panel with an arrangement of navigation lights, optionally over a faint
 * hull silhouette. Coordinates are the model's nominal 100 x 60 panel.
 */

import type { LightsViewLayout, ViewedLight } from '../scene/model.ts';
import type { LayoutRender } from './context.ts';
import { element } from './svg.ts';
import { formatNumber as fmt, vec } from './geometry.ts';
import { COLORS } from './style.ts';

const WIDTH = 100;
const HEIGHT = 60;
const HORIZON = 38;

const LIGHT_FILL: Record<ViewedLight['color'], string> = {
  red: COLORS.lightRed,
  green: COLORS.lightGreen,
  white: COLORS.lightWhite,
  yellow: COLORS.lightYellow,
};

/** Deterministic star field so renders stay stable across runs. */
function stars(): string[] {
  const points: string[] = [];
  for (let i = 0; i < 26; i += 1) {
    const x = ((i * 37) % 97) + 1.5;
    const y = ((i * 23) % (HORIZON - 6)) + 2;
    const r = 0.18 + ((i * 13) % 10) / 45;
    points.push(element('circle', {
      cx: fmt(x), cy: fmt(y), r: fmt(r), fill: '#e8ecf5', opacity: 0.5 + ((i * 7) % 10) / 25,
    }));
  }
  return points;
}

function silhouette(kind: NonNullable<LightsViewLayout['silhouette']>): string[] {
  if (kind === 'none') return [];
  const baseline = HORIZON + 7;
  const shapes: Record<Exclude<NonNullable<LightsViewLayout['silhouette']>, 'none'>, string> = {
    // Side-profile hull outlines, roughly centered on x = 50.
    powerboat: `M 30 ${baseline} L 34 ${baseline - 5} L 58 ${baseline - 5} L 62 ${baseline - 8} L 66 ${baseline - 5} L 70 ${baseline} Z`,
    sailboat: `M 32 ${baseline} L 36 ${baseline - 4} L 64 ${baseline - 4} L 68 ${baseline} Z `
      + `M 50 ${baseline - 4} L 50 ${baseline - 26} L 51 ${baseline - 26} L 51 ${baseline - 4} Z`,
    ship: `M 18 ${baseline} L 20 ${baseline - 7} L 62 ${baseline - 7} L 62 ${baseline - 13} L 74 ${baseline - 13} L 76 ${baseline - 7} L 80 ${baseline - 7} L 82 ${baseline} Z`,
  };
  return [element('path', {
    d: shapes[kind],
    fill: '#05080f', opacity: 0.75, 'data-element': 'silhouette',
  })];
}

function renderLight(light: ViewedLight): string {
  const fill = LIGHT_FILL[light.color];
  const radius = light.size === 'big' ? 1.5 : 1.0;
  return element(
    'g',
    { 'data-element': 'viewed-light', 'data-color': light.color },
    element('circle', { cx: fmt(light.x), cy: fmt(light.y), r: fmt(radius * 2.6), fill, opacity: 0.16 }),
    element('circle', { cx: fmt(light.x), cy: fmt(light.y), r: fmt(radius * 1.5), fill, opacity: 0.4 }),
    element('circle', {
      cx: fmt(light.x), cy: fmt(light.y), r: fmt(radius),
      fill, stroke: '#ffffff', 'stroke-width': 0.18, opacity: 0.98,
    }),
    // A soft reflection streak on the water below the light.
    element('rect', {
      x: fmt(light.x - radius * 0.6), y: fmt(Math.max(light.y + 2, HORIZON + 1)),
      width: fmt(radius * 1.2), height: 6, rx: fmt(radius * 0.5),
      fill, opacity: 0.14,
    }),
  );
}

export function renderLightsView(layout: LightsViewLayout): LayoutRender {
  const surface: string[] = [
    // Night sky and sea.
    element('rect', { x: 0, y: 0, width: WIDTH, height: fmt(HORIZON), fill: '#0a1424' }),
    element('rect', { x: 0, y: fmt(HORIZON), width: WIDTH, height: fmt(HEIGHT - HORIZON), fill: COLORS.nightWater }),
    element('line', {
      x1: 0, y1: fmt(HORIZON), x2: WIDTH, y2: fmt(HORIZON),
      stroke: '#2c3e59', 'stroke-width': 0.35,
    }),
    ...stars(),
    // A low moon for depth.
    element('circle', { cx: 86, cy: 9, r: 3.2, fill: '#e9e6d8', opacity: 0.85 }),
    ...silhouette(layout.silhouette ?? 'none'),
    ...layout.lights.map(renderLight),
  ];
  return {
    viewBox: { minX: 0, minY: 0, width: WIDTH, height: HEIGHT },
    contentPoints: [vec(0, 0), vec(WIDTH, HEIGHT)],
    surface,
    vesselPose: () => ({ position: vec(0, 0), headingDegrees: 0 }),
    movementPath: () => null,
    animationHold: () => null,
    swimmerPlacement: () => ({ position: vec(0, 0) }),
  };
}
