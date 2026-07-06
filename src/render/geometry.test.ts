import { describe, expect, it } from 'vitest';
import {
  angleDifference, clockwiseTangent, headingToVector, leftOf, lineIntersection,
  pointOnCircle, rightOf, vec,
} from './geometry.ts';

const expectVecClose = (actual: { x: number; y: number }, expected: { x: number; y: number }) => {
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
};

describe('headingToVector', () => {
  it('maps compass cardinal directions to screen vectors (y down)', () => {
    expectVecClose(headingToVector(0), vec(0, -1));
    expectVecClose(headingToVector(90), vec(1, 0));
    expectVecClose(headingToVector(180), vec(0, 1));
    expectVecClose(headingToVector(270), vec(-1, 0));
  });
});

describe('left-hand traffic helpers', () => {
  it('left of northbound travel is west', () => {
    expectVecClose(leftOf(0), vec(-1, 0));
  });
  it('left of southbound travel is east', () => {
    expectVecClose(leftOf(180), vec(1, 0));
  });
  it('right of eastbound travel is south', () => {
    expectVecClose(rightOf(90), vec(0, 1));
  });
});

describe('clockwiseTangent', () => {
  it('a vehicle at the east point of a roundabout travels south', () => {
    expect(clockwiseTangent(90)).toBe(180);
  });
  it('a vehicle at the south point travels west', () => {
    expect(clockwiseTangent(180)).toBe(270);
  });
});

describe('pointOnCircle', () => {
  it('places compass angles on screen correctly', () => {
    expectVecClose(pointOnCircle(vec(0, 0), 10, 0), vec(0, -10));
    expectVecClose(pointOnCircle(vec(0, 0), 10, 90), vec(10, 0));
  });
});

describe('lineIntersection', () => {
  it('finds the crossing of perpendicular lines', () => {
    const point = lineIntersection(vec(0, 5), vec(1, 0), vec(3, 0), vec(0, 1));
    expectVecClose(point!, vec(3, 5));
  });
  it('returns null for parallel lines', () => {
    expect(lineIntersection(vec(0, 0), vec(1, 0), vec(0, 5), vec(-1, 0))).toBeNull();
  });
});

describe('angleDifference', () => {
  it('positive for a right turn, negative for a left turn', () => {
    expect(angleDifference(0, 90)).toBe(90);
    expect(angleDifference(0, 270)).toBe(-90);
    expect(angleDifference(350, 10)).toBe(20);
  });
});
