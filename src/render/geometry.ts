/**
 * Plane geometry in screen coordinates (x right, y down) with compass
 * headings (0 = north/up, 90 = east/right, clockwise positive).
 */

export interface Vec {
  x: number;
  y: number;
}

export const vec = (x: number, y: number): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => vec(a.x + b.x, a.y + b.y);
export const subtract = (a: Vec, b: Vec): Vec => vec(a.x - b.x, a.y - b.y);
export const multiply = (a: Vec, k: number): Vec => vec(a.x * k, a.y * k);
export const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y;

/** Unit vector for a compass heading. North (0) points up: (0, -1). */
export function headingToVector(headingDegrees: number): Vec {
  const radians = (headingDegrees * Math.PI) / 180;
  return vec(Math.sin(radians), -Math.cos(radians));
}

/** Unit vector pointing left relative to a direction of travel. */
export const leftOf = (headingDegrees: number): Vec => headingToVector(headingDegrees - 90);

/** Unit vector pointing right relative to a direction of travel. */
export const rightOf = (headingDegrees: number): Vec => headingToVector(headingDegrees + 90);

/** Point on a circle at a compass angle, measured from the circle center. */
export function pointOnCircle(center: Vec, radius: number, compassDegrees: number): Vec {
  return add(center, multiply(headingToVector(compassDegrees), radius));
}

/**
 * Tangent direction (compass degrees) of clockwise travel around a circle,
 * at the point given by a compass angle. Clockwise viewed on screen means
 * the compass angle of the position increases.
 */
export function clockwiseTangent(compassDegrees: number): number {
  return compassDegrees + 90;
}

/**
 * Intersection of two infinite lines given as point + direction.
 * Returns null when the lines are (near) parallel.
 */
export function lineIntersection(p: Vec, pDir: Vec, q: Vec, qDir: Vec): Vec | null {
  const cross = pDir.x * qDir.y - pDir.y * qDir.x;
  if (Math.abs(cross) < 1e-9) return null;
  const t = ((q.x - p.x) * qDir.y - (q.y - p.y) * qDir.x) / cross;
  return add(p, multiply(pDir, t));
}

/** Normalize an angle difference to (-180, 180]. */
export function angleDifference(fromDegrees: number, toDegrees: number): number {
  let difference = (toDegrees - fromDegrees) % 360;
  if (difference <= -180) difference += 360;
  if (difference > 180) difference -= 360;
  return difference;
}

export const formatNumber = (n: number): string =>
  String(Math.round(n * 100) / 100);

export const formatPoint = (p: Vec): string => `${formatNumber(p.x)},${formatNumber(p.y)}`;
