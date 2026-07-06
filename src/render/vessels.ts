/** Vessels, their movement-intent arrows, and swimmers. */

import type { Vessel } from '../scene/model.ts';
import { element, text } from './svg.ts';
import { formatNumber as fmt, formatPoint } from './geometry.ts';
import { BOAT, COLORS } from './style.ts';
import type { MovementPath, VesselPose } from './context.ts';
import { pathData, type PathSegment } from './path.ts';

/** Physical footprint per vessel kind, meters. */
export function vesselDimensions(
  vessel: Pick<Vessel, 'vesselKind'>,
): { length: number; width: number } {
  switch (vessel.vesselKind) {
    case 'sailboat': return { length: 8.4, width: 2.7 };
    case 'pwc': return { length: 3.3, width: 1.25 };
    case 'ship': return { length: 30, width: 8.2 };
    case 'fishingVessel': return { length: 12, width: 4.0 };
    case 'paddlecraft': return { length: 4.2, width: 0.75 };
    default: return { length: BOAT.length, width: BOAT.width };
  }
}

/** Drives the vessel along a path when the scene is played. */
export interface VesselAnimation {
  pathD: string;
  durationSeconds: number;
  delaySeconds: number;
}

/**
 * The pointed-bow hull outline in local coordinates (bow at -halfLength,
 * pointing north). Powerboats get a squared transom; double-enders and
 * ships take rounded or flared variants via the parameters.
 */
function hullPath(
  halfWidth: number,
  halfLength: number,
  options: { bowFullness?: number; sternRound?: number } = {},
): string {
  const bow = options.bowFullness ?? 0.55;
  const stern = options.sternRound ?? 0.25;
  const shoulderY = -halfLength + (halfLength * 2) * bow * 0.5;
  return [
    `M 0 ${fmt(-halfLength)}`,
    `C ${fmt(halfWidth * 0.72)} ${fmt(-halfLength + 0.18 * halfLength * 2)},`
    + ` ${fmt(halfWidth)} ${fmt(shoulderY)}, ${fmt(halfWidth)} ${fmt(shoulderY + 0.1)}`,
    `L ${fmt(halfWidth)} ${fmt(halfLength - stern)}`,
    `Q ${fmt(halfWidth)} ${fmt(halfLength)}, ${fmt(halfWidth - stern)} ${fmt(halfLength)}`,
    `L ${fmt(-(halfWidth - stern))} ${fmt(halfLength)}`,
    `Q ${fmt(-halfWidth)} ${fmt(halfLength)}, ${fmt(-halfWidth)} ${fmt(halfLength - stern)}`,
    `L ${fmt(-halfWidth)} ${fmt(shoulderY + 0.1)}`,
    `C ${fmt(-halfWidth)} ${fmt(shoulderY)},`
    + ` ${fmt(-halfWidth * 0.72)} ${fmt(-halfLength + 0.18 * halfLength * 2)}, 0 ${fmt(-halfLength)}`,
    'Z',
  ].join(' ');
}

/** A person seen from above: shoulders plus head, shirt in the given color. */
function personArt(color: string, scale = 1): string[] {
  return [
    element('ellipse', {
      cx: 0, cy: 0, rx: fmt(0.55 * scale), ry: fmt(0.36 * scale),
      fill: color, stroke: '#ffffff', 'stroke-width': 0.08,
    }),
    element('circle', { cx: 0, cy: fmt(-0.14 * scale), r: fmt(0.26 * scale), fill: '#e3b7a0' }),
  ];
}

/**
 * Navigation lights for night scenes, drawn as glowing dots: red port bow,
 * green starboard bow, white stern; power-driven vessels add a white
 * masthead light. An anchored vessel shows a single all-round white light.
 */
function navigationLights(vessel: Vessel, halfWidth: number, halfLength: number): string[] {
  const glow = (x: number, y: number, color: string): string[] => [
    element('circle', { cx: fmt(x), cy: fmt(y), r: 1.15, fill: color, opacity: 0.22 }),
    element('circle', { cx: fmt(x), cy: fmt(y), r: 0.55, fill: color, opacity: 0.45 }),
    element('circle', {
      cx: fmt(x), cy: fmt(y), r: 0.28, fill: color,
      stroke: '#ffffff', 'stroke-width': 0.06,
    }),
  ];
  if (vessel.anchored || vessel.moored) {
    return glow(0, 0, COLORS.lightWhite);
  }
  const bowY = -halfLength * 0.45;
  const lights = [
    ...glow(-halfWidth * 0.8, bowY, COLORS.lightRed),
    ...glow(halfWidth * 0.8, bowY, COLORS.lightGreen),
    ...glow(0, halfLength - 0.35, COLORS.lightWhite),
  ];
  const isPowerDriven = vessel.vesselKind !== 'sailboat' || vessel.sails === 'down';
  if (isPowerDriven && vessel.vesselKind !== 'paddlecraft') {
    lights.push(...glow(0, -halfLength * 0.1, COLORS.lightWhite));
  }
  return lights;
}

/** Anchor rode leading from the bow, with a small anchor glyph at its end. */
function anchorGear(halfLength: number): string[] {
  const dropY = -halfLength - 3.4;
  return [
    element('line', {
      x1: 0, y1: fmt(-halfLength + 0.2), x2: 1.2, y2: fmt(dropY),
      stroke: '#3f3f3c', 'stroke-width': 0.16, 'stroke-dasharray': '0.6 0.4',
    }),
    element('g', { transform: `translate(1.2, ${fmt(dropY)})`, 'data-element': 'anchor' },
      element('line', { x1: 0, y1: -0.55, x2: 0, y2: 0.55, stroke: '#2c2c2a', 'stroke-width': 0.18 }),
      element('line', { x1: -0.42, y1: -0.3, x2: 0.42, y2: -0.3, stroke: '#2c2c2a', 'stroke-width': 0.15 }),
      element('path', {
        d: 'M -0.62 0.18 Q 0 0.85, 0.62 0.18', fill: 'none',
        stroke: '#2c2c2a', 'stroke-width': 0.18, 'stroke-linecap': 'round',
      }),
    ),
  ];
}

/** Tow rope and the skier or tube pulled behind the vessel. */
function towedUnit(vessel: Vessel, halfLength: number): string[] {
  if (!vessel.towing) return [];
  const ropeEnd = halfLength + 7;
  const rope = element('line', {
    x1: 0, y1: fmt(halfLength - 0.2), x2: 0, y2: fmt(ropeEnd),
    stroke: '#f5f2e8', 'stroke-width': 0.14,
  });
  if (vessel.towing === 'tube') {
    return [rope,
      element('circle', {
        cx: 0, cy: fmt(ropeEnd + 0.9), r: 1.0,
        fill: '#f2c433', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 0.12,
      }),
      ...[element('g', { transform: `translate(0, ${fmt(ropeEnd + 0.9)})` }, ...personArt(COLORS.swimmer, 0.8))],
    ];
  }
  return [rope,
    element('g', { transform: `translate(0, ${fmt(ropeEnd + 0.6)})` },
      element('line', { x1: -0.55, y1: 0.5, x2: -0.2, y2: -0.4, stroke: '#f5f2e8', 'stroke-width': 0.16 }),
      element('line', { x1: 0.55, y1: 0.5, x2: 0.2, y2: -0.4, stroke: '#f5f2e8', 'stroke-width': 0.16 }),
      ...personArt(COLORS.swimmer, 0.9),
    ),
  ];
}

/** Wake vee behind a vessel that is underway (has a movement). */
function wake(halfWidth: number, halfLength: number): string {
  return element('g', { 'data-element': 'wake', opacity: 0.5 },
    element('path', {
      d: `M ${fmt(-halfWidth * 0.6)} ${fmt(halfLength)} L ${fmt(-halfWidth * 1.8)} ${fmt(halfLength + halfLength * 1.4)}`,
      stroke: '#ffffff', 'stroke-width': 0.35, 'stroke-linecap': 'round', fill: 'none', opacity: 0.65,
    }),
    element('path', {
      d: `M ${fmt(halfWidth * 0.6)} ${fmt(halfLength)} L ${fmt(halfWidth * 1.8)} ${fmt(halfLength + halfLength * 1.4)}`,
      stroke: '#ffffff', 'stroke-width': 0.35, 'stroke-linecap': 'round', fill: 'none', opacity: 0.65,
    }),
  );
}

/** Body artwork per kind, in local coordinates pointing north. */
function bodyArt(vessel: Vessel, color: string, halfWidth: number, halfLength: number): string[] {
  const hull = (options?: { bowFullness?: number; sternRound?: number }): string =>
    element('path', {
      d: hullPath(halfWidth, halfLength, options),
      fill: color, stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 0.12,
    });
  const deckInset = (top: number, bottom: number): string => element('path', {
    d: hullPath(halfWidth * 0.68, (bottom - top) / 2, { bowFullness: 0.5, sternRound: 0.2 }),
    fill: COLORS.deck,
    transform: `translate(0, ${fmt((top + bottom) / 2)})`,
  });

  switch (vessel.vesselKind) {
    case 'sailboat': {
      const sailsUp = vessel.sails !== 'down';
      return [
        hull({ bowFullness: 0.6, sternRound: 0.6 }),
        deckInset(-halfLength * 0.55, halfLength * 0.8),
        // Mast at midships; boom and mainsail when hoisted.
        element('circle', { cx: 0, cy: fmt(-halfLength * 0.12), r: 0.22, fill: '#4a4438' }),
        ...(sailsUp
          ? [element('path', {
            d: `M 0 ${fmt(-halfLength * 0.12)} L ${fmt(halfWidth * 1.5)} ${fmt(halfLength * 0.62)} L 0 ${fmt(halfLength * 0.72)} Z`,
            fill: COLORS.sail, stroke: 'rgba(0,0,0,0.25)', 'stroke-width': 0.08, opacity: 0.94,
            'data-element': 'sail',
          })]
          : [element('line', {
            x1: 0, y1: fmt(-halfLength * 0.12), x2: 0, y2: fmt(halfLength * 0.7),
            stroke: '#4a4438', 'stroke-width': 0.12,
          })]),
      ];
    }
    case 'pwc':
      return [
        hull({ bowFullness: 0.7, sternRound: 0.35 }),
        // Seat and rider.
        element('rect', {
          x: fmt(-halfWidth * 0.42), y: fmt(-halfLength * 0.1),
          width: fmt(halfWidth * 0.84), height: fmt(halfLength * 0.9), rx: 0.3,
          fill: 'rgba(0,0,0,0.28)',
        }),
        element('g', { transform: `translate(0, ${fmt(halfLength * 0.18)})` }, ...personArt('#2b5f8a', 0.82)),
      ];
    case 'ship':
      return [
        hull({ bowFullness: 0.45, sternRound: 0.9 }),
        deckInset(-halfLength * 0.7, halfLength * 0.9),
        // Aft superstructure block and forward hatch outlines.
        element('rect', {
          x: fmt(-halfWidth * 0.55), y: fmt(halfLength * 0.42),
          width: fmt(halfWidth * 1.1), height: fmt(halfLength * 0.4), rx: 0.5,
          fill: '#e8e4da', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 0.12,
        }),
        ...[-0.5, -0.15, 0.2].map((f) => element('rect', {
          x: fmt(-halfWidth * 0.5), y: fmt(halfLength * f),
          width: fmt(halfWidth), height: fmt(halfLength * 0.24), rx: 0.3,
          fill: 'none', stroke: 'rgba(0,0,0,0.28)', 'stroke-width': 0.1,
        })),
      ];
    case 'fishingVessel':
      return [
        hull({ bowFullness: 0.5, sternRound: 0.5 }),
        deckInset(-halfLength * 0.6, halfLength * 0.85),
        // Wheelhouse forward of midships.
        element('rect', {
          x: fmt(-halfWidth * 0.5), y: fmt(-halfLength * 0.45),
          width: fmt(halfWidth), height: fmt(halfLength * 0.42), rx: 0.35,
          fill: '#e8e4da', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 0.12,
        }),
        // Trawl warps astern when fishing.
        ...(vessel.trawling
          ? [
            element('line', {
              x1: fmt(-halfWidth * 0.4), y1: fmt(halfLength), x2: fmt(-halfWidth * 0.9), y2: fmt(halfLength + 6),
              stroke: '#d8d3c2', 'stroke-width': 0.16, 'stroke-dasharray': '0.9 0.5',
            }),
            element('line', {
              x1: fmt(halfWidth * 0.4), y1: fmt(halfLength), x2: fmt(halfWidth * 0.9), y2: fmt(halfLength + 6),
              stroke: '#d8d3c2', 'stroke-width': 0.16, 'stroke-dasharray': '0.9 0.5',
            }),
            element('ellipse', {
              cx: 0, cy: fmt(halfLength + 6.8), rx: fmt(halfWidth * 1.05), ry: 1.3,
              fill: 'none', stroke: '#d8d3c2', 'stroke-width': 0.18, 'stroke-dasharray': '0.5 0.4',
              'data-element': 'trawl-net',
            }),
          ]
          : []),
      ];
    case 'paddlecraft':
      return [
        hull({ bowFullness: 0.75, sternRound: 0.7 }),
        element('g', { transform: `translate(0, ${fmt(halfLength * 0.05)})` },
          // Paddle held across the cockpit.
          element('line', {
            x1: fmt(-halfWidth - 1.0), y1: 0.45, x2: fmt(halfWidth + 1.0), y2: -0.45,
            stroke: '#8a6f43', 'stroke-width': 0.14,
          }),
          element('ellipse', { cx: fmt(-halfWidth - 1.0), cy: 0.45, rx: 0.22, ry: 0.5, fill: '#8a6f43' }),
          element('ellipse', { cx: fmt(halfWidth + 1.0), cy: -0.45, rx: 0.22, ry: 0.5, fill: '#8a6f43' }),
          ...personArt(color === COLORS.hullWhite ? '#2b5f8a' : '#f2f2ee', 0.8),
        ),
      ];
    default:
      // Powerboat: open runabout with windscreen, helm seats and outboard.
      return [
        hull(),
        deckInset(-halfLength * 0.45, halfLength * 0.8),
        element('path', {
          d: `M ${fmt(-halfWidth * 0.62)} ${fmt(-halfLength * 0.32)} Q 0 ${fmt(-halfLength * 0.52)}, ${fmt(halfWidth * 0.62)} ${fmt(-halfLength * 0.32)}`,
          fill: 'none', stroke: 'rgba(255,255,255,0.75)', 'stroke-width': 0.22,
        }),
        element('rect', {
          x: fmt(-halfWidth * 0.28), y: fmt(halfLength - 0.55),
          width: fmt(halfWidth * 0.56), height: 0.85, rx: 0.18,
          fill: '#3f3f3c', 'data-element': 'outboard',
        }),
      ];
  }
}

export function renderVessel(
  vessel: Vessel,
  pose: VesselPose,
  color: string,
  animation?: VesselAnimation,
  night = false,
): string {
  const { length, width } = vesselDimensions(vessel);
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const forAnimation = animation !== undefined;
  const underway = vessel.movement !== undefined && vessel.holding !== true
    && !vessel.anchored && !vessel.moored;
  const art = element(
    'g',
    {
      transform: forAnimation
        ? undefined
        : `translate(${formatPoint(pose.position)}) rotate(${fmt(pose.headingDegrees)})`,
      'data-element': 'vessel',
      'data-vessel-id': vessel.id,
      'data-kind': vessel.vesselKind === undefined || vessel.vesselKind === 'powerboat'
        ? undefined
        : vessel.vesselKind,
    },
    ...(underway && !night ? [wake(halfWidth, halfLength)] : []),
    ...(vessel.anchored ? anchorGear(halfLength) : []),
    ...towedUnit(vessel, halfLength),
    ...bodyArt(vessel, color, halfWidth, halfLength),
    ...(night ? navigationLights(vessel, halfWidth, halfLength) : []),
    text(vessel.id, {
      x: 0, y: 0.55, fill: vessel.vesselKind === 'paddlecraft' ? undefined : '#ffffff',
      stroke: 'rgba(0,0,0,0.4)', 'stroke-width': 0.1, 'paint-order': 'stroke',
      'font-size': Math.min(2.6, Math.max(1.3, width * 0.75)),
      'font-weight': 700, 'font-family': 'system-ui, sans-serif',
      'text-anchor': 'middle', 'dominant-baseline': 'middle',
      transform: !forAnimation
        && normalizeHeading(pose.headingDegrees) > 90
        && normalizeHeading(pose.headingDegrees) < 270
        ? 'rotate(180)'
        : undefined,
    }),
  );
  if (!animation) return art;
  // CSS motion path: the vessel sits at the path start until the scene gets
  // the 'playing' class, then travels the path. offset-rotate aligns the
  // element's x-axis with travel, so the art is pre-rotated +90.
  return element(
    'g',
    {
      'data-animated': 'true',
      'data-vessel-id': vessel.id,
      style:
        `offset-path: path('${animation.pathD}'); offset-rotate: auto; `
        + `--drive-duration: ${fmt(animation.durationSeconds)}s; `
        + `--drive-delay: ${fmt(animation.delaySeconds)}s;`,
    },
    element('g', { transform: 'rotate(90)' }, art),
  );
}

const normalizeHeading = (degrees: number): number => ((degrees % 360) + 360) % 360;

/**
 * Intent line along the vessel's declared course: thin and translucent
 * (it has not happened yet), ending in an arrowhead at the destination.
 */
export function renderMovementArrow(path: MovementPath, color: string, vesselId: string): string {
  const d = pathData(path.segments);
  return element(
    'g',
    { 'data-element': 'movement-arrow', 'data-vessel-id': vesselId },
    element('path', {
      d, fill: 'none', stroke: '#ffffff',
      'stroke-width': 1.0, 'stroke-linecap': 'round', opacity: 0.4,
    }),
    element('path', {
      d, fill: 'none', stroke: color,
      'stroke-width': 0.5, 'stroke-linecap': 'round', opacity: 0.75,
      'data-element': 'intent-line',
    }),
    element('polygon', {
      points: '0,-2 0.95,0.15 -0.95,0.15',
      fill: color, stroke: '#ffffff', 'stroke-width': 0.2, 'paint-order': 'stroke',
      opacity: 0.75,
      transform:
        `translate(${formatPoint(path.end)}) rotate(${fmt(path.endTangentDegrees)})`,
    }),
  );
}

/** Soft band showing water a vessel has already covered. */
export function renderTrail(segments: PathSegment[], color: string, vesselId: string): string {
  const d = pathData(segments);
  return element(
    'g',
    { 'data-element': 'trail', 'data-vessel-id': vesselId },
    element('path', {
      d, fill: 'none', stroke: '#ffffff',
      'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: 0.4,
    }),
    element('path', {
      d, fill: 'none', stroke: color,
      'stroke-width': 0.85, 'stroke-linecap': 'round', opacity: 0.45,
    }),
  );
}

/** A swimmer in the water: head, reaching arms and a small splash ring. */
export function renderSwimmer(position: { x: number; y: number }): string {
  return element(
    'g',
    { transform: `translate(${formatPoint(position)})`, 'data-element': 'swimmer' },
    element('circle', {
      cx: 0, cy: 0, r: 0.9, fill: 'none',
      stroke: '#ffffff', 'stroke-width': 0.14, opacity: 0.55, 'stroke-dasharray': '0.5 0.45',
    }),
    element('line', {
      x1: -0.62, y1: 0.1, x2: 0.62, y2: -0.1,
      stroke: COLORS.swimmer, 'stroke-width': 0.2, 'stroke-linecap': 'round',
    }),
    element('circle', { cx: 0, cy: 0, r: 0.3, fill: '#e3b7a0', stroke: 'rgba(0,0,0,0.3)', 'stroke-width': 0.06 }),
  );
}
