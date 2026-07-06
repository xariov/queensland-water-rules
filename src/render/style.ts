/** Shared visual constants. All dimensions are meters (scene units). */

export const COLORS = {
  water: '#7ab3d0',
  waterDeep: '#5f9dc0',
  nightWater: '#16233d',
  sand: '#e4d5a8',
  grass: '#a9c988',
  rocks: '#9a958c',
  rockWall: '#8a8578',
  jetty: '#b09a72',
  jettyEdge: '#8c7a5a',
  ramp: '#b5b8bc',
  shallows: '#cfe3d8',
  hullWhite: '#f2f2ee',
  hullBody: ['#f2f2ee', '#d9534f', '#e3a72f', '#3aa05a', '#7a52b8'],
  deck: 'rgba(0,0,0,0.14)',
  sail: '#ffffff',
  swimmer: '#e07840',
  markRed: '#d0342c',
  markGreen: '#1e8a3c',
  markYellow: '#f2c433',
  markBlack: '#26262a',
  markWhite: '#f5f5f2',
  lightRed: '#ff5a4e',
  lightGreen: '#4dff7a',
  lightWhite: '#fff6d8',
  lightYellow: '#ffd94d',
  intent: 'rgba(255,255,255,0.85)',
  ringLine: '#ffffff',
  labelInk: '#1c2b38',
};

export const MARKING = {
  ringWidth: 0.35,
  ringDash: '2.2 2',
  swimLineDash: '1 2.6',
  anchorLineWidth: 0.22,
};

export const BOAT = {
  /** Reference powerboat dimensions; other kinds scale from these. */
  length: 6,
  width: 2.3,
};

/** Assign each vessel a hull color by its index unless it overrides one. */
export function hullColor(index: number, override?: string): string {
  return override ?? COLORS.hullBody[index % COLORS.hullBody.length];
}
