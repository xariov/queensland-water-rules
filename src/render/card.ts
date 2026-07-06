/**
 * Card layout: a pictogram panel for knowledge questions with no on-water
 * scene (equipment, signals, procedures). Icons are drawn in a local
 * 24 x 24 box centered on the card.
 */

import type { CardIcon, CardLayout } from '../scene/model.ts';
import type { LayoutRender } from './context.ts';
import { element, text } from './svg.ts';
import { formatNumber as fmt, vec } from './geometry.ts';
import { COLORS } from './style.ts';

const WIDTH = 64;
const HEIGHT = 48;

const e = element;

/** Icon artwork, each drawn within roughly x,y in [-12, 12]. */
function iconArt(icon: CardIcon): string[] {
  switch (icon) {
    case 'lifejacket':
      return [
        // Two front panels around a neck opening, waist strap across.
        e('path', {
          d: 'M -6.5 -8 Q -8.5 -6 -8 -1.5 L -8 8 Q -8 9.5 -6.5 9.5 L -1.2 9.5 L -1.2 -2 Q -1.2 -5.5 -3 -8 Z',
          fill: '#f28f2c', stroke: '#b05f10', 'stroke-width': 0.5,
        }),
        e('path', {
          d: 'M 6.5 -8 Q 8.5 -6 8 -1.5 L 8 8 Q 8 9.5 6.5 9.5 L 1.2 9.5 L 1.2 -2 Q 1.2 -5.5 3 -8 Z',
          fill: '#f28f2c', stroke: '#b05f10', 'stroke-width': 0.5,
        }),
        e('path', {
          d: 'M -3 -8 Q 0 -10.5 3 -8 Q 1.5 -4.5 1.2 -2 L -1.2 -2 Q -1.5 -4.5 -3 -8 Z',
          fill: 'none', stroke: '#b05f10', 'stroke-width': 0.5,
        }),
        e('rect', { x: -8, y: 3.4, width: 6.8, height: 1.6, fill: '#3a3a3a' }),
        e('rect', { x: 1.2, y: 3.4, width: 6.8, height: 1.6, fill: '#3a3a3a' }),
        e('rect', { x: -1.2, y: 3.2, width: 2.4, height: 2, rx: 0.4, fill: '#8a8a8a' }),
      ];
    case 'epirb':
      return [
        e('rect', { x: -3.6, y: -3, width: 7.2, height: 12, rx: 2.2, fill: '#f2c433', stroke: '#a8871a', 'stroke-width': 0.5 }),
        e('rect', { x: -2.4, y: -1.4, width: 4.8, height: 4, rx: 0.6, fill: '#3a3a3a' }),
        e('line', { x1: 2.2, y1: -3.5, x2: 5.5, y2: -10, stroke: '#3a3a3a', 'stroke-width': 0.9, 'stroke-linecap': 'round' }),
        // Radiating distress signal arcs.
        ...[3.2, 5.4, 7.6].map((r) => e('path', {
          d: `M ${fmt(-r * 0.65)} ${fmt(-6 - r * 0.55)} A ${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(r * 0.35)} ${fmt(-6 - r * 0.85)}`,
          fill: 'none', stroke: '#d0342c', 'stroke-width': 0.7, 'stroke-linecap': 'round',
        })),
      ];
    case 'flare':
      return [
        e('rect', { x: -2.2, y: -2, width: 4.4, height: 11, rx: 0.8, fill: '#d0342c', stroke: '#8f1f18', 'stroke-width': 0.5 }),
        e('rect', { x: -2.6, y: 7.4, width: 5.2, height: 1.8, rx: 0.5, fill: '#8f1f18' }),
        e('path', {
          d: 'M 0 -10.5 Q 2.8 -7.5 1.2 -4.5 Q 0.6 -3.4 0 -2 Q -0.6 -3.4 -1.2 -4.5 Q -2.8 -7.5 0 -10.5 Z',
          fill: '#ff8c42', stroke: '#d0342c', 'stroke-width': 0.5,
        }),
        ...[[-4.2, -7.5], [4.2, -7.5], [-3, -11], [3, -11]].map(([x, y]) =>
          e('circle', { cx: fmt(x), cy: fmt(y), r: 0.55, fill: '#ffb347' })),
      ];
    case 'vSheet':
      return [
        e('rect', { x: -10, y: -7, width: 20, height: 14, rx: 0.8, fill: '#f28f2c', stroke: '#b05f10', 'stroke-width': 0.6 }),
        e('path', {
          d: 'M -6 -5 L 0 5 L 6 -5',
          fill: 'none', stroke: '#1c1c1c', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        }),
      ];
    case 'fireExtinguisher':
      return [
        e('rect', { x: -3.4, y: -6, width: 6.8, height: 15, rx: 2.4, fill: '#d0342c', stroke: '#8f1f18', 'stroke-width': 0.5 }),
        e('rect', { x: -1.6, y: -8.4, width: 3.2, height: 2.6, fill: '#3a3a3a' }),
        e('path', { d: 'M -1.6 -7.6 L -6.5 -7.6 L -6.5 -5.4', fill: 'none', stroke: '#3a3a3a', 'stroke-width': 1.1, 'stroke-linecap': 'round' }),
        e('path', { d: 'M -6.5 -5.4 L -6.5 -3.6 L -4.6 -3.6', fill: 'none', stroke: '#8a8a8a', 'stroke-width': 0.9 }),
        e('rect', { x: -2.2, y: -2.5, width: 4.4, height: 5.5, rx: 0.5, fill: '#f5f5f2' }),
      ];
    case 'anchor':
      return [
        e('circle', { cx: 0, cy: -8.2, r: 1.8, fill: 'none', stroke: '#2c3e50', 'stroke-width': 1.1 }),
        e('line', { x1: 0, y1: -6.4, x2: 0, y2: 7.5, stroke: '#2c3e50', 'stroke-width': 1.3 }),
        e('line', { x1: -4.6, y1: -3.4, x2: 4.6, y2: -3.4, stroke: '#2c3e50', 'stroke-width': 1.1 }),
        e('path', {
          d: 'M -8 2.5 Q -7.2 8.5 0 9 Q 7.2 8.5 8 2.5 L 5.6 4.3 Q 5.4 6.4 0 6.9 Q -5.4 6.4 -5.6 4.3 Z',
          fill: '#2c3e50',
        }),
      ];
    case 'radio':
      return [
        e('rect', { x: -5.5, y: -9, width: 11, height: 18, rx: 1.6, fill: '#2c3e50', stroke: '#16222e', 'stroke-width': 0.5 }),
        e('rect', { x: -3.8, y: -6.6, width: 7.6, height: 5, rx: 0.6, fill: '#9fd8a8' }),
        text('16', { x: 0, y: -3.4, 'font-size': 3.4, 'font-weight': 700, 'text-anchor': 'middle', fill: '#1c3a24', 'font-family': 'system-ui, sans-serif' }),
        ...[-2.6, 0, 2.6].map((x) => e('circle', { cx: fmt(x), cy: 2.2, r: 1.0, fill: '#8a9aa8' })),
        e('rect', { x: -3.6, y: 5, width: 7.2, height: 2.6, rx: 0.8, fill: '#3d5468' }),
        e('line', { x1: 3.8, y1: -9.4, x2: 3.8, y2: -13, stroke: '#16222e', 'stroke-width': 1.2, 'stroke-linecap': 'round' }),
      ];
    case 'fuel':
      return [
        e('path', {
          d: 'M -7 -8 L 4.5 -8 L 7 -5.5 L 7 9 L -7 9 Z',
          fill: '#d0342c', stroke: '#8f1f18', 'stroke-width': 0.6,
        }),
        e('path', { d: 'M -4.5 -8 L -1.5 -11 L 3 -11 L 5.5 -8.5', fill: 'none', stroke: '#8f1f18', 'stroke-width': 1.1 }),
        e('circle', { cx: 3.6, cy: -9.8, r: 1.3, fill: '#3a3a3a' }),
        e('path', { d: 'M -3.5 5.5 L 0 -1.5 L -0.8 -1.5 L 3 -5.5 L 1 0 L 2 0 Z', fill: '#f5f5f2' }),
      ];
    case 'firstAid':
      return [
        e('rect', { x: -9, y: -6.5, width: 18, height: 13.5, rx: 1.6, fill: '#f5f5f2', stroke: '#b8b8b2', 'stroke-width': 0.6 }),
        e('rect', { x: -3.2, y: -8.6, width: 6.4, height: 2.4, rx: 0.8, fill: '#b8b8b2' }),
        e('rect', { x: -1.7, y: -4.4, width: 3.4, height: 9.4, fill: '#d0342c' }),
        e('rect', { x: -4.7, y: -1.4, width: 9.4, height: 3.4, fill: '#d0342c' }),
      ];
    case 'torch':
      return [
        e('g', { transform: 'rotate(-35)' },
          e('rect', { x: -2, y: -2, width: 4, height: 11, rx: 1.2, fill: '#3a3a3a' }),
          e('path', { d: 'M -3 -5.5 L 3 -5.5 L 2 -2 L -2 -2 Z', fill: '#5a5a5a' }),
          e('polygon', { points: '-3,-5.8 3,-5.8 7,-14 -7,-14', fill: '#ffe9a8', opacity: 0.75 }),
        ),
      ];
    case 'chart':
      return [
        e('path', {
          d: 'M -10 -7 L -3.3 -5 L 3.3 -7 L 10 -5 L 10 7 L 3.3 5 L -3.3 7 L -10 5 Z',
          fill: '#eef3ee', stroke: '#9aa89a', 'stroke-width': 0.5,
        }),
        e('line', { x1: -3.3, y1: -5, x2: -3.3, y2: 7, stroke: '#c8d2c8', 'stroke-width': 0.4 }),
        e('line', { x1: 3.3, y1: -7, x2: 3.3, y2: 5, stroke: '#c8d2c8', 'stroke-width': 0.4 }),
        e('path', {
          d: 'M -7.5 3.5 Q -3 -3.5 1 0 Q 5 3 7.5 -3.5',
          fill: 'none', stroke: '#d0342c', 'stroke-width': 0.8, 'stroke-dasharray': '1.4 1',
        }),
        e('circle', { cx: -7.5, cy: 3.5, r: 0.9, fill: '#2c3e50' }),
        e('polygon', { points: '7.5,-5.5 9,-2.5 6,-2.5', fill: '#2c3e50' }),
      ];
    case 'divingFlag':
      return [
        e('line', { x1: -5, y1: -10, x2: -5, y2: 10, stroke: '#3a3a3a', 'stroke-width': 1 }),
        // International Code Flag A: white hoist, blue fly, swallowtail.
        e('path', { d: 'M -5 -9.5 L 1.5 -9.5 L 1.5 -1.5 L -5 -1.5 Z', fill: '#f5f5f2', stroke: '#b8b8b2', 'stroke-width': 0.3 }),
        e('path', { d: 'M 1.5 -9.5 L 9.5 -9.5 L 6 -5.5 L 9.5 -1.5 L 1.5 -1.5 Z', fill: '#1f4fc4' }),
      ];
    case 'skiFlag':
      return [
        e('line', { x1: -4, y1: -10, x2: -4, y2: 10, stroke: '#3a3a3a', 'stroke-width': 1 }),
        e('path', { d: 'M -4 -9.5 L 8.5 -8 L -4 -1 Z', fill: '#f28f2c', stroke: '#b05f10', 'stroke-width': 0.4 }),
      ];
    case 'checklist':
      return [
        e('rect', { x: -7.5, y: -10, width: 15, height: 20, rx: 1.4, fill: '#f5f5f2', stroke: '#b8b8b2', 'stroke-width': 0.6 }),
        e('rect', { x: -3.4, y: -11.4, width: 6.8, height: 3, rx: 1, fill: '#8a9aa8' }),
        ...[-5.4, -1.4, 2.6].map((y) => e('path', {
          d: `M -5.4 ${fmt(y + 0.4)} L -4.2 ${fmt(y + 1.6)} L -2.4 ${fmt(y - 1)}`,
          fill: 'none', stroke: '#3aa05a', 'stroke-width': 0.9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        })),
        ...[-4.6, -0.6, 3.4].map((y) => e('line', {
          x1: -0.8, y1: fmt(y), x2: 5.6, y2: fmt(y), stroke: '#b8b8b2', 'stroke-width': 0.8,
        })),
      ];
    case 'weather':
      return [
        e('path', {
          d: 'M -8 2 Q -8 -2 -4.4 -2.4 Q -3.6 -7 1 -6.6 Q 5.4 -6.4 6 -2.6 Q 9.5 -2.2 9.5 1 Q 9.5 4 6.2 4 L -5 4 Q -8 4 -8 2 Z',
          fill: '#8a9aa8', stroke: '#5f7183', 'stroke-width': 0.5,
        }),
        e('polygon', { points: '0.5,4.5 -3,10 -0.5,10 -2,14 3.5,8 1,8 2.8,4.5', fill: '#f2c433', stroke: '#b08a12', 'stroke-width': 0.4 }),
      ];
    case 'bar':
      return [
        // Breaking waves piling over a shallow bar at a river mouth.
        e('path', { d: 'M -11 8 L -11 5 Q -6 3 0 5 Q 6 7 11 5 L 11 8 Z', fill: COLORS.sand }),
        ...[0, 1, 2].map((i) => e('path', {
          d: `M ${fmt(-10 + i * 2)} ${fmt(-1 - i * 3.4)} Q ${fmt(-4 + i * 2)} ${fmt(-6 - i * 3.4)} ${fmt(0 + i * 2)} ${fmt(-1.5 - i * 3.4)} Q ${fmt(1.4 + i * 2)} ${fmt(-3.6 - i * 3.4)} ${fmt(-0.6 + i * 2)} ${fmt(-3.9 - i * 3.4)}`,
          fill: 'none', stroke: '#2d7fb8', 'stroke-width': 1.3, 'stroke-linecap': 'round',
        })),
        ...[0, 1, 2].map((i) => e('circle', { cx: fmt(1.8 + i * 2), cy: fmt(-2 - i * 3.4), r: 0.7, fill: '#ffffff', opacity: 0.9 })),
      ];
    case 'licence':
      return [
        e('rect', { x: -10, y: -6.5, width: 20, height: 13.5, rx: 1.6, fill: '#eef3f8', stroke: '#8a9aa8', 'stroke-width': 0.6 }),
        e('rect', { x: -10, y: -6.5, width: 20, height: 3, rx: 1.6, fill: '#2c5f8a' }),
        e('circle', { cx: -5.5, cy: 1.5, r: 2.4, fill: '#c8d4de' }),
        e('circle', { cx: -5.5, cy: 0.4, r: 1.0, fill: '#8a9aa8' }),
        e('path', { d: 'M -7.6 3.4 Q -5.5 1.6 -3.4 3.4 L -3.4 4.6 L -7.6 4.6 Z', fill: '#8a9aa8' }),
        ...[-1.4, 0.6, 2.6].map((y) => e('line', {
          x1: -0.5, y1: fmt(y), x2: 8, y2: fmt(y), stroke: '#8a9aa8', 'stroke-width': 0.7,
        })),
      ];
    case 'registration':
      return [
        // Hull side profile carrying registration symbols.
        e('path', {
          d: 'M -11 -1 L 11 -1 L 8 5.5 Q 7.5 6.5 6.2 6.5 L -8.2 6.5 Q -9.5 6.5 -9.8 5.2 Z',
          fill: '#f5f5f2', stroke: '#9aa4ae', 'stroke-width': 0.6,
        }),
        e('path', { d: 'M -11 -1 L -6 -7 L -4.5 -1 Z', fill: '#f5f5f2', stroke: '#9aa4ae', 'stroke-width': 0.6 }),
        text('AB123Q', {
          x: 0.8, y: 3.8, 'font-size': 3.2, 'font-weight': 700, 'text-anchor': 'middle',
          fill: '#2c3e50', 'font-family': 'system-ui, sans-serif', 'letter-spacing': 0.4,
        }),
      ];
    case 'alcohol':
      return [
        e('path', {
          d: 'M -1.6 -9.5 L 1.6 -9.5 L 1.6 -5.5 Q 3.4 -4 3.4 -1.5 L 3.4 8 Q 3.4 9.4 2 9.4 L -2 9.4 Q -3.4 9.4 -3.4 8 L -3.4 -1.5 Q -3.4 -4 -1.6 -5.5 Z',
          fill: '#7a9e6b', stroke: '#55744a', 'stroke-width': 0.5,
        }),
        e('circle', { cx: 0, cy: 0, r: 10.6, fill: 'none', stroke: '#d0342c', 'stroke-width': 1.6 }),
        e('line', { x1: -7.5, y1: -7.5, x2: 7.5, y2: 7.5, stroke: '#d0342c', 'stroke-width': 1.6 }),
      ];
    case 'pwc':
      return [
        // Side profile: hull, seat, handlebar, jet spray behind.
        e('path', {
          d: 'M -10 4 Q -10 2 -8 1.6 L 3 0.2 Q 5.5 -0.2 8 1 L 10.5 2.4 Q 11 4.4 9 4.8 L -8 4.8 Q -10 4.8 -10 4 Z',
          fill: '#2d7fb8', stroke: '#1c5680', 'stroke-width': 0.5,
        }),
        e('path', { d: 'M -5.5 1.4 Q -5.8 -1.6 -2.5 -1.8 L 1 -2 L 1.5 0.4 Z', fill: '#3a3a3a' }),
        e('path', { d: 'M 1 -2 L 4.4 -4.6 L 5.4 -3.4 L 2.6 -0.8 Z', fill: '#5a5a5a' }),
        e('circle', { cx: 5.2, cy: -5.2, r: 1.1, fill: '#3a3a3a' }),
        ...[0, 1, 2].map((i) => e('circle', { cx: fmt(-11.5 - i * 1.6), cy: fmt(3.4 - i * 0.7), r: fmt(0.9 - i * 0.2), fill: '#bfe0f0' })),
      ];
    case 'killSwitch':
      return [
        e('circle', { cx: -3, cy: -3, r: 4.6, fill: '#d0342c', stroke: '#8f1f18', 'stroke-width': 0.7 }),
        e('circle', { cx: -3, cy: -3, r: 2.2, fill: '#8f1f18' }),
        // Coiled lanyard leading to a wrist clip.
        e('path', {
          d: 'M 1.5 -1.5 Q 4 0.5 3 2.5 Q 2 4.5 4.5 5.5 Q 7 6.5 6 8.5',
          fill: 'none', stroke: '#3a3a3a', 'stroke-width': 1.0, 'stroke-linecap': 'round',
        }),
        e('circle', { cx: 6.2, cy: 10, r: 1.7, fill: 'none', stroke: '#3a3a3a', 'stroke-width': 1.0 }),
      ];
    case 'lifebuoy':
      return [
        e('circle', { cx: 0, cy: 0, r: 9, fill: '#f28f2c', stroke: '#b05f10', 'stroke-width': 0.6 }),
        e('circle', { cx: 0, cy: 0, r: 4.2, fill: COLORS.water, stroke: '#b05f10', 'stroke-width': 0.6 }),
        ...[45, 135, 225, 315].map((angle) => e('path', {
          d: `M ${fmt(4.2 * Math.cos((angle * Math.PI) / 180))} ${fmt(4.2 * Math.sin((angle * Math.PI) / 180))} L ${fmt(9 * Math.cos((angle * Math.PI) / 180))} ${fmt(9 * Math.sin((angle * Math.PI) / 180))}`,
          stroke: '#f5f5f2', 'stroke-width': 2.4,
        })),
      ];
    case 'mayday':
      return [
        e('rect', { x: -8.5, y: -8, width: 17, height: 11, rx: 2.2, fill: '#2c3e50' }),
        e('polygon', { points: '-3,2.8 3,2.8 0,7.5', fill: '#2c3e50' }),
        text('MAYDAY', {
          x: 0, y: -1.4, 'font-size': 3.1, 'font-weight': 800, 'text-anchor': 'middle',
          fill: '#ffffff', 'font-family': 'system-ui, sans-serif',
        }),
        ...[[-11.4, -6, -1], [11.4, -6, 1]].map(([x, y, sign]) => e('path', {
          d: `M ${fmt(x)} ${fmt(y)} A 4.5 4.5 0 0 ${sign === 1 ? 1 : 0} ${fmt(x)} ${fmt(y + 7)}`,
          fill: 'none', stroke: '#d0342c', 'stroke-width': 1.0, 'stroke-linecap': 'round',
        })),
      ];
    case 'signalMirror':
      return [
        e('rect', { x: -7, y: -7, width: 12, height: 12, rx: 1.2, fill: '#cfe0ec', stroke: '#8a9aa8', 'stroke-width': 0.7 }),
        e('line', { x1: -6, y1: 4, x2: 4, y2: -6, stroke: '#ffffff', 'stroke-width': 1.4, opacity: 0.8 }),
        ...[0, 25, -25].map((angle) => e('line', {
          x1: 6, y1: -6, x2: fmt(6 + 6 * Math.cos(((angle - 45) * Math.PI) / 180)), y2: fmt(-6 + 6 * Math.sin(((angle - 45) * Math.PI) / 180)),
          stroke: '#f2c433', 'stroke-width': 0.9, 'stroke-linecap': 'round',
        })),
      ];
  }
}

export function renderCard(layout: CardLayout): LayoutRender {
  const surface: string[] = [
    element('rect', {
      x: 0, y: 0, width: WIDTH, height: HEIGHT, rx: 3,
      fill: '#f4f1e9', stroke: '#d8d2c2', 'stroke-width': 0.5,
    }),
    element('rect', {
      x: 1.6, y: 1.6, width: WIDTH - 3.2, height: HEIGHT - 3.2, rx: 2.2,
      fill: 'none', stroke: '#e4dfd2', 'stroke-width': 0.4,
    }),
    element(
      'g',
      {
        transform: `translate(${fmt(WIDTH / 2)}, ${fmt(layout.label ? HEIGHT / 2 - 4.5 : HEIGHT / 2)})`,
        'data-element': 'card-icon',
        'data-icon': layout.icon,
      },
      ...iconArt(layout.icon),
    ),
  ];
  if (layout.label) {
    surface.push(text(layout.label, {
      x: fmt(WIDTH / 2), y: fmt(HEIGHT - 6),
      'font-size': 3.4, 'font-weight': 600, 'text-anchor': 'middle',
      fill: COLORS.labelInk, 'font-family': 'system-ui, sans-serif',
    }));
  }
  if (layout.badge) {
    surface.push(element(
      'g',
      { 'data-element': 'card-badge' },
      element('circle', { cx: fmt(WIDTH - 9), cy: 9, r: 6, fill: '#2c5f8a' }),
      text(layout.badge, {
        x: fmt(WIDTH - 9), y: 10.3,
        'font-size': 3.2, 'font-weight': 700, 'text-anchor': 'middle',
        fill: '#ffffff', 'font-family': 'system-ui, sans-serif',
      }),
    ));
  }
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
