/**
 * Scene description model for boating scenarios.
 *
 * Conventions:
 * - Distances are in meters; the renderer owns all scaling.
 * - Positions are {x, y} with x growing east (screen right) and y growing
 *   south (screen down). The origin sits at the center of the water frame.
 * - Headings are compass degrees: 0 = north (screen up), 90 = east,
 *   clockwise. A vessel's heading is the direction its bow points.
 * - Vessel labels are single letters ('A', 'B', ...) drawn on the hull.
 */

export interface Scene {
  id: string;
  title: string;
  /** The question this scene illustrates; shown beside the render. */
  question?: string;
  /**
   * Movements can be played as an animation. Defaults to true; scenes that
   * illustrate a static arrangement can opt out.
   */
  animate?: boolean;
  /** Night-time scene: darkened water, vessels show navigation lights. */
  night?: boolean;
  layout: Layout;
  /** Empty for lightsView and card layouts. */
  vessels: Vessel[];
  swimmers?: Swimmer[];
}

export type Layout = OpenWaterLayout | ChannelLayout | LightsViewLayout | CardLayout;

/**
 * A stretch of open water, optionally bounded by shorelines. Used for
 * give-way encounters, anchoring, distance-off and speed scenarios.
 */
export interface OpenWaterLayout {
  kind: 'openWater';
  /** East-west extent of the water frame, meters. */
  width: number;
  /** North-south extent of the water frame, meters. */
  height: number;
  shores?: Shore[];
  features?: WaterFeature[];
}

export interface Shore {
  side: 'north' | 'south' | 'east' | 'west';
  /** How far the land intrudes into the frame from its side, meters. */
  depth: number;
  /** Beach sand, rocky foreshore, or a built rock wall edge. */
  kind?: 'beach' | 'rocks' | 'built';
}

/**
 * A marked channel running south to north between banks. Lateral marks
 * follow IALA A: returning from seaward (travelling upstream), port marks
 * (red cans) are kept on the vessel's port side.
 */
export interface ChannelLayout {
  kind: 'channel';
  /** North-south extent, meters. */
  length: number;
  /** Navigable water between the banks, meters. */
  channelWidth: number;
  /** Which banks are land. Default 'both'. */
  banks?: 'both' | 'west' | 'east' | 'none';
  /** The upstream (returning from seaward) direction for this channel. */
  upstream: 'north' | 'south';
  features?: WaterFeature[];
}

/**
 * What a skipper sees ahead at night: an arrangement of lights against a
 * dark sea, for reading another vessel's aspect and type. Coordinates are
 * in a nominal 100 x 60 panel, x growing right and y growing down, with
 * the horizon at y = 38.
 */
export interface LightsViewLayout {
  kind: 'lightsView';
  lights: ViewedLight[];
  /** A faint hull outline behind the lights; 'none' hides it entirely. */
  silhouette?: 'powerboat' | 'sailboat' | 'ship' | 'none';
}

export interface ViewedLight {
  color: 'red' | 'green' | 'white' | 'yellow';
  x: number;
  y: number;
  /** Rendered dot size; 'big' for nearer or more prominent lights. */
  size?: 'small' | 'big';
}

/**
 * A pictogram card for knowledge questions that have no on-water scene
 * (equipment, signals, procedures). Keeps every question illustrated.
 */
export interface CardLayout {
  kind: 'card';
  icon: CardIcon;
  /** Caption drawn under the pictogram. */
  label?: string;
  /** Small badge in the corner, e.g. a distance or a count. */
  badge?: string;
}

export type CardIcon =
  | 'lifejacket'
  | 'epirb'
  | 'flare'
  | 'vSheet'
  | 'fireExtinguisher'
  | 'anchor'
  | 'radio'
  | 'fuel'
  | 'firstAid'
  | 'torch'
  | 'chart'
  | 'divingFlag'
  | 'skiFlag'
  | 'checklist'
  | 'weather'
  | 'bar'
  | 'licence'
  | 'registration'
  | 'alcohol'
  | 'pwc'
  | 'killSwitch'
  | 'lifebuoy'
  | 'mayday'
  | 'signalMirror';

export type WaterFeature =
  | Mark
  | SwimArea
  | Jetty
  | BoatRamp
  | DistanceRing
  | Shallows;

export type MarkType =
  | 'lateralPort'
  | 'lateralStarboard'
  | 'cardinalNorth'
  | 'cardinalEast'
  | 'cardinalSouth'
  | 'cardinalWest'
  | 'isolatedDanger'
  | 'safeWater'
  | 'special';

export interface Mark {
  kind: 'mark';
  id: string;
  markType: MarkType;
  /** Floating buoy or fixed pile beacon. Default 'buoy'. */
  structure?: 'buoy' | 'pile';
  x: number;
  y: number;
}

/** A buoyed swimming enclosure, usually against a beach shore. */
export interface SwimArea {
  kind: 'swimArea';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A jetty or pontoon extending from a shore or bank into the water. */
export interface Jetty {
  kind: 'jetty';
  id: string;
  /** Which shore or bank it extends from. */
  side: 'north' | 'south' | 'east' | 'west';
  /** Position along that shore: x for north/south shores, y for east/west. */
  at: number;
  /** How far it extends into the water, meters. */
  length: number;
}

/** A boat ramp cut into a shore or bank. */
export interface BoatRamp {
  kind: 'boatRamp';
  id: string;
  side: 'north' | 'south' | 'east' | 'west';
  at: number;
}

/**
 * A dashed distance circle around a vessel, feature or point, labelled
 * with the distance it illustrates (e.g. '30 m' or '60 m').
 */
export interface DistanceRing {
  kind: 'distanceRing';
  id: string;
  /** A vessel id, a feature id, or a fixed point. */
  around: string | { x: number; y: number };
  radius: number;
  label: string;
}

/** A visible shallow patch or sandbank (the danger a mark warns about). */
export interface Shallows {
  kind: 'shallows';
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface Vessel {
  /** Single-letter hull label: 'A', 'B', ... */
  id: string;
  /** Default 'powerboat'. */
  vesselKind?: 'powerboat' | 'sailboat' | 'pwc' | 'ship' | 'fishingVessel' | 'paddlecraft';
  /**
   * Sailboats only: whether sails are hoisted. A sailboat with sails down
   * that is underway is motoring and meets other vessels as a power vessel.
   * Default 'up'.
   */
  sails?: 'up' | 'down';
  x: number;
  y: number;
  heading: number;
  /** At anchor: rendered with an anchor line; underway rules do not apply. */
  anchored?: boolean;
  /** Tied up at a jetty or bank. */
  moored?: boolean;
  /** Towing a skier or tube behind (affects lookout and PWC questions). */
  towing?: 'skier' | 'tube';
  /** A fishing vessel actively trawling (gear symbol; give-way priority). */
  trawling?: boolean;
  movement?: Movement;
  /** Seconds to wait before the movement animation starts. */
  animationDelay?: number;
  /** Stays put; its movement is drawn as dashed intent only. */
  holding?: boolean;
  /** Overrides the automatic hull color. */
  color?: string;
}

export type Movement =
  /** Continue on the current heading. */
  | { kind: 'straight'; distance?: number }
  /** Turn onto a new heading, then continue. */
  | { kind: 'turnTo'; heading: number }
  /** Give-way maneuver: curve to pass astern of another vessel. */
  | { kind: 'asternOf'; vessel: string };

export interface Swimmer {
  x: number;
  y: number;
}
