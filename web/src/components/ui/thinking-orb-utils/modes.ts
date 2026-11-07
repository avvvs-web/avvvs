import type { ThinkingOrbMode } from './types';

// The geometry of each orb. A mode returns points (and optional links) in a unit sphere's space,
// x right, y up, z towards the viewer; base-orb rotates, projects and draws them.

export interface P { x: number; y: number; z: number; a?: number; r?: number }
export interface Frame { points: P[]; links?: [P, P, number][]; rotate?: boolean; tilt?: number }
export type Mode = (t: number, state: Record<string, unknown>) => Frame;

const TAU = Math.PI * 2;

/** evenly spread points on a sphere */
function fibonacci(n: number, a = 0.16): P[] {
  const out: P[] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    out.push({ x: Math.cos(g * i) * r, y, z: Math.sin(g * i) * r, a, r: 0.7 });
  }
  return out;
}
const GHOST = fibonacci(110);

function rotX(p: P, a: number): P { const c = Math.cos(a), s = Math.sin(a); return { ...p, y: p.y * c - p.z * s, z: p.y * s + p.z * c }; }
function rotZ(p: P, a: number): P { const c = Math.cos(a), s = Math.sin(a); return { ...p, x: p.x * c - p.y * s, y: p.x * s + p.y * c }; }
function rotY(p: P, a: number): P { const c = Math.cos(a), s = Math.sin(a); return { ...p, x: p.x * c + p.z * s, z: -p.x * s + p.z * c }; }
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

const orbits: Mode = (t) => {
  const pts: P[] = [...GHOST];
  const tilts = [[0.5, 0.2], [-0.6, 1.2], [1.1, -0.7]];
  tilts.forEach(([tx, tz], k) => {
    for (let i = 0; i < 64; i++) {
      const th = (i / 64) * TAU;
      pts.push(rotZ(rotX({ x: Math.cos(th) * 1.02, y: 0, z: Math.sin(th) * 1.02, a: 0.14, r: 0.6 }, tx), tz));
    }
    for (let i = 0; i < 6; i++) {
      const th = (i / 6) * TAU + t * (0.7 + k * 0.25) * (k % 2 ? -1 : 1);
      pts.push(rotZ(rotX({ x: Math.cos(th) * 1.02, y: 0, z: Math.sin(th) * 1.02, a: 1, r: 1.6 }, tx), tz));
    }
  });
  return { points: pts, rotate: true };
};

const globe: Mode = (t) => {
  const band = (t * 0.9) % TAU;
  const pts = fibonacci(320, 0.22).map((p) => {
    const lon = Math.atan2(p.z, p.x);
    const d = Math.abs(((lon - band + Math.PI * 3) % TAU) - Math.PI);
    const lit = Math.max(0, 1 - d / 0.45);
    return { ...p, a: 0.18 + lit * 0.82, r: 0.7 + lit * 0.9 };
  });
  return { points: pts, rotate: true };
};

const rubik: Mode = (t, st) => {
  if (!st.cube) {
    const c: P[] = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
      for (let s = 0; s < 4; s++) c.push({ x: x * 0.62 + (s % 2 ? 0.14 : -0.14), y: y * 0.62 + (s < 2 ? 0.14 : -0.14), z: z * 0.62, a: 0.85, r: 1 });
    st.cube = c; st.step = -1;
  }
  const STEP = 1.1;
  const n = Math.floor(t / STEP);
  const axes = ['x', 'y', 'z'] as const;
  const pick = (i: number) => ({ axis: axes[(i * 7 + 1) % 3], layer: ((i * 5) % 3) - 1, dir: i % 2 ? 1 : -1 });
  let cube = st.cube as P[];
  while ((st.step as number) < n - 1) {           // bake finished turns
    st.step = (st.step as number) + 1;
    const m = pick(st.step as number);
    cube = cube.map((p) => turn(p, m.axis, m.layer, (Math.PI / 2) * m.dir));
    st.cube = cube;
  }
  const m = pick(n);
  const k = ease(Math.min(1, (t / STEP - n) / 0.7));
  const pts = cube.map((p) => turn(p, m.axis, m.layer, (Math.PI / 2) * m.dir * k));
  return { points: pts.map((p) => { const l = Math.hypot(p.x, p.y, p.z) || 1; const f = 0.55 + 0.45 / l; return { ...p, x: p.x * f, y: p.y * f, z: p.z * f }; }), rotate: true };
};
function turn(p: P, axis: 'x' | 'y' | 'z', layer: number, ang: number): P {
  const v = axis === 'x' ? p.x : axis === 'y' ? p.y : p.z;
  if (Math.round(v / 0.62) !== layer) return p;
  return axis === 'x' ? rotX(p, ang) : axis === 'y' ? rotY(p, ang) : rotZ(p, ang);
}

const wave: Mode = (t) => {
  const pts: P[] = [];
  for (let j = 1; j < 12; j++) {
    const lat = -Math.PI / 2 + (j / 12) * Math.PI;
    const breathe = 1 + 0.09 * Math.sin(t * 2.1 + j * 0.7) + 0.05 * Math.sin(t * 3.3 - j * 1.1);
    const rr = Math.cos(lat) * breathe, y = Math.sin(lat);
    const n = Math.max(12, Math.round(56 * Math.cos(lat)));
    for (let i = 0; i < n; i++) { const th = (i / n) * TAU; pts.push({ x: Math.cos(th) * rr, y, z: Math.sin(th) * rr, a: 0.8, r: 0.9 }); }
  }
  return { points: pts, rotate: true, tilt: 0.45 };
};

const web: Mode = (t, st) => {
  if (!st.nodes) st.nodes = Array.from({ length: 30 }, (_, i) => ({ lon: (i * 2.39996) % TAU, lat: Math.asin(1 - (2 * (i + 0.5)) / 30), w: 0.2 + ((i * 37) % 10) / 25 }));
  const nodes = (st.nodes as { lon: number; lat: number; w: number }[]).map((n, i) => {
    const lat = n.lat + 0.18 * Math.sin(t * n.w + i), lon = n.lon + 0.25 * Math.sin(t * n.w * 0.7 + i * 2);
    return { x: Math.cos(lat) * Math.cos(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.sin(lon), a: 1, r: 1.5 };
  });
  const links: [P, P, number][] = [];
  const pts: P[] = [...nodes];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y, nodes[i].z - nodes[j].z);
    if (d < 0.72) {
      links.push([nodes[i], nodes[j], (1 - d / 0.72) * 0.55]);
      if ((i + j) % 5 === 0) {                     // a signal travelling the link
        const k = (t * 0.8 + (i * 0.13)) % 1;
        pts.push({ x: nodes[i].x + (nodes[j].x - nodes[i].x) * k, y: nodes[i].y + (nodes[j].y - nodes[i].y) * k, z: nodes[i].z + (nodes[j].z - nodes[i].z) * k, a: 1, r: 1.3 });
      }
    }
  }
  return { points: pts, links, rotate: true };
};

const braid: Mode = (t) => {
  const pts: P[] = [...GHOST];
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i <= 90; i++) {
      const s = i / 90, y = -0.96 + s * 1.92;
      const ang = s * TAU * 1.5 + t * 1.1 + (k * TAU) / 3;
      const rr = 0.5 * Math.sqrt(Math.max(0, 1 - y * y)) + 0.08;
      const glow = 0.5 + 0.5 * Math.sin(s * TAU * 2 - t * 3 + k);
      pts.push({ x: Math.cos(ang) * rr, y, z: Math.sin(ang) * rr, a: 0.45 + glow * 0.55, r: 0.9 + glow * 0.7 });
    }
  }
  return { points: pts, rotate: true, tilt: 0.2 };
};

const ribbon: Mode = (t) => {
  const pts: P[] = [...GHOST];
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 110; i++) {
      const ph = (i / 110) * TAU;
      const y = 0.22 * Math.sin(ph * 3 + t * 1.8) + (j - 2) * 0.09;
      const v = { x: Math.cos(ph), y, z: Math.sin(ph) };
      const l = Math.hypot(v.x, v.y, v.z);
      pts.push({ x: v.x / l, y: v.y / l, z: v.z / l, a: 0.95 - Math.abs(j - 2) * 0.18, r: 1 });
    }
  }
  return { points: pts, rotate: true, tilt: 0.35 };
};

const ring: Mode = (t) => {
  const pts: P[] = [];
  for (const [rad, n, amp] of [[0.86, 96, 0.06], [0.62, 72, 0.08], [0.38, 48, 0.1]] as const) {
    for (let i = 0; i < n; i++) {
      const ph = (i / n) * TAU;
      const rr = rad * (1 + amp * Math.sin(ph * 6 - t * 2.6) + 0.04 * Math.sin(t * 1.4));
      pts.push({ x: Math.cos(ph) * rr, y: Math.sin(ph) * rr, z: 0.6, a: 0.55 + 0.45 * Math.sin(ph * 3 - t * 2), r: 1 });
    }
  }
  return { points: pts, rotate: false };
};

const morph: Mode = (t) => {
  const N = 90;
  const shapes = [circlePt, polyPt(3), polyPt(4)];
  const cyc = t / 1.6, a = Math.floor(cyc) % 3, b = (a + 1) % 3, k = ease(Math.min(1, (cyc % 1) / 0.6));
  const pts: P[] = [];
  for (let i = 0; i < N; i++) {
    const s = i / N, p = shapes[a](s), q = shapes[b](s);
    pts.push({ x: (p[0] + (q[0] - p[0]) * k) * 0.9, y: (p[1] + (q[1] - p[1]) * k) * 0.9, z: 0.6, a: 0.9, r: 1.1 });
  }
  return { points: pts.map((p) => rotZ(p, t * 0.25)), rotate: false };
};
function circlePt(s: number): [number, number] { return [Math.cos(s * TAU - Math.PI / 2), Math.sin(s * TAU - Math.PI / 2)]; }
function polyPt(n: number) {
  return (s: number): [number, number] => {
    const e = Math.floor(s * n), f = s * n - e;
    const a0 = (e / n) * TAU - Math.PI / 2, a1 = ((e + 1) / n) * TAU - Math.PI / 2;
    return [Math.cos(a0) + (Math.cos(a1) - Math.cos(a0)) * f, Math.sin(a0) + (Math.sin(a1) - Math.sin(a0)) * f];
  };
}

export const MODES: Record<ThinkingOrbMode, Mode> = { orbits, globe, rubik, wave, web, braid, ribbon, ring, morph };
export { rotX, rotY };
