import type { Swimmer, Vessel } from '../scene/model.ts';
import type { Vec } from './geometry.ts';
import type { PathSegment } from './path.ts';

export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface VesselPose {
  position: Vec;
  headingDegrees: number;
}

export interface MovementPath {
  segments: PathSegment[];
  end: Vec;
  endTangentDegrees: number;
}

export interface SwimmerPlacement {
  position: Vec;
}

/** What a layout renderer produces: static drawing plus placement geometry. */
export interface LayoutRender {
  /** The full extent of the drawn layout (the crop never exceeds this). */
  viewBox: ViewBox;
  /**
   * Points that must stay visible when the scene is cropped to its content:
   * marks, jetties, feature extents.
   */
  contentPoints: Vec[];
  /** Horizontal span that must stay visible regardless of content. */
  spanX?: [number, number];
  /** SVG fragments for water, shores, marks and other fixed furniture. */
  surface: string[];
  vesselPose(vessel: Vessel): VesselPose;
  movementPath(vessel: Vessel): MovementPath | null;
  /**
   * Default animation behavior for the vessel: null = do not animate;
   * otherwise the start delay in seconds (a give-way vessel pauses before
   * proceeding, a stand-on vessel does not).
   */
  animationHold(vessel: Vessel): number | null;
  swimmerPlacement(swimmer: Swimmer): SwimmerPlacement;
}
