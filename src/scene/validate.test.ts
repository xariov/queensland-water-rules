import { describe, expect, it } from 'vitest';
import { validateScene } from './validate.ts';
import { scenarios } from './scenarios.ts';
import type { Scene } from './model.ts';

const base: Scene = {
  id: 'test',
  title: 'Test scene',
  layout: { kind: 'openWater', width: 100, height: 100 },
  vessels: [],
};

describe('validateScene', () => {
  it('accepts every spike scenario', () => {
    for (const scene of scenarios) {
      expect(validateScene(scene), scene.id).toEqual([]);
    }
  });

  it('rejects a vessel outside the water frame', () => {
    const problems = validateScene({
      ...base,
      vessels: [{ id: 'A', x: 500, y: 0, heading: 0 }],
    });
    expect(problems.join(' ')).toContain('outside the water frame');
  });

  it('rejects duplicate vessel ids and bad labels', () => {
    const problems = validateScene({
      ...base,
      vessels: [
        { id: 'A', x: 0, y: 0, heading: 0 },
        { id: 'A', x: 10, y: 10, heading: 90 },
        { id: 'long', x: -10, y: -10, heading: 45 },
      ],
    });
    expect(problems.join(' ')).toContain("duplicate vessel id 'A'");
    expect(problems.join(' ')).toContain('single capital letters');
  });

  it('rejects headings outside the compass range', () => {
    const problems = validateScene({
      ...base,
      vessels: [{ id: 'A', x: 0, y: 0, heading: 360 }],
    });
    expect(problems.join(' ')).toContain('outside [0, 360)');
  });

  it('rejects sails on a non-sailboat and trawling on a non-trawler', () => {
    const problems = validateScene({
      ...base,
      vessels: [
        { id: 'A', x: 0, y: 0, heading: 0, sails: 'up' },
        { id: 'B', x: 10, y: 10, heading: 0, trawling: true },
      ],
    });
    expect(problems.join(' ')).toContain('declares sails');
    expect(problems.join(' ')).toContain('declares trawling');
  });

  it('rejects an anchored vessel with a movement', () => {
    const problems = validateScene({
      ...base,
      vessels: [{ id: 'A', x: 0, y: 0, heading: 0, anchored: true, movement: { kind: 'straight' } }],
    });
    expect(problems.join(' ')).toContain('cannot also move');
  });

  it('rejects passing astern of an unknown or self vessel', () => {
    const problems = validateScene({
      ...base,
      vessels: [
        { id: 'A', x: 0, y: 0, heading: 0, movement: { kind: 'asternOf', vessel: 'Z' } },
        { id: 'B', x: 10, y: 10, heading: 0, movement: { kind: 'asternOf', vessel: 'B' } },
      ],
    });
    expect(problems.join(' ')).toContain("unknown vessel 'Z'");
    expect(problems.join(' ')).toContain('astern of itself');
  });

  it('rejects unknown mark types and piles on non-lateral marks', () => {
    const problems = validateScene({
      ...base,
      layout: {
        kind: 'openWater', width: 100, height: 100,
        features: [
          { kind: 'mark', id: 'm1', markType: 'sideways' as never, x: 0, y: 0 },
          { kind: 'mark', id: 'm2', markType: 'cardinalNorth', structure: 'pile', x: 10, y: 10 },
        ],
      },
    });
    expect(problems.join(' ')).toContain('unknown markType');
    expect(problems.join(' ')).toContain('only drawn for lateral marks');
  });

  it('rejects a distance ring circling an unknown id', () => {
    const problems = validateScene({
      ...base,
      layout: {
        kind: 'openWater', width: 100, height: 100,
        features: [
          { kind: 'distanceRing', id: 'ring', around: 'Q', radius: 30, label: '30 m' },
        ],
      },
    });
    expect(problems.join(' ')).toContain("unknown id 'Q'");
  });

  it('rejects a jetty on a side with no shore', () => {
    const problems = validateScene({
      ...base,
      layout: {
        kind: 'openWater', width: 100, height: 100,
        features: [{ kind: 'jetty', id: 'j', side: 'south', at: 0, length: 12 }],
      },
    });
    expect(problems.join(' ')).toContain('no shore');
  });

  it('rejects duplicate shores and out-of-range shore depths', () => {
    const problems = validateScene({
      ...base,
      layout: {
        kind: 'openWater', width: 100, height: 100,
        shores: [
          { side: 'south', depth: 20 },
          { side: 'south', depth: 80 },
        ],
      },
    });
    expect(problems.join(' ')).toContain('duplicate shore');
    expect(problems.join(' ')).toContain('depth 80');
  });

  it('requires lights and forbids vessels in a lights view', () => {
    const problems = validateScene({
      ...base,
      layout: { kind: 'lightsView', lights: [] },
      vessels: [{ id: 'A', x: 0, y: 0, heading: 0 }],
    });
    expect(problems.join(' ')).toContain('at least one light');
    expect(problems.join(' ')).toContain('must not declare vessels');
  });

  it('rejects unknown card icons and night cards', () => {
    const problems = validateScene({
      ...base,
      night: true,
      layout: { kind: 'card', icon: 'sextant' as never },
    });
    expect(problems.join(' ')).toContain("unknown icon 'sextant'");
    expect(problems.join(' ')).toContain('do not support night');
  });

  it('rejects a swimmer outside the frame', () => {
    const problems = validateScene({
      ...base,
      swimmers: [{ x: 300, y: 0 }],
    });
    expect(problems.join(' ')).toContain('outside the water frame');
  });
});
