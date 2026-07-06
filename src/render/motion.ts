/**
 * Vessel pose and movement-path geometry shared by the open-water and
 * channel layouts. Positions and headings come straight off the scene
 * model; movement paths are built from the declared movement kind.
 */

import type { Vessel } from '../scene/model.ts';
import type { MovementPath, VesselPose } from './context.ts';
import {
  add, headingToVector, multiply, vec, type Vec,
} from './geometry.ts';
import type { PathSegment } from './path.ts';
import { vesselDimensions } from './vessels.ts';

export function vesselPose(vessel: Vessel): VesselPose {
  return {
    position: vec(vessel.x, vessel.y),
    headingDegrees: vessel.heading,
  };
}

/**
 * Build the declared movement as path segments starting at the vessel's
 * bow line. defaultRun bounds how far a plain 'straight' movement travels
 * (typically a fraction of the water frame).
 */
export function movementPath(
  vessel: Vessel,
  allVessels: Vessel[],
  defaultRun: number,
): MovementPath | null {
  if (!vessel.movement) return null;
  const position = vec(vessel.x, vessel.y);
  const forward = headingToVector(vessel.heading);
  const bow = add(position, multiply(forward, vesselDimensions(vessel).length / 2 + 0.6));

  switch (vessel.movement.kind) {
    case 'straight': {
      const run = vessel.movement.distance ?? defaultRun;
      const end = add(bow, multiply(forward, run));
      return {
        segments: [{ kind: 'line', from: bow, to: end }],
        end,
        endTangentDegrees: vessel.heading,
      };
    }
    case 'turnTo': {
      const target = vessel.movement.heading;
      const outbound = headingToVector(target);
      const lead = Math.max(6, defaultRun * 0.18);
      const runOut = Math.max(10, defaultRun * 0.45);
      const control = add(bow, multiply(forward, lead));
      const turnEnd = add(control, multiply(outbound, lead));
      const end = add(turnEnd, multiply(outbound, runOut));
      const segments: PathSegment[] = [
        { kind: 'quadratic', from: bow, control, to: turnEnd },
        { kind: 'line', from: turnEnd, to: end },
      ];
      return { segments, end, endTangentDegrees: target };
    }
    case 'asternOf': {
      const targetId = vessel.movement.vessel;
      const target = allVessels.find((candidate) => candidate.id === targetId);
      if (!target) return null;
      const targetForward = headingToVector(target.heading);
      const targetStern = add(
        vec(target.x, target.y),
        multiply(targetForward, -(vesselDimensions(target).length / 2 + 6)),
      );
      // Continue a little past the crossing point so the maneuver reads as
      // passing behind, then settling back toward the original course.
      const beyond = add(targetStern, multiply(targetForward, -10));
      const control1 = add(bow, multiply(forward, Math.max(8, defaultRun * 0.25)));
      const control2 = add(targetStern, multiply(targetForward, 4));
      const segments: PathSegment[] = [
        { kind: 'cubic', from: bow, control1, control2, to: beyond },
      ];
      const tangent = Math.atan2(beyond.x - control2.x, -(beyond.y - control2.y)) * 180 / Math.PI;
      return { segments, end: beyond, endTangentDegrees: tangent };
    }
  }
}

/**
 * Default animation delay: anchored and moored vessels never move; a
 * give-way maneuver pauses briefly (assessing) before altering; everything
 * else sets off almost immediately.
 */
export function animationHold(vessel: Vessel): number | null {
  if (vessel.anchored || vessel.moored) return null;
  if (!vessel.movement) return null;
  if (vessel.movement.kind === 'asternOf') return 1.2;
  if (vessel.movement.kind === 'turnTo') return 0.7;
  return 0.2;
}

/** Track a movement's rough extent for the crop, without rendering it. */
export function movementExtent(path: MovementPath): Vec[] {
  const points: Vec[] = [path.end];
  for (const segment of path.segments) {
    if (segment.kind === 'cubic') points.push(segment.control1, segment.control2);
    else if (segment.kind === 'quadratic') points.push(segment.control);
  }
  return points;
}
