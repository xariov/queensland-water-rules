/**
 * The renderer entry point: a pure function from scene data to an SVG
 * string. No DOM, no framework; usable from the browser, Node, or tests.
 */

import type { DistanceRing, Scene } from '../scene/model.ts';
import type { LayoutRender } from './context.ts';
import { element } from './svg.ts';
import { formatNumber as fmt, vec, type Vec } from './geometry.ts';
import { COLORS, hullColor } from './style.ts';
import { renderOpenWater } from './openWater.ts';
import { renderChannel } from './channel.ts';
import { renderLightsView } from './lightsView.ts';
import { renderCard } from './card.ts';
import { renderDistanceRing } from './features.ts';
import {
  renderMovementArrow, renderSwimmer, renderVessel, type VesselAnimation,
} from './vessels.ts';
import {
  approximatePathLength, pathData, segmentEnd, segmentStart, type PathSegment,
} from './path.ts';

function renderLayout(scene: Scene): LayoutRender {
  switch (scene.layout.kind) {
    case 'openWater':
      return renderOpenWater(scene.layout, scene.vessels);
    case 'channel':
      return renderChannel(scene.layout, scene.vessels);
    case 'lightsView':
      return renderLightsView(scene.layout);
    case 'card':
      return renderCard(scene.layout);
  }
}

/** Resolve what a distance ring circles: a vessel, a feature, or a point. */
function ringCenter(ring: DistanceRing, scene: Scene): Vec | null {
  if (typeof ring.around !== 'string') return vec(ring.around.x, ring.around.y);
  const vessel = scene.vessels.find((candidate) => candidate.id === ring.around);
  if (vessel) return vec(vessel.x, vessel.y);
  const features = scene.layout.kind === 'openWater' || scene.layout.kind === 'channel'
    ? scene.layout.features ?? []
    : [];
  for (const feature of features) {
    if (feature.kind !== 'distanceRing' && feature.id === ring.around
      && 'x' in feature && 'y' in feature) {
      return vec(feature.x, feature.y);
    }
  }
  return null;
}

export function renderScene(scene: Scene): string {
  const layout = renderLayout(scene);
  const onWater = scene.layout.kind === 'openWater' || scene.layout.kind === 'channel';

  // Crop the scene to its content (vessels, paths, layout furniture) so
  // the area in focus fills the frame, especially on phones. Each tracked
  // point carries a padding for the artwork around it.
  const padded: { x: number; y: number; pad: number }[] =
    layout.contentPoints.map((point) => ({ ...point, pad: 4 }));
  const track = (point: { x: number; y: number }, pad: number): void => {
    padded.push({ x: point.x, y: point.y, pad });
  };
  const trackSegments = (segments: PathSegment[], pad: number): void => {
    for (const segment of segments) {
      track(segmentStart(segment), pad);
      track(segmentEnd(segment), pad);
      if (segment.kind === 'cubic') {
        track(segment.control1, pad);
        track(segment.control2, pad);
      }
      if (segment.kind === 'quadratic') track(segment.control, pad);
      if (segment.kind === 'arc') {
        track({ x: segment.center.x - segment.radius, y: segment.center.y - segment.radius }, pad);
        track({ x: segment.center.x + segment.radius, y: segment.center.y + segment.radius }, pad);
      }
    }
  };

  // Distance rings draw over the water but under everything that moves;
  // they may circle vessels, so they resolve here where vessels are known.
  const rings: string[] = [];
  if (onWater && scene.layout.kind !== 'lightsView' && scene.layout.kind !== 'card') {
    for (const feature of scene.layout.features ?? []) {
      if (feature.kind !== 'distanceRing') continue;
      const center = ringCenter(feature, scene);
      if (!center) continue;
      rings.push(renderDistanceRing(feature.id, center, feature.radius, feature.label));
      track({ x: center.x - feature.radius, y: center.y - feature.radius }, 3);
      track({ x: center.x + feature.radius, y: center.y + feature.radius }, 3);
    }
  }

  const swimmers = (scene.swimmers ?? []).map((swimmer) => {
    const placement = layout.swimmerPlacement(swimmer);
    track(placement.position, 4);
    return renderSwimmer(placement.position);
  });

  const boats: string[] = [];
  const arrows: string[] = [];
  scene.vessels.forEach((vessel, index) => {
    const color = hullColor(index, vessel.color);
    const pose = layout.vesselPose(vessel);
    const path = layout.movementPath(vessel);
    track(pose.position, 9);
    if (path) trackSegments(path.segments, 5);

    // Movements animate by default; scenes can opt out with animate: false,
    // a vessel can hold (intent shown but not travelled), and anchored or
    // moored vessels stay put (animationHold null).
    let animation: VesselAnimation | undefined;
    const hold = layout.animationHold(vessel);
    if (scene.animate !== false && path && hold !== null && vessel.holding !== true) {
      // The motion path starts at the vessel's center so playback begins
      // exactly where the vessel rests.
      const segments: PathSegment[] = [
        { kind: 'line', from: pose.position, to: segmentStart(path.segments[0]) },
        ...path.segments,
      ];
      const length = approximatePathLength(segments);
      animation = {
        pathD: pathData(segments),
        durationSeconds: Math.min(8, Math.max(2.5, length / 6)),
        delaySeconds: vessel.animationDelay ?? hold,
      };
    }
    boats.push(renderVessel(vessel, pose, color, animation, scene.night === true));
    if (path) arrows.push(renderMovementArrow(path, color, vessel.id));
  });

  // Resolve the crop: content bounds, a minimum size so small scenes do
  // not over-zoom, clamped to the layout's full extent.
  const full = layout.viewBox;
  if (padded.length === 0) {
    padded.push(
      { x: full.minX, y: full.minY, pad: 0 },
      { x: full.minX + full.width, y: full.minY + full.height, pad: 0 },
    );
  }
  let minX = Math.min(...padded.map((point) => point.x - point.pad));
  let maxX = Math.max(...padded.map((point) => point.x + point.pad));
  let minY = Math.min(...padded.map((point) => point.y - point.pad));
  let maxY = Math.max(...padded.map((point) => point.y + point.pad));
  if (layout.spanX) {
    minX = Math.min(minX, layout.spanX[0]);
    maxX = Math.max(maxX, layout.spanX[1]);
  }
  const MIN_SPAN = 30;
  if (maxX - minX < MIN_SPAN) {
    const middle = (minX + maxX) / 2;
    minX = middle - MIN_SPAN / 2;
    maxX = middle + MIN_SPAN / 2;
  }
  if (maxY - minY < MIN_SPAN) {
    const middle = (minY + maxY) / 2;
    minY = middle - MIN_SPAN / 2;
    maxY = middle + MIN_SPAN / 2;
  }
  const viewBox = {
    minX: Math.max(full.minX, minX),
    minY: Math.max(full.minY, minY),
    width: 0,
    height: 0,
  };
  viewBox.width = Math.min(full.minX + full.width, maxX) - viewBox.minX;
  viewBox.height = Math.min(full.minY + full.height, maxY) - viewBox.minY;

  // Vessels draw last so they are never hidden under intent lines.
  return element(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: `${fmt(viewBox.minX)} ${fmt(viewBox.minY)} ${fmt(viewBox.width)} ${fmt(viewBox.height)}`,
      role: 'img',
      'aria-label': scene.title,
      'data-scene-id': scene.id,
    },
    element('rect', {
      x: fmt(viewBox.minX), y: fmt(viewBox.minY),
      width: fmt(viewBox.width), height: fmt(viewBox.height),
      fill: onWater ? COLORS.water : 'none',
    }),
    ...layout.surface,
    ...rings,
    ...arrows,
    // Night on the water: darken everything below; vessels render above
    // showing their navigation lights.
    ...(scene.night === true && onWater
      ? [element('rect', {
        x: fmt(viewBox.minX), y: fmt(viewBox.minY),
        width: fmt(viewBox.width), height: fmt(viewBox.height),
        fill: '#0a1836', opacity: 0.52, 'data-element': 'night',
      })]
      : []),
    ...swimmers,
    ...boats,
  );
}
