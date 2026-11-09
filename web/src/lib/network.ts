import * as THREE from 'three';

// The film's final move, live. The film ends on a gold thread leaving the frame at the bottom
// left; here it carries straight on. On wide screens it runs down the left edge, turns, and
// becomes one level gold line beneath the AVVVS mark; each of the five destinations hangs from
// that line on a short drop ending in a bead. On narrow screens it comes in from the right and
// runs down the right edge, with a bead beside each destination.
// The thread is two fibres twisted together: they catch light on the front of the twist and
// darken behind it. Scrolling draws it out; light travels along it; hovering a destination
// brightens its drop. Everything is in CSS pixels so it lines up exactly with the DOM blocks.

const VERT = /* glsl */ `
  attribute vec2 aNormal;
  attribute float aT;
  attribute float aSide;
  uniform float uTime, uPhase, uAmp, uHalf, uLen, uHot, uSeed, uFray, uSway;
  varying float vT, vSide, vDepth;
  void main() {
    float ang = uPhase + aT * uLen * 0.05 + uTime * 0.35;
    float fray = smoothstep(0.9, 1.0, aT) * uFray;
    float amp = uAmp * (1.0 + uHot * 0.7) + fray * (2.2 + 1.4 * sin(uPhase * 2.3));
    // the whole thread breathes a little, most in its middle, never at its ends
    float sway = sin(uTime * 0.45 + aT * 3.5 + uSeed * 6.0) * 4.0 * aT * (1.0 - aT) * 4.0 * uSway;
    vec2 off = aNormal * (amp * sin(ang) + sway + aSide * uHalf);
    vDepth = cos(ang); vT = aT; vSide = aSide;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy + off, 0.0, 1.0);
  }
`;
const FRAG = /* glsl */ `
  uniform float uReveal, uTime, uHot, uSeed, uGlow;
  uniform vec3 uBack, uFront, uHi;
  varying float vT, vSide, vDepth;
  void main() {
    if (vT > uReveal) discard;
    float edge = 1.0 - abs(vSide);
    float head = smoothstep(uReveal - 0.035, uReveal, vT) * step(uReveal, 0.999);
    if (uGlow > 0.5) {
      // a soft warm sheen under the thread, so it reads as lit metal on ivory
      gl_FragColor = vec4(uHi, edge * edge * (0.13 + 0.12 * uHot + 0.25 * head));
      return;
    }
    float d = vDepth * 0.5 + 0.5;
    vec3 col = mix(uBack, uFront, d);
    float pulse = smoothstep(0.05, 0.0, abs(fract(uTime * (0.07 + 0.08 * uHot) + uSeed) - vT));
    col = mix(col, uHi, clamp(pulse * 0.85 + head + uHot * 0.25 * d, 0.0, 1.0));
    float a = smoothstep(0.0, 0.7, edge) * (0.45 + 0.55 * d);
    gl_FragColor = vec4(col, a);
  }
`;

const FIBRES = [0, Math.PI]; // two fibres, twisted around each other
const V = (x: number, y: number) => new THREE.Vector3(x, y, 0);
const COLORS = { back: '#6E4C1C', front: '#B98B3F', hi: "#E9C67E" };

// a flat strip along a curve: two vertices per sample, one either side of the spine
function strip(curve: THREE.Curve<THREE.Vector3>, samples: number) {
  const pos = new Float32Array((samples + 1) * 2 * 3);
  const nrm = new Float32Array((samples + 1) * 2 * 2);
  const ts = new Float32Array((samples + 1) * 2);
  const side = new Float32Array((samples + 1) * 2);
  const idx: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const g = curve.getTangentAt(t);
    const nx = -g.y, ny = g.x;
    for (let s = 0; s < 2; s++) {
      const k = i * 2 + s;
      pos.set([p.x, p.y, 0], k * 3);
      nrm.set([nx, ny], k * 2);
      ts[k] = t;
      side[k] = s ? 1 : -1;
    }
    if (i < samples) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aNormal', new THREE.BufferAttribute(nrm, 2));
  geo.setAttribute('aT', new THREE.BufferAttribute(ts, 1));
  geo.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
  geo.setIndex(idx);
  return geo;
}

export interface Network { setActive(on: boolean): void; setReveal(p: number): void; dispose(): void }

interface Landing { dest: number; at: number; bead: THREE.Mesh } // where along a path (0-1) a destination is reached
interface ThreadPath { meshes: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>[]; geo: THREE.BufferGeometry; dest: number; from: number; to: number; landings: Landing[] }

export function startNetwork(section: HTMLElement, { reduced = false } = {}): Network {
  const canvas = section.querySelector<HTMLCanvasElement>('.eco-canvas');
  if (!canvas) return { setActive() {}, setReveal() {}, dispose() {} };
  const mark = section.querySelector<HTMLElement>('.eco-mark');
  const dests = [...section.querySelectorAll<HTMLElement>('.dest')];
  if (!dests.length) return { setActive() {}, setReveal() {}, dispose() {} };

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false });
  } catch {
    // Graceful 2D canvas fallback when WebGL is unavailable
    return start2DFallback(canvas, section, dests, { reduced });
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  const paths: ThreadPath[] = []; // dest is the destination index, or -1 for the trunk
  const hot = dests.map(() => 0);
  const heat = dests.map(() => 0);
  let progress = reduced ? 1 : 0;
  let running = false;
  let disposed = false;
  let raf = 0;
  const colors = {
    back: new THREE.Color(COLORS.back), front: new THREE.Color(COLORS.front), hi: new THREE.Color(COLORS.hi),
  };

  const onContextLost = (e: Event) => {
    e.preventDefault();
    running = false;
    cancelAnimationFrame(raf);
  };
  const onContextRestored = () => {
    rebuild();
    if (running) raf = requestAnimationFrame(frame);
  };
  canvas.addEventListener('webglcontextlost', onContextLost, false);
  canvas.addEventListener('webglcontextrestored', onContextRestored, false);

  dests.forEach((d, i) => {
    d.addEventListener('pointerenter', () => (hot[i] = 1));
    d.addEventListener('pointerleave', () => (hot[i] = 0));
    d.addEventListener('focusin', () => (hot[i] = 1));
    d.addEventListener('focusout', () => (hot[i] = 0));
  });

  function addPath(curve: THREE.Curve<THREE.Vector3>, { dest, seed, fray, from, to }: { dest: number; seed: number; fray: number; from: number; to: number }) {
    const len = curve.getLength();
    const geo = strip(curve, Math.max(60, Math.round(len / 3)));
    const meshes: ThreadPath['meshes'] = [];
    const make = (glow: boolean, phase: number, half: number, amp: number) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false,
        side: THREE.DoubleSide, // y runs downward to match CSS pixels, which flips winding
        uniforms: {
          uTime: { value: 0 }, uPhase: { value: phase }, uAmp: { value: amp }, uHalf: { value: half },
          uLen: { value: len }, uHot: { value: 0 }, uSeed: { value: seed }, uFray: { value: fray },
          uSway: { value: reduced ? 0 : 1 }, uReveal: { value: 0 }, uGlow: { value: glow ? 1 : 0 },
          uBack: { value: colors.back }, uFront: { value: colors.front }, uHi: { value: colors.hi },
        },
      });
      const m = new THREE.Mesh(geo, mat);
      m.renderOrder = glow ? 0 : 1;
      scene.add(m);
      meshes.push(m);
    };
    make(true, 0, 4.5, 0);
    FIBRES.forEach((ph) => make(false, ph + seed * 3.0, 0.75, 1.15));
    const path: ThreadPath = { meshes, geo, dest, from, to, landings: [] };
    paths.push(path);
    return path;
  }

  const beadGeo = new THREE.CircleGeometry(3.2, 24);
  const beadMat = new THREE.MeshBasicMaterial({ color: COLORS.front, transparent: true });
  function land(path: ThreadPath, dest: number, at: number, x: number, y: number) {
    const bead = new THREE.Mesh(beadGeo, beadMat);
    bead.position.set(x, y, 0);
    bead.scale.setScalar(reduced ? 1 : 0);
    bead.renderOrder = 2;
    scene.add(bead);
    path.landings.push({ dest, at, bead });
  }

  // how much a path sways, and how loose its twist is
  function calm(p: ThreadPath, sway: number, twist: number) {
    p.meshes.forEach((m) => { m.material.uniforms.uSway.value = reduced ? 0 : sway; m.material.uniforms.uAmp.value *= twist; });
  }

  function rebuild() {
    if (disposed) return;
    const r = section.getBoundingClientRect();
    const w = r.width, h = r.height;
    if (w <= 0 || h <= 0) return;
    renderer.setSize(w, h, false);
    camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = h;
    camera.updateProjectionMatrix();
    paths.forEach((p) => {
      p.meshes.forEach((m) => { scene.remove(m); m.material.dispose(); });
      p.landings.forEach((l) => scene.remove(l.bead));
      p.geo.dispose();
    });
    paths.length = 0;

    const listEl = section.querySelector<HTMLElement>('.eco-list');
    if (!listEl) return;
    const list = listEl.getBoundingClientRect();
    const box = (d: HTMLElement) => { const b = d.getBoundingClientRect(); return { l: b.left - r.left, r: b.right - r.left, t: b.top - r.top }; };
    const narrow = matchMedia('(max-width: 900px)').matches; // same breakpoint as the CSS stack

    if (narrow) {
      // in from the top right, then straight down the right edge past every destination
      const gx = w - Math.max(14, (w - (list.right - r.left)) / 2 + 12);
      const tops = dests.map((d) => box(d).t + 10);
      const first = tops[0], last = tops[tops.length - 1];
      const cp = new THREE.CurvePath<THREE.Vector3>();
      cp.add(new THREE.CubicBezierCurve3(V(w, 0), V(w - 4, first * 0.4), V(gx, first * 0.6), V(gx, first)));
      if (last > first + 1) cp.add(new THREE.LineCurve3(V(gx, first), V(gx, last)));
      const path = addPath(cp, { dest: -2, seed: 0.37, fray: 0, from: 0, to: 0.95 });
      calm(path, 0.25, 1);
      const len = cp.getLength(), head = cp.curves[0].getLength();
      tops.forEach((y, i) => land(path, i, (head + (y - first)) / len, gx, y));
    } else {
      // down the left edge from where the film's thread left off, a soft turn, then one level line
      const lineY = list.top - r.top + 14;
      const x0 = list.left - r.left;
      const x1 = list.right - r.left;
      const cp = new THREE.CurvePath<THREE.Vector3>();
      const turn = Math.min(160, x0 + 120);
      cp.add(new THREE.CubicBezierCurve3(V(6, 0), V(6, lineY * 0.75), V(Math.max(6, x0 - turn * 0.5), lineY), V(x0 + 40, lineY)));
      cp.add(new THREE.LineCurve3(V(x0 + 40, lineY), V(x1, lineY)));
      const main = addPath(cp, { dest: -2, seed: 0.11, fray: 0, from: 0, to: 0.7 });
      calm(main, 0.25, 1);
      const len = cp.getLength(), head = cp.curves[0].getLength();
      // each destination hangs on a short drop from the line, starting as the line passes it
      dests.forEach((d, i) => {
        const b = box(d);
        const x = b.l + 1.5;
        const at = Math.min(1, (head + Math.max(0, x - (x0 + 40))) / len);
        const start = main.from + at * (main.to - main.from);
        const drop = addPath(new THREE.LineCurve3(V(x, lineY), V(x, b.t - 10)), { dest: i, seed: 0.23 + i * 0.19, fray: 0, from: start, to: start + 0.1 });
        calm(drop, 0, 0.6); // drops hang still and straight
        land(drop, i, 1, x, b.t - 10);
      });
    }
    draw(0);
  }

  const clock = new THREE.Clock();
  function draw(t: number) {
    dests.forEach((_, i) => (heat[i] += (hot[i] - heat[i]) * 0.1));
    paths.forEach((p) => {
      const k = p.dest < 0 ? 0 : heat[p.dest];
      const rev = THREE.MathUtils.clamp((progress - p.from) / (p.to - p.from), 0, 1);
      p.meshes.forEach((mesh) => {
        const u = mesh.material.uniforms;
        u.uTime.value = t; u.uHot.value = k; u.uReveal.value = rev;
      });
      // the bead appears as the thread reaches it, and swells a little on hover
      p.landings.forEach((l) => {
        const on = reduced ? 1 : THREE.MathUtils.clamp((rev - l.at) / 0.04 + (l.at >= 1 ? (progress - p.to) / 0.04 : 0), 0, 1);
        l.bead.scale.setScalar(on * (1 + 0.4 * heat[l.dest]));
      });
    });
    renderer.render(scene, camera);
  }
  function frame() {
    draw(reduced ? 0 : clock.getElapsedTime());
    if (running) raf = requestAnimationFrame(frame);
  }

  function setActive(on: boolean) {
    running = on && !reduced;
    cancelAnimationFrame(raf);
    if (running) raf = requestAnimationFrame(frame);
    else frame();
  }
  // 0 to 1, driven by scroll: how much of the network has been drawn
  function setReveal(p: number) {
    if (reduced) return;
    progress = p;
    if (!running) frame();
  }

  let rt: number | undefined;
  const onResize = () => { clearTimeout(rt); rt = window.setTimeout(rebuild, 150); };
  addEventListener('resize', onResize);
  document.fonts?.ready.then(rebuild);
  // the mark is an image: measure again once it has its real size
  const img = mark?.querySelector('img');
  if (img && !img.complete) img.addEventListener('load', rebuild, { once: true });
  rebuild();
  function dispose() {
    disposed = true; running = false;
    cancelAnimationFrame(raf); clearTimeout(rt);
    canvas?.removeEventListener('webglcontextlost', onContextLost);
    canvas?.removeEventListener('webglcontextrestored', onContextRestored);
    removeEventListener('resize', onResize);
    paths.forEach((p) => { p.meshes.forEach((m) => m.material.dispose()); p.geo.dispose(); });
    paths.length = 0;
    beadGeo.dispose(); beadMat.dispose();
    renderer.dispose();
  }
  return { setActive, setReveal, dispose };
}

function start2DFallback(
  canvas: HTMLCanvasElement,
  section: HTMLElement,
  dests: HTMLElement[],
  { reduced = false } = {}
): Network {
  let activeCanvas = canvas;
  let ctx = activeCanvas.getContext('2d');
  if (!ctx) {
    // If canvas was previously touched by WebGL, replace with a fresh 2D canvas
    const freshCanvas = document.createElement('canvas');
    freshCanvas.className = canvas.className;
    freshCanvas.setAttribute('aria-hidden', 'true');
    canvas.replaceWith(freshCanvas);
    activeCanvas = freshCanvas;
    ctx = activeCanvas.getContext('2d');
  }
  if (!ctx) return { setActive() {}, setReveal() {}, dispose() {} };

  let progress = reduced ? 1 : 0;
  let disposed = false;

  function rebuild() {
    if (disposed) return;
    const r = section.getBoundingClientRect();
    const w = r.width, h = r.height;
    if (w <= 0 || h <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    activeCanvas.width = Math.round(w * dpr);
    activeCanvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const listEl = section.querySelector<HTMLElement>('.eco-list');
    if (!listEl) return;
    const list = listEl.getBoundingClientRect();
    const box = (d: HTMLElement) => {
      const b = d.getBoundingClientRect();
      return { l: b.left - r.left, r: b.right - r.left, t: b.top - r.top };
    };
    const narrow = window.matchMedia('(max-width: 900px)').matches;

    ctx!.clearRect(0, 0, w, h);
    ctx!.strokeStyle = COLORS.front;
    ctx!.fillStyle = COLORS.front;
    ctx!.lineWidth = 1.6;
    ctx!.lineCap = 'round';
    ctx!.lineJoin = 'round';

    if (narrow) {
      const gx = w - Math.max(14, (w - (list.right - r.left)) / 2 + 12);
      const tops = dests.map((d) => box(d).t + 10);
      const first = tops[0], last = tops[tops.length - 1];

      // Thread down right edge
      ctx!.beginPath();
      ctx!.moveTo(w, 0);
      ctx!.bezierCurveTo(w - 4, first * 0.4, gx, first * 0.6, gx, first);
      if (last > first + 1) ctx!.lineTo(gx, last);
      ctx!.stroke();

      // Beads beside each destination
      tops.forEach((y) => {
        ctx!.beginPath();
        ctx!.arc(gx, y, 3.2, 0, Math.PI * 2);
        ctx!.fill();
      });
    } else {
      const lineY = list.top - r.top + 14;
      const x0 = list.left - r.left;
      const x1 = list.right - r.left;
      const turn = Math.min(160, x0 + 120);

      // Main line from left edge across destinations
      ctx!.beginPath();
      ctx!.moveTo(6, 0);
      ctx!.bezierCurveTo(6, lineY * 0.75, Math.max(6, x0 - turn * 0.5), lineY, x0 + 40, lineY);
      ctx!.lineTo(x1, lineY);
      ctx!.stroke();

      // Vertical drops to each destination
      dests.forEach((d) => {
        const b = box(d);
        const x = b.l + 1.5;
        const dropY = b.t - 10;
        ctx!.beginPath();
        ctx!.moveTo(x, lineY);
        ctx!.lineTo(x, dropY);
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(x, dropY, 3.2, 0, Math.PI * 2);
        ctx!.fill();
      });
    }
  }

  let rt: number | undefined;
  const onResize = () => { clearTimeout(rt); rt = window.setTimeout(rebuild, 150); };
  window.addEventListener('resize', onResize);
  document.fonts?.ready.then(rebuild);
  const mark = section.querySelector<HTMLElement>('.eco-mark');
  const img = mark?.querySelector('img');
  if (img && !img.complete) img.addEventListener('load', rebuild, { once: true });

  rebuild();

  return {
    setActive() {},
    setReveal(p: number) {
      progress = p;
    },
    dispose() {
      disposed = true;
      clearTimeout(rt);
      window.removeEventListener('resize', onResize);
      if (ctx) ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
    },
  };
}
