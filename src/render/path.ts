/**
 * Structured path segments for vehicle movements and trails. Builders
 * produce typed segments rather than raw SVG path data; this keeps the
 * geometry inspectable and leaves room for animation along the path later,
 * without any DOM path APIs (the renderer stays Node-compatible).
 */

import {
  formatNumber as fmt, formatPoint, pointOnCircle, type Vec,
} from './geometry.ts';

export type PathSegment =
  | { kind: 'line'; from: Vec; to: Vec }
  | { kind: 'quadratic'; from: Vec; control: Vec; to: Vec }
  | { kind: 'cubic'; from: Vec; control1: Vec; control2: Vec; to: Vec }
  /** Clockwise (on screen) circular arc between compass angles. */
  | { kind: 'arc'; center: Vec; radius: number; fromDegrees: number; toDegrees: number };

const arcSweepDegrees = (segment: { fromDegrees: number; toDegrees: number }): number =>
  ((segment.toDegrees - segment.fromDegrees) % 360 + 360) % 360;

export function segmentStart(segment: PathSegment): Vec {
  return segment.kind === 'arc'
    ? pointOnCircle(segment.center, segment.radius, segment.fromDegrees)
    : segment.from;
}

export function segmentEnd(segment: PathSegment): Vec {
  return segment.kind === 'arc'
    ? pointOnCircle(segment.center, segment.radius, segment.toDegrees)
    : segment.to;
}

/** SVG path data for a list of connected segments. */
export function pathData(segments: PathSegment[]): string {
  if (segments.length === 0) return '';
  const parts = [`M ${formatPoint(segmentStart(segments[0]))}`];
  for (const segment of segments) {
    switch (segment.kind) {
      case 'line':
        parts.push(`L ${formatPoint(segment.to)}`);
        break;
      case 'quadratic':
        parts.push(`Q ${formatPoint(segment.control)} ${formatPoint(segment.to)}`);
        break;
      case 'cubic':
        parts.push(
          `C ${formatPoint(segment.control1)} ${formatPoint(segment.control2)} ${formatPoint(segment.to)}`,
        );
        break;
      case 'arc': {
        const sweep = arcSweepDegrees(segment);
        const largeArc = sweep > 180 ? 1 : 0;
        parts.push(
          `A ${fmt(segment.radius)} ${fmt(segment.radius)} 0 ${largeArc} 1 ${formatPoint(segmentEnd(segment))}`,
        );
        break;
      }
    }
  }
  return parts.join(' ');
}

/**
 * Approximate path length for animation timing. Chord-based: exact for
 * lines and arcs, slightly short for beziers - fine for choosing a
 * duration, do not use for geometry.
 */
export function approximatePathLength(segments: PathSegment[]): number {
  let total = 0;
  for (const segment of segments) {
    if (segment.kind === 'arc') {
      total += segment.radius * (arcSweepDegrees(segment) * Math.PI) / 180;
    } else {
      const start = segmentStart(segment);
      const end = segmentEnd(segment);
      const chord = Math.hypot(end.x - start.x, end.y - start.y);
      total += segment.kind === 'line' ? chord : chord * 1.15;
    }
  }
  return total;
}

