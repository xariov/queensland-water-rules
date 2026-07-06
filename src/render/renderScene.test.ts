import { describe, expect, it } from 'vitest';
import { renderScene } from './renderScene.ts';
import { scenarios } from '../scene/scenarios.ts';
import type { Scene } from '../scene/model.ts';

const openWater = (partial: Partial<Scene>): Scene => ({
  id: 'test',
  title: 'Test scene',
  layout: { kind: 'openWater', width: 120, height: 100 },
  vessels: [],
  ...partial,
});

describe('renderScene', () => {
  it('renders every spike scenario to an svg string', () => {
    for (const scene of scenarios) {
      const svg = renderScene(scene);
      expect(svg.startsWith('<svg '), scene.id).toBe(true);
      expect(svg, scene.id).toContain(`data-scene-id="${scene.id}"`);
    }
  });

  it('draws each vessel with its id and label', () => {
    const svg = renderScene(openWater({
      vessels: [
        { id: 'A', x: -20, y: 0, heading: 90 },
        { id: 'B', vesselKind: 'sailboat', x: 20, y: 10, heading: 200 },
      ],
    }));
    expect(svg).toContain('data-vessel-id="A"');
    expect(svg).toContain('data-vessel-id="B"');
    expect(svg).toContain('data-kind="sailboat"');
    expect(svg).toContain('data-element="sail"');
  });

  it('animates a vessel with a movement by default', () => {
    const svg = renderScene(openWater({
      vessels: [{ id: 'A', x: 0, y: 0, heading: 0, movement: { kind: 'straight', distance: 40 } }],
    }));
    expect(svg).toContain('data-animated="true"');
    expect(svg).toContain('offset-path');
    expect(svg).toContain('--drive-duration');
    expect(svg).toContain('data-element="movement-arrow"');
  });

  it('does not animate when the scene opts out or the vessel holds', () => {
    const still = renderScene(openWater({
      animate: false,
      vessels: [{ id: 'A', x: 0, y: 0, heading: 0, movement: { kind: 'straight', distance: 40 } }],
    }));
    expect(still).not.toContain('data-animated');
    expect(still).toContain('data-element="movement-arrow"');

    const holding = renderScene(openWater({
      vessels: [{ id: 'A', x: 0, y: 0, heading: 0, holding: true, movement: { kind: 'straight', distance: 40 } }],
    }));
    expect(holding).not.toContain('data-animated');
  });

  it('never animates an anchored vessel', () => {
    const svg = renderScene(openWater({
      vessels: [{ id: 'A', x: 0, y: 0, heading: 0, anchored: true }],
    }));
    expect(svg).not.toContain('data-animated');
    expect(svg).toContain('data-element="anchor"');
  });

  it('shows navigation lights only at night', () => {
    const vessels = [{ id: 'A', x: 0, y: 0, heading: 0, movement: { kind: 'straight' as const } }];
    const day = renderScene(openWater({ vessels }));
    const night = renderScene(openWater({ vessels, night: true }));
    expect(night).toContain('data-element="night"');
    expect(day).not.toContain('data-element="night"');
  });

  it('an anchored vessel at night shows a single all-round light', () => {
    const svg = renderScene(openWater({
      night: true,
      vessels: [{ id: 'A', x: 0, y: 0, heading: 0, anchored: true }],
    }));
    // One glow stack (three circles) rather than the underway set of three
    // or four light positions.
    const glows = svg.match(/stroke-width="0.06"/g) ?? [];
    expect(glows.length).toBe(1);
  });

  it('draws distance rings around vessels and fixed points', () => {
    const svg = renderScene(openWater({
      layout: {
        kind: 'openWater', width: 160, height: 140,
        features: [
          { kind: 'distanceRing', id: 'ring-a', around: 'A', radius: 30, label: '30 m' },
          { kind: 'distanceRing', id: 'ring-p', around: { x: 30, y: 30 }, radius: 20, label: '20 m' },
        ],
      },
      vessels: [{ id: 'A', x: -20, y: -20, heading: 45 }],
    }));
    expect(svg).toContain('data-feature-id="ring-a"');
    expect(svg).toContain('data-feature-id="ring-p"');
    expect(svg).toContain('30 m');
  });

  it('draws marks with their type attributes', () => {
    const svg = renderScene(openWater({
      layout: {
        kind: 'openWater', width: 120, height: 100,
        features: [
          { kind: 'mark', id: 'north', markType: 'cardinalNorth', x: 0, y: -20 },
          { kind: 'mark', id: 'port', markType: 'lateralPort', structure: 'pile', x: 20, y: 20 },
        ],
      },
    }));
    expect(svg).toContain('data-mark-type="cardinalNorth"');
    expect(svg).toContain('data-mark-type="lateralPort"');
  });

  it('draws swimmers', () => {
    const svg = renderScene(openWater({ swimmers: [{ x: 5, y: 5 }] }));
    expect(svg).toContain('data-element="swimmer"');
  });

  it('renders a towed skier and trawl gear', () => {
    const svg = renderScene(openWater({
      vessels: [
        { id: 'A', x: -20, y: -20, heading: 0, towing: 'skier' },
        { id: 'B', vesselKind: 'fishingVessel', trawling: true, x: 25, y: 20, heading: 180 },
      ],
    }));
    expect(svg).toContain('data-element="trawl-net"');
  });

  it('renders the lights view with glowing dots and a silhouette', () => {
    const svg = renderScene({
      id: 'lights',
      title: 'Lights ahead',
      layout: {
        kind: 'lightsView',
        silhouette: 'ship',
        lights: [
          { color: 'red', x: 40, y: 30 },
          { color: 'white', x: 50, y: 20, size: 'big' },
        ],
      },
      vessels: [],
    });
    expect(svg).toContain('data-element="viewed-light"');
    expect(svg).toContain('data-color="red"');
    expect(svg).toContain('data-element="silhouette"');
  });

  it('renders cards with icon, label and badge', () => {
    const svg = renderScene({
      id: 'card',
      title: 'Equipment card',
      layout: { kind: 'card', icon: 'epirb', label: 'Registered 406 MHz EPIRB', badge: '2 nm' },
      vessels: [],
    });
    expect(svg).toContain('data-icon="epirb"');
    expect(svg).toContain('Registered 406 MHz EPIRB');
    expect(svg).toContain('data-element="card-badge"');
  });

  it('crops the viewBox to the scene content', () => {
    const svg = renderScene(openWater({
      layout: { kind: 'openWater', width: 400, height: 400 },
      vessels: [{ id: 'A', x: 0, y: 0, heading: 0 }],
    }));
    const viewBox = /viewBox="([^"]+)"/.exec(svg)![1].split(' ').map(Number);
    expect(viewBox[2]).toBeLessThan(400);
    expect(viewBox[3]).toBeLessThan(400);
  });

  it('keeps the channel water span visible', () => {
    const svg = renderScene({
      id: 'chan',
      title: 'Channel',
      layout: { kind: 'channel', length: 150, channelWidth: 40, upstream: 'north' },
      vessels: [{ id: 'A', x: 10, y: 0, heading: 0 }],
    });
    const viewBox = /viewBox="([^"]+)"/.exec(svg)![1].split(' ').map(Number);
    expect(viewBox[2]).toBeGreaterThanOrEqual(40);
    expect(svg).toContain('data-element="channel-water"');
  });
});
