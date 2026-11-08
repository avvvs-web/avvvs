"""Gold routes from Kozhikode to the export markets, drawn over the map frame that ends S11.

Writes a PNG sequence (1920x1080, 24 fps) that opens S14: a bead appears on Kozhikode, then one
thread at a time arcs out to Vienna, Ljubljana, Moscow and Bogota and lands in a bead, then holds.
Coordinates were measured on keyframes/K11_map.png (2688x1520) and are mapped to the 1920x1080
frame the same way encode.sh crops (cover, centred).

usage: python film/routes.py <base_frame.png> <out_dir> [seconds] [first_frame.png]
With first_frame, the opening 0.6 s dissolves from it (S11's exact last frame, where the map ink
is fainter) to the base, so the join is frame-identical and the ink seems to settle.
"""
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

base_path, out_dir = sys.argv[1], sys.argv[2]
SECONDS = float(sys.argv[3]) if len(sys.argv) > 3 else 3.2
FIRST = sys.argv[4] if len(sys.argv) > 4 else None
SETTLE = 0.6
FPS, W, H, SS = 24, 1920, 1080, 2  # SS: supersampling for smooth lines

# measured on the 2688x1520 map keyframe
K = 1920 / 2688
OFF_Y = (1520 * K - 1080) / 2
P = lambda x, y: ((x * K) * SS, (y * K - OFF_Y) * SS)
ORIGIN = P(2128, 945)                      # Kozhikode
ROUTES = [                                  # (destination, lift of the arc, start time s)
    (P(1311, 423), 0.22, 0.35),            # Vienna, Austria
    (P(1285, 450), 0.30, 0.50),            # Ljubljana, Slovenia
    (P(1592, 330), 0.18, 0.65),            # Moscow, Russia
    (P(65, 755), 0.20, 0.80),              # Bogota, Colombia
    (P(-170, 300), 0.05, 0.95),            # the United States: the map stops at the Caribbean, so
                                            # this thread runs out of the left edge at its latitude
]
DRAW = 1.25                                # seconds for one thread to reach its city
GOLD, GOLD_HI = (176, 136, 62), (214, 178, 108)

base = Image.open(base_path).convert('RGB').resize((W, H), Image.LANCZOS)
first = Image.open(FIRST).convert('RGB').resize((W, H), Image.LANCZOS) if FIRST else None
os.makedirs(out_dir, exist_ok=True)

ease = lambda t: 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, t)))

def bezier(p0, p1, p2, t):
    u = 1 - t
    return (u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1])

def control(p0, p2, lift):
    mx, my = (p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2
    dx, dy = p2[0] - p0[0], p2[1] - p0[1]
    d = math.hypot(dx, dy)
    nx, ny = -dy / d, dx / d                # a normal; pick the one pointing up the frame
    if ny > 0: nx, ny = -nx, -ny
    return (mx + nx * d * lift, my + ny * d * lift)

def bead(draw, c, r, a):
    if a <= 0: return
    r *= SS
    draw.ellipse([c[0] - r * 2.2, c[1] - r * 2.2, c[0] + r * 2.2, c[1] + r * 2.2], fill=GOLD_HI + (int(50 * a),))
    draw.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=GOLD + (int(255 * a),))

frames = int(round(SECONDS * FPS))
for f in range(frames):
    t = f / FPS
    layer = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d, g = ImageDraw.Draw(layer), ImageDraw.Draw(glow)
    for dest, lift, start in ROUTES:
        k = ease((t - start) / DRAW)
        if k <= 0: continue
        c = control(ORIGIN, dest, lift)
        steps = max(2, int(140 * k))
        pts = [bezier(ORIGIN, c, dest, k * i / steps) for i in range(steps + 1)]
        g.line([(x / SS, y / SS) for x, y in pts], fill=GOLD_HI + (120,), width=7, joint='curve')
        d.line(pts, fill=GOLD + (255,), width=int(2.2 * SS), joint='curve')
        if k >= 0.999:
            bead(d, dest, 5, min(1.0, (t - start - DRAW) / 0.25 + 1))
        else:
            tip = pts[-1]
            bead(d, tip, 3, 1)               # the leading point of the thread
    bead(d, ORIGIN, 7, min(1.0, t / 0.3))
    glow = glow.filter(ImageFilter.GaussianBlur(6))
    lines = layer.resize((W, H), Image.LANCZOS)
    under = Image.blend(first, base, ease(t / SETTLE)) if first is not None else base
    frame = under.copy().convert('RGBA')
    frame.alpha_composite(glow)
    frame.alpha_composite(lines)
    frame.convert('RGB').save(os.path.join(out_dir, f'r_{f:04d}.png'))
print(f'{frames} frames')
