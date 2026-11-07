'use client';

import * as React from 'react';
import { MODES, rotX, rotY, type P } from './modes';
import type { BaseThinkingOrbProps } from './types';

const INK = { light: '#1E140E', dark: '#F4EFE5' };

/**
 * Draws a thinking orb on a canvas: the mode's points are rotated, given a little perspective,
 * and painted back to front, nearer points larger and brighter. It pauses when hidden or asked
 * to, and draws a single still frame for people who prefer reduced motion.
 */
export function BaseThinkingOrb({
  mode, caption, summary, frame,
  surface = 'auto', size = frame[0], speed = 1, scale = 0.72, playback = 'play',
  color, showCaption = false, className, style, 'aria-label': ariaLabel,
}: BaseThinkingOrbProps) {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const dark = surface === 'dark' || (surface === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const ink = color || (dark ? INK.dark : INK.light);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const draw = MODES[mode];
    const state: Record<string, unknown> = {};
    const c = size / 2;
    const R = c * scale;
    const dot = Math.max(0.8, size / 170);

    const paint = (t: number) => {
      const f = draw(t, state);
      const spin = f.rotate ? t * 0.35 : 0;
      const tilt = f.tilt ?? 0.32;
      const place = (p: P) => (f.rotate ? rotX(rotY(p, spin), tilt) : p);
      const proj = (p: P) => { const k = 1 / (1 - p.z * 0.18); return { x: c + p.x * R * k, y: c - p.y * R * k, d: (p.z + 1) / 2 }; };
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      if (f.links) {
        ctx.lineWidth = Math.max(0.5, dot * 0.55);
        for (const [a, b, w] of f.links) {
          const pa = proj(place(a)), pb = proj(place(b));
          ctx.globalAlpha = w * (0.25 + 0.75 * (pa.d + pb.d) / 2);
          ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        }
      }
      const pts = f.points.map((p) => ({ p, q: proj(place(p)) })).sort((a, b) => a.q.d - b.q.d);
      for (const { p, q } of pts) {
        ctx.globalAlpha = Math.min(1, (p.a ?? 1) * (0.28 + 0.72 * q.d));
        ctx.beginPath();
        ctx.arc(q.x, q.y, dot * (p.r ?? 1) * (0.6 + 0.6 * q.d), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (still || playback === 'pause') { paint(1.2); return; }
    let raf = 0;
    let last = performance.now();
    let t = 0;
    const loop = (now: number) => {
      t += (Math.min(64, now - last) / 1000) * speed;
      last = now;
      paint(t);
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); };
  }, [mode, size, speed, scale, playback, surface, color]);

  return (
    <figure className={className} style={{ margin: 0, display: 'inline-grid', justifyItems: 'center', gap: 10, ...style }}
      role="img" aria-label={ariaLabel ?? `${caption}: ${summary}`}>
      <canvas ref={canvas} style={{ width: size, height: size, display: 'block' }} aria-hidden="true" />
      {showCaption && <figcaption style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: color ?? 'currentColor' }}>{caption}</figcaption>}
    </figure>
  );
}
