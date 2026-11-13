"""AVVVS - The Golden Thread. Shots 04.03-04.04: threads converge and collapse into one luminous droplet.

Run (absolute paths only; relative paths in -b resolve to the drive root):
  blender -b --factory-startup --python golden_thread.py -- <out_dir> <mode>
mode: still   one 1280x536 frame at frame 104 (64 samples)
      preview 960x402, frames 1-120, 24 samples, PNG sequence
      final   2560x1440, 16-bit PNG sequence; optional <first> <last> <samples> (default all frames, 256)
The .blend is saved next to the renders so it can be opened and tweaked by hand.
"""
import bpy, math, random, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0]) if argv else os.path.abspath(os.path.join(os.path.dirname(__file__), "renders"))
MODE = argv[1] if len(argv) > 1 else "still"
os.makedirs(OUT, exist_ok=True)
random.seed(1921)

# ---------- palette (linear) ----------
def srgb(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1.0]
GOLD, AMBER, PARCH = srgb("#C3A46A"), srgb("#E0A04A"), srgb("#E8D9B9")

# ---------- scene ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
try:
    cp = bpy.context.preferences.addons["cycles"].preferences
    cp.compute_device_type = "OPTIX"
    cp.get_devices()
    for d in cp.devices:
        d.use = d.type != "CPU"
    sc.cycles.device = "GPU"
except Exception as e:
    print("GPU setup failed, using CPU:", e)
sc.render.fps = 24
sc.frame_start, sc.frame_end = 1, 120
sc.view_settings.view_transform = "AgX"
for look in ("AgX - Punchy", "Punchy", "AgX - Medium High Contrast"):
    try:
        sc.view_settings.look = look
        break
    except TypeError:
        pass
sc.render.film_transparent = False
sc.render.use_motion_blur = True
sc.render.motion_blur_shutter = 0.5
sc.cycles.use_denoising = True
sc.cycles.caustics_reflective = False
sc.cycles.max_bounces = 12
sc.cycles.transmission_bounces = 12

world = bpy.data.worlds.new("Lampblack")
world.use_nodes = True
wn, wl = world.node_tree.nodes, world.node_tree.links
bg = wn["Background"]
bg.inputs[0].default_value = srgb("#0D0B09")
bg.inputs[1].default_value = 0.02
# What reflections see: a warm studio gradient (dark rosewood below, parchment above).
# The camera never sees it, so the frame stays lamp-black while the gold has something to mirror.
lp = wn.new("ShaderNodeLightPath")
wtc = wn.new("ShaderNodeTexCoord")
sep = wn.new("ShaderNodeSeparateXYZ")
wl.new(wtc.outputs["Generated"], sep.inputs[0])
wramp = wn.new("ShaderNodeValToRGB")
wramp.color_ramp.elements[0].position = 0.0
wramp.color_ramp.elements[0].color = srgb("#2A180A")
for pos, col in ((0.3, "#8A5A22"), (0.5, "#D6A24E"), (0.62, "#E9C27C")):
    e = wramp.color_ramp.elements.new(pos)
    e.color = srgb(col)
wramp.color_ramp.elements[-1].position = 0.8
wramp.color_ramp.elements[-1].color = srgb("#FFF0D0")
mr = wn.new("ShaderNodeMapRange")          # view direction Z runs -1..1; the ramp wants 0..1
mr.inputs["From Min"].default_value = -1.0
mr.inputs["From Max"].default_value = 1.0
wl.new(sep.outputs["Z"], mr.inputs["Value"])
wl.new(mr.outputs["Result"], wramp.inputs["Fac"])
refl = wn.new("ShaderNodeBackground")
refl.inputs[1].default_value = 1.1
wl.new(wramp.outputs["Color"], refl.inputs[0])
# reflections see a dimmer copy, so the oil reads dark and its rings catch the light strips;
# refraction sees the full-brightness gradient, so the drop still glows from within
dim = wn.new("ShaderNodeBackground")
dim.inputs[1].default_value = 0.22
wl.new(wramp.outputs["Color"], dim.inputs[0])
mix_t = wn.new("ShaderNodeMixShader")            # transmission ? bright : dim
wl.new(lp.outputs["Is Transmission Ray"], mix_t.inputs[0])
wl.new(dim.outputs[0], mix_t.inputs[1])
wl.new(refl.outputs[0], mix_t.inputs[2])
mix = wn.new("ShaderNodeMixShader")              # camera ? lamp-black : the above
wl.new(lp.outputs["Is Camera Ray"], mix.inputs[0])
wl.new(mix_t.outputs[0], mix.inputs[1])
wl.new(bg.outputs[0], mix.inputs[2])
wl.new(mix.outputs[0], wn["World Output"].inputs["Surface"])
sc.world = world

def mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links

# ---------- gold thread material ----------
mg, n, l = mat("GoldThread")
p = n["Principled BSDF"]
p.inputs["Base Color"].default_value = GOLD
p.inputs["Metallic"].default_value = 1.0
p.inputs["Roughness"].default_value = 0.3
p.inputs["Emission Color"].default_value = srgb("#B8893F")
p.inputs["Emission Strength"].default_value = 0.9

# ---------- droplet material: transparent liquid gold ----------
# A clear golden liquid: light passes through it and picks up gold from a thin absorption
# volume; the surface glistens because it mirrors the hidden light strips and the warm
# reflection-only environment. Refracted rays also see that environment, so the drop
# glows from within against the lamp-black frame.
md, n, l = mat("Droplet")
p = n["Principled BSDF"]
p.inputs["Base Color"].default_value = srgb("#FFE3A6")
p.inputs["Metallic"].default_value = 0.0
p.inputs["Roughness"].default_value = 0.0
p.inputs["IOR"].default_value = 1.47
p.inputs["Transmission Weight"].default_value = 1.0
p.inputs["Coat Weight"].default_value = 0.6
p.inputs["Coat Roughness"].default_value = 0.0
p.inputs["Emission Strength"].default_value = 0.0
vol = n.new("ShaderNodeVolumeAbsorption")
vol.inputs["Color"].default_value = srgb("#F0B23E")
vol.inputs["Density"].default_value = 2.2
l.new(vol.outputs[0], n["Material Output"].inputs["Volume"])

# ---------- engraving backplate (refracted inside the droplet) ----------
me, n, l = mat("Engraving")
tc = n.new("ShaderNodeTexCoord")
wave = n.new("ShaderNodeTexWave")
wave.wave_type = "BANDS"
wave.inputs["Scale"].default_value = 26.0
wave.inputs["Distortion"].default_value = 2.2
wave.inputs["Detail"].default_value = 2.0
wave.inputs["Detail Scale"].default_value = 0.8
ramp = n.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.975
ramp.color_ramp.elements[1].position = 0.995
em = n.new("ShaderNodeEmission")
em.inputs["Color"].default_value = PARCH
mul = n.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = 0.035
l.new(tc.outputs["Object"], wave.inputs["Vector"])
l.new(wave.outputs["Color"], ramp.inputs["Fac"])
l.new(ramp.outputs["Color"], mul.inputs[0])
l.new(mul.outputs[0], em.inputs["Strength"])
out = n["Material Output"]
n.remove(n["Principled BSDF"])
l.new(em.outputs[0], out.inputs["Surface"])

bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 4.5, 0.2), rotation=(math.radians(90), 0, 0))
plate = bpy.context.object
plate.name = "EngravingPlate"
plate.scale = (9, 4.5, 1)
plate.data.materials.append(me)
for attr in ("visible_transmission", "visible_glossy"):
    if hasattr(plate, attr):
        setattr(plate, attr, False)   # drop and oil should carry warm light, not mirror a black wall

# ---------- droplet ----------
DR = 0.13
bpy.ops.mesh.primitive_uv_sphere_add(radius=DR, segments=96, ring_count=48, location=(0, 0, 0))
drop = bpy.context.object
drop.name = "Droplet"
bpy.ops.object.shade_smooth()
drop.data.materials.append(md)
# gentle teardrop: pull the top up
for v in drop.data.vertices:
    if v.co.z > 0:
        v.co.z *= 1.0 + 0.16 * (v.co.z / DR) ** 2
# liquid surface: a slow, tiny ripple so highlights slide and shimmer
tex = bpy.data.textures.new("Ripple", "CLOUDS")
tex.noise_scale = 0.06
tex.noise_depth = 2
disp = drop.modifiers.new("Ripple", "DISPLACE")
disp.texture = tex
disp.texture_coords = "OBJECT"
disp.strength = 0.0035
disp.mid_level = 0.5
ripple_ctrl = bpy.data.objects.new("RippleCtrl", None)
sc.collection.objects.link(ripple_ctrl)
disp.texture_coords_object = ripple_ctrl
ripple_ctrl.location = (0, 0, 0); ripple_ctrl.keyframe_insert("location", frame=1)
ripple_ctrl.location = (0.05, 0.03, 0.08); ripple_ctrl.keyframe_insert("location", frame=120)
drop.modifiers.new("Smooth", "SUBSURF").levels = 1

# reflection strips: bright cards seen only in glossy rays, so the gold glistens
def glint(name, loc, rot, size, strength, color="#FFF4DE"):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    g = bpy.context.object
    g.name = name
    g.scale = size
    m, nn, ll = mat(name + "_m")
    nn.remove(nn["Principled BSDF"])
    e = nn.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = srgb(color)
    e.inputs["Strength"].default_value = strength
    ll.new(e.outputs[0], nn["Material Output"].inputs["Surface"])
    g.data.materials.append(m)
    for attr in ("visible_camera", "visible_diffuse", "visible_transmission", "visible_volume_scatter", "visible_shadow"):
        if hasattr(g, attr):
            setattr(g, attr, False)
glint("GlintTop", (0.25, -0.8, 1.3), (math.radians(-55), 0, math.radians(12)), (0.7, 0.025, 1), 9)
glint("GlintLeft", (-1.2, -1.0, 0.25), (0, math.radians(-62), math.radians(30)), (0.035, 0.7, 1), 6)
glint("GlintRight", (1.1, -1.1, -0.05), (0, math.radians(62), math.radians(-30)), (0.025, 0.35, 1), 4)
# small hot points: the sparkle that makes liquid read as liquid
glint("SparkA", (-0.35, -1.5, 0.45), (math.radians(-80), 0, math.radians(-15)), (0.035, 0.035, 1), 45)
glint("SparkB", (0.4, -1.5, 0.15), (math.radians(-85), 0, math.radians(15)), (0.025, 0.025, 1), 45)
# formation keys: invisible -> overshoot -> settle (spring)
for f, s in [(1, 0.001), (78, 0.001), (92, 1.14), (98, 0.94), (104, 1.03), (110, 0.99), (116, 1.0)]:
    drop.scale = (s, s, s * (1.0 + (0.06 if f == 92 else 0)))
    drop.keyframe_insert("scale", frame=f)
for fc in drop.animation_data.action.fcurves if hasattr(drop.animation_data.action, "fcurves") else []:
    for k in fc.keyframe_points:
        k.interpolation = "BEZIER"; k.easing = "AUTO"

# inner light: the droplet carries its own glow
bpy.ops.object.light_add(type="POINT", location=(0, 0, 0))
inner = bpy.context.object
inner.data.color = AMBER[:3]
inner.data.shadow_soft_size = 0.02
for attr in ("visible_camera", "visible_glossy", "visible_transmission", "visible_diffuse"):
    if hasattr(inner, attr):
        setattr(inner, attr, False)
for f, e in [(1, 0), (80, 0), (96, 2.5), (120, 2.0)]:
    inner.data.energy = e
    inner.data.keyframe_insert("energy", frame=f)

# ---------- threads ----------
# Threads converge in the screen plane (XZ; the camera looks along +Y) as one slow vortex,
# with depth (Y) varying so some threads fall out of focus.
N = 40
threads = []
for i in range(N):
    a0 = (i / N) * 2 * math.pi + random.uniform(-0.12, 0.12)
    R = random.uniform(1.7, 2.6)
    y0 = random.uniform(-1.6, 1.6)
    swirl = random.uniform(0.55, 1.05)          # same direction for a coherent vortex
    wob = random.uniform(0.01, 0.035)
    cu = bpy.data.curves.new(f"thread_{i:02d}", "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = 4
    cu.bevel_depth = random.uniform(0.0006, 0.0013)
    cu.bevel_resolution = 2
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    pts = 72
    sp.points.add(pts - 1)
    for k in range(pts):
        t = k / (pts - 1)
        r = R * (1 - t) ** 1.25
        a = a0 + swirl * t
        y = y0 * (1 - t) ** 1.5
        w = wob * math.sin(t * 11 + i * 1.7) * (1 - t)
        sp.points[k].co = ((r + w) * math.cos(a), y, (r + w) * math.sin(a) * 0.9, 1)
    ob = bpy.data.objects.new(f"Thread_{i:02d}", cu)
    sc.collection.objects.link(ob)
    cu.materials.append(mg)
    # grow in, then drain into the droplet
    d = random.randint(0, 18)
    cu.bevel_factor_end = 0.0; cu.keyframe_insert("bevel_factor_end", frame=1 + d)
    cu.bevel_factor_end = 1.0; cu.keyframe_insert("bevel_factor_end", frame=58 + d)
    cu.bevel_factor_start = 0.0; cu.keyframe_insert("bevel_factor_start", frame=62 + d // 2)
    cu.bevel_factor_start = 1.0; cu.keyframe_insert("bevel_factor_start", frame=94 + d // 3)
    threads.append(ob)

# ---------- lights ----------
bpy.ops.object.light_add(type="AREA", location=(0.4, -1.4, 2.6))
key = bpy.context.object
key.data.size = 1.6
key.data.energy = 140
key.data.color = srgb("#FFD7A3")[:3]
key.rotation_euler = (math.radians(32), 0, math.radians(8))
bpy.ops.object.light_add(type="AREA", location=(-2.2, 2.0, 0.6))
rim = bpy.context.object
rim.data.size = 0.8
rim.data.energy = 60
rim.data.color = srgb("#E9C08A")[:3]
rim.rotation_euler = (math.radians(90), 0, math.radians(-130))

# ---------- camera: 100 mm, slow push ----------
bpy.ops.object.camera_add(location=(0, -7.2, 0.25))
cam = bpy.context.object
cam.data.lens = 100
cam.data.sensor_width = 36
cam.data.dof.use_dof = True
cam.data.dof.focus_object = drop
cam.data.dof.aperture_fstop = 1.8
tgt = bpy.data.objects.new("CamTarget", None); sc.collection.objects.link(tgt)
con = cam.constraints.new("TRACK_TO"); con.target = tgt; con.track_axis = "TRACK_NEGATIVE_Z"; con.up_axis = "UP_Y"
cam.location = (0, -7.2, 0.25); cam.keyframe_insert("location", frame=1)
cam.location = (0, -5.6, 0.12); cam.keyframe_insert("location", frame=120)
sc.camera = cam
cam.data.dof.focus_object = tgt          # focus rides the target, which follows the drop down

# ---------- 05.01-05.02: the drop falls into still oil ----------
# The drop holds, falls, and lands in a still pool of golden oil. Rings spread from the
# impact (Wave modifier) and a small jet of oil rises and falls back.
OIL_Z = -1.4
IMPACT = 152
sc.frame_end = 216

def ease(obj, path, kind="QUAD", easing="EASE_IN"):
    act = obj.animation_data.action if obj.animation_data else None
    fcs = getattr(act, "fcurves", None) or []
    for fc in fcs:
        if fc.data_path == path:
            for k in fc.keyframe_points:
                k.interpolation = kind; k.easing = easing

# the drop: hold, a slight lift, then an accelerating fall that stretches it
drop.location = (0, 0, 0); drop.keyframe_insert("location", frame=122)
drop.location = (0, 0, 0.03); drop.keyframe_insert("location", frame=130)
drop.location = (0, 0, OIL_Z + DR * 0.6); drop.keyframe_insert("location", frame=IMPACT)
ease(drop, "location")
for f, s in [(130, (1, 1, 1)), (146, (0.9, 0.9, 1.22)), (IMPACT, (0.86, 0.86, 1.28)), (IMPACT + 1, (0.001, 0.001, 0.001))]:
    drop.scale = s; drop.keyframe_insert("scale", frame=f)
inner.parent = drop
for f, e in [(IMPACT - 1, 2.0), (IMPACT, 0.0)]:
    inner.data.energy = e; inner.data.keyframe_insert("energy", frame=f)

# oil: translucent golden oil, a closed slab (so it has a volume to colour the light),
# over the bronze floor of the vessel, which shows through it
mo, n, l = mat("Oil")
p = n["Principled BSDF"]
p.inputs["Base Color"].default_value = srgb("#FFE2A8")
p.inputs["Roughness"].default_value = 0.0
p.inputs["IOR"].default_value = 1.47
p.inputs["Transmission Weight"].default_value = 1.0
ovol = n.new("ShaderNodeVolumeAbsorption")
ovol.inputs["Color"].default_value = srgb("#E39A36")
ovol.inputs["Density"].default_value = 2.6
l.new(ovol.outputs[0], n["Material Output"].inputs["Volume"])
bpy.ops.mesh.primitive_grid_add(x_subdivisions=360, y_subdivisions=360, size=9, location=(0, 1.2, OIL_Z))
oil = bpy.context.object
oil.name = "OilPool"
oil.data.materials.append(mo)
bpy.ops.object.shade_smooth()

mb, n, l = mat("BronzeFloor")
p = n["Principled BSDF"]
p.inputs["Base Color"].default_value = srgb("#8A5726")
p.inputs["Metallic"].default_value = 1.0
p.inputs["Roughness"].default_value = 0.32
bpy.ops.mesh.primitive_plane_add(size=9, location=(0, 1.2, OIL_Z - 0.34))
floor = bpy.context.object
floor.name = "VesselFloor"
floor.data.materials.append(mb)
# a soft warm light under the surface so the floor reads through the oil
bpy.ops.object.light_add(type="AREA", location=(0, -0.6, OIL_Z + 1.4))
under = bpy.context.object
under.data.size = 3.0
under.data.energy = 60
under.data.color = srgb("#FFD49A")[:3]
for attr in ("visible_camera", "visible_glossy"):
    if hasattr(under, attr):
        setattr(under, attr, False)
wave = oil.modifiers.new("Rings", "WAVE")
wave.use_x = True; wave.use_y = True
wave.start_position_x = 0.0; wave.start_position_y = -1.2   # local coords: the impact point
wave.time_offset = IMPACT
wave.height = 0.03
wave.width = 0.22
wave.narrowness = 1.2
wave.speed = 0.022
wave.falloff_radius = 3.5
wave.damping_time = 70
solid = oil.modifiers.new("Depth", "SOLIDIFY")   # after the rings, so the top surface carries them
solid.thickness = 0.3
solid.offset = -1.0

# a long low strip of light far behind the pool: the rings bend its reflection into arcs
glint("PoolStrip", (0, 7.0, OIL_Z + 0.9), (math.radians(90), 0, 0), (7.0, 0.16, 1), 1.6, "#E9B866")

# glow where the drop lands, fading as the rings spread
bpy.ops.object.light_add(type="POINT", location=(0, 0, OIL_Z + 0.08))
pool_glow = bpy.context.object
pool_glow.data.color = AMBER[:3]
pool_glow.data.shadow_soft_size = 0.1
for attr in ("visible_camera", "visible_glossy", "visible_transmission"):
    if hasattr(pool_glow, attr):
        setattr(pool_glow, attr, False)
for f, e in [(1, 0), (IMPACT - 1, 0), (IMPACT + 2, 9), (IMPACT + 40, 3), (216, 1.5)]:
    pool_glow.data.energy = e; pool_glow.data.keyframe_insert("energy", frame=f)

# the jet: a column of oil rises from the impact and falls back, then one small drop pops off
def oil_drop(name, r):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=48, ring_count=24, location=(0, 0, OIL_Z))
    o = bpy.context.object
    o.name = name
    bpy.ops.object.shade_smooth()
    o.data.materials.append(md)
    return o
jet = oil_drop("Jet", 0.035)
for f, loc, s in [(1, OIL_Z - 0.1, (0.001,) * 3), (IMPACT, OIL_Z - 0.05, (0.001,) * 3),
                  (IMPACT + 6, OIL_Z + 0.10, (0.75, 0.75, 3.2)), (IMPACT + 13, OIL_Z + 0.05, (0.6, 0.6, 1.6)),
                  (IMPACT + 19, OIL_Z - 0.02, (0.001,) * 3)]:
    jet.location = (0, 0, loc); jet.scale = s
    jet.keyframe_insert("location", frame=f); jet.keyframe_insert("scale", frame=f)
pop = oil_drop("Pop", 0.028)
for f, loc, s in [(1, OIL_Z, 0.001), (IMPACT + 5, OIL_Z + 0.2, 0.001), (IMPACT + 6, OIL_Z + 0.22, 1.0),
                  (IMPACT + 14, OIL_Z + 0.42, 1.0), (IMPACT + 24, OIL_Z + 0.02, 1.0), (IMPACT + 25, OIL_Z - 0.02, 0.001)]:
    pop.location = (0, 0, loc); pop.scale = (s, s, s)
    pop.keyframe_insert("location", frame=f); pop.keyframe_insert("scale", frame=f)

# camera follows the fall down, then settles low over the pool and eases back as the rings spread
tgt.location = (0, 0, 0); tgt.keyframe_insert("location", frame=128)
tgt.location = (0, 0, OIL_Z); tgt.keyframe_insert("location", frame=IMPACT)
tgt.location = (0, 0.4, OIL_Z); tgt.keyframe_insert("location", frame=216)
cam.location = (0, -5.6, 0.12); cam.keyframe_insert("location", frame=128)
cam.location = (0, -5.4, OIL_Z + 0.55); cam.keyframe_insert("location", frame=IMPACT)
cam.location = (0, -6.6, OIL_Z + 1.25); cam.keyframe_insert("location", frame=216)
ease(tgt, "location", "SINE", "EASE_IN_OUT")

# ---------- output ----------
r = sc.render
if MODE == "still":
    F = int(argv[2]) if len(argv) > 2 else 104
    r.resolution_x, r.resolution_y, r.resolution_percentage = 1280, 720, 100
    sc.cycles.samples = 64
    sc.frame_set(F)
    r.image_settings.file_format = "PNG"
    r.filepath = os.path.join(OUT, f"still_f{F:03d}.png")
elif MODE == "preview":
    r.resolution_x, r.resolution_y, r.resolution_percentage = 1280, 720, 100
    sc.cycles.samples = 24
    r.image_settings.file_format = "PNG"
    r.filepath = os.path.join(OUT, "preview", "f_####")
else:
    r.resolution_x, r.resolution_y, r.resolution_percentage = 2560, 1440, 100
    # optional: first frame, last frame, samples (the film uses frames 25-216: film/clips/b4-thread.mp4)
    if len(argv) > 3: sc.frame_start, sc.frame_end = int(argv[2]), int(argv[3])
    sc.cycles.samples = int(argv[4]) if len(argv) > 4 else 256
    r.image_settings.file_format = "PNG"
    r.image_settings.color_depth = "16"
    r.filepath = os.path.join(OUT, "final", "f_####")
sc.render.use_persistent_data = True

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "golden_thread.blend"))
if MODE == "still":
    bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
print("DONE", MODE, OUT)
