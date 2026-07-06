import { describe, expect, it } from 'vitest';
import { pathData, segmentEnd, segmentStart, type PathSegment } from './path.ts';
import { vec } from './geometry.ts';

describe('pathData', () => {
  it('emits move, line, quadratic and arc commands', () => {
    const segments: PathSegment[] = [
      { kind: 'line', from: vec(0, 10), to: vec(0, 0) },
      { kind: 'quadratic', from: vec(0, 0), control: vec(0, -5), to: vec(5, -5) },
      { kind: 'arc', center: vec(0, 0), radius: 8, fromDegrees: 90, toDegrees: 180 },
    ];
    const d = pathData(segments);
    expect(d).toMatch(/^M 0,10 L 0,0 Q /);
    expect(d).toContain('A 8 8 0 0 1');
  });

  it('marks arcs sweeping more than 180 degrees as large arcs', () => {
    const nearFullLoop: PathSegment = {
      kind: 'arc', center: vec(0, 0), radius: 8, fromDegrees: 194, toDegrees: 166,
    };
    expect(pathData([nearFullLoop])).toContain('A 8 8 0 1 1');
  });
});

describe('segment endpoints', () => {
  it('computes arc endpoints from compass angles', () => {
    const quarter: PathSegment = {
      kind: 'arc', center: vec(0, 0), radius: 10, fromDegrees: 0, toDegrees: 90,
    };
    expect(segmentStart(quarter).y).toBeCloseTo(-10, 5);
    expect(segmentEnd(quarter).x).toBeCloseTo(10, 5);
  });
});
