#!/usr/bin/env python3
"""
Generate ORIGINAL stand-in assets that preserve the geometry of the original site's assets
(pixel dimensions, aspect ratio, focal placement for crops, tonal key) without deriving
from the copyrighted photographs. Tones are hand-authored per slot, not sampled.

Outputs:
  public/standins/<slot>.jpg      photo stand-ins at original pixel size
  public/textures/noise-a.png     256x256 grain tile (overlay texture, rendered at 128px)
  public/textures/noise-b.png     240x240 grain tile (parallax-image overlay, rendered at 100px)
  public/masks/blob-{a,b,c}.svg   original blob masks with the original bounding boxes
  public/masks/avatar-ring.svg    circular cut-out mask for overlapping avatars
  public/standins/manifest.json   slot -> file, size, original asset id (for traceability)

Usage: python3 tools/standins/generate.py [slot ...]
  With slot names, only those photos are rewritten (textures/masks untouched, manifest entries merged);
  the photo grain is not seeded, so a full run changes every photo's grain bytes.
"""
import json, math, os, random, sys
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PUB = os.path.join(ROOT, 'public')

# slot: (original asset id, width, height, [(x, y, radius_rel, rgb), ...] soft light fields, base rgb, focal note)
# Coordinates are relative (0..1). Base/fields describe the intended tonal key of each slot
# (e.g. "dark teal, light from upper right") — authored by hand from the design, not sampled.
# Client palette (2026-09-30): the teal/green slots keep their field layout (positions, radii, light/dark
# balance) but take brand tones — #FF0031 primary, crimson, burgundy, muted pink, off-white, charcoal.
SLOTS = {
  'hero-backdrop':   ('A6yz8YhmbQkg8ACTADACAMNk7s', 2048, 2048, (214, 96, 112), [(.30,.25,.55,(246,206,210)), (.70,.75,.60,(244,214,204)), (.55,.45,.35,(255,40,72))], 'soft rose/blush haze with a brand-red core, no subject'),
  # abstract tonal study: pale warm focal mass centre-right, brand-red glow lower-left, pale pink
  # upper-left, deep shadow on the right edge — keeps the original frame's light/dark balance
  'hero-portrait':   ('vJzjZEQ7XEcIpUiaWAlM8HVcE', 3600, 3200, (168, 82, 96), [(.22,.14,.30,(232,184,192)), (.50,.26,.13,(240,222,218)), (.56,.50,.20,(236,212,210)), (.62,.84,.24,(244,230,226)), (.14,.84,.26,(255,52,84)), (.86,.42,.20,(74,16,30)), (.96,.90,.22,(34,12,20))], 'pale focal mass centre-right, brand-red glow lower-left, burgundy right edge; crop anchored top (50% 0%)'),
  'service-1':       ('VW2dIv9jFcnOEMXK68HcTW0X9g', 2048, 2048, (64, 18, 30), [(.55,.60,.35,(170,70,86)), (.30,.20,.40,(110,30,46))], 'deep burgundy, dusty crimson light'),
  'service-2':       ('X1KAS3BPHbN4rR5FN8CCVsSUhM', 2048, 2048, (36, 42, 58), [(.50,.55,.25,(214,140,70)), (.40,.30,.45,(60,70,96))], 'dark blue with warm centre glow'),
  'service-3':       ('lZn0EEipDdK6TqFQ685W86d6r9M', 2048, 2048, (70, 90, 96), [(.50,.50,.22,(170,190,196)), (.20,.80,.40,(40,60,66))], 'blue-grey, bright centre'),
  'service-4':       ('Ux4Is85LWxm9dXetoVhxJWLGhLI', 2048, 2048, (96, 34, 46), [(.60,.40,.45,(200,120,132)), (.25,.75,.40,(40,16,22))], 'crimson with muted-pink light'),
  'story-a-1':       ('Xgg8qSDKhoEnATJuF3xxVuO0bw', 2048, 2048, (150, 176, 190), [(.50,.35,.30,(230,200,190)), (.50,.80,.40,(200,206,214))], 'pale blue, light subject centre'),
  'story-a-2':       ('lLxmvlvWIZ4P7PBI7azU4zec', 2048, 2048, (120, 150, 176), [(.45,.35,.28,(240,190,150)), (.55,.75,.35,(170,190,210))], 'blue with warm upper subject'),
  'story-b-1':       ('PSjitKcEoMQOEmVvStpNCNRXmSk', 2048, 2048, (42, 24, 28), [(.50,.40,.30,(130,104,106)), (.80,.20,.35,(150,44,62))], 'charcoal-burgundy, subject centre'),
  'story-b-2':       ('yzTuL74LYLey46xO4X9rihvGRs4', 2048, 2048, (214, 196, 198), [(.45,.40,.30,(58,50,52)), (.70,.70,.35,(244,226,222))], 'light rose-grey, dark subject'),
  'big-quote':       ('i3wLiFEx85bL9zj8Y2GBkjDc5z4', 2048, 2048, (26, 14, 18), [(.55,.62,.30,(200,40,64)), (.80,.30,.40,(60,18,30))], 'near-black, crimson lower-centre highlight'),
  'journal-a':       ('D6H1lHKBDuxkhpUVf8PPyt7Jivg', 2048, 2048, (226, 168, 176), [(.45,.50,.30,(255,56,86)), (.70,.30,.40,(240,214,214))], 'muted pink with brand-red centre'),
  'journal-b':       ('LksF7zMOHE97HJPqXDmb7LSvWE', 2048, 2048, (28, 18, 22), [(.50,.55,.25,(160,120,120)), (.30,.30,.40,(88,20,36))], 'charcoal with burgundy'),
  'journal-c':       ('ZMX4xonC6WvSRyRzHHgOkTDzw4', 2048, 2048, (230, 214, 214), [(.50,.55,.35,(70,26,36)), (.20,.20,.40,(246,240,238))], 'pale blush-grey, burgundy centre'),
  # abstract: near-black charcoal with a soft lit band across the middle, darker top and bottom
  'footer':          ('TF67zgMSYINSD7dymhKX4rhrTM', 2048, 2048, (22, 18, 20), [(.50,.46,.22,(104,50,60)), (.30,.60,.20,(62,30,38)), (.72,.58,.18,(80,36,46)), (.50,.95,.30,(14,12,13)), (.10,.10,.30,(30,22,26))], 'near-black charcoal, soft burgundy band across the middle'),
  'avatar-1':        ('POpTLGuLzTuWYxuEYrRGJD678', 280, 280, (60, 80, 110), [(.50,.45,.30,(210,170,140))], 'avatar'),
  'avatar-2':        ('aLd0GlWVHywVWuurCk8JtAWSPw', 512, 512, (200, 150, 60), [(.50,.45,.30,(120,90,70))], 'avatar'),
  'avatar-3':        ('PH9MBoozXCDuSg7Zw0ksQExNo', 512, 512, (170, 90, 60), [(.50,.45,.30,(230,190,160))], 'avatar'),
  'avatar-4':        ('duZSo1YDta06usFuc3EkJTiRdM', 512, 512, (140, 140, 130), [(.50,.45,.30,(90,70,60))], 'avatar'),
  'avatar-5':        ('ES6IJ8JiS4iNVkDK38fQhwjZDr4', 512, 512, (220, 170, 60), [(.50,.45,.30,(230,200,180))], 'avatar'),
}

WORK = 512  # render fields at low res then upscale (smooth, fast); grain added at full res


def field_image(w, h, base, fields, rng):
    s = WORK / max(w, h)
    ww, hh = max(8, round(w * s)), max(8, round(h * s))
    img = Image.new('RGB', (ww, hh), base)
    px = img.load()
    for y in range(hh):
        for x in range(ww):
            r, g, b = base
            for (fx, fy, fr, col) in fields:
                dx, dy = x / ww - fx, y / hh - fy
                wgt = math.exp(-(dx * dx + dy * dy) / (2 * fr * fr))
                r += (col[0] - r) * wgt; g += (col[1] - g) * wgt; b += (col[2] - b) * wgt
            px[x, y] = (int(r), int(g), int(b))
    img = img.filter(ImageFilter.GaussianBlur(ww / 40))
    return img.resize((w, h), Image.BICUBIC)


def add_grain(img, rng, amount=6):
    w, h = img.size
    grain = Image.effect_noise((w, h), 32).convert('L').point(lambda v: 128 + (v - 128) * amount // 32)
    base = img.convert('RGB')
    g = Image.merge('RGB', (grain, grain, grain))
    return Image.blend(base, Image.blend(base, g, 0.5), 0.06)


def noise_tile(size, seed):
    rng = random.Random(seed)
    img = Image.new('L', (size, size))
    img.putdata([max(0, min(255, int(rng.gauss(128, 40)))) for _ in range(size * size)])
    return img.convert('RGBA')


def blob_path(w, h, seed, points=7):
    """Closed smooth blob (Catmull-Rom → cubic Béziers) filling a w×h box."""
    rng = random.Random(seed)
    cx, cy = w / 2, h / 2
    pts = []
    for i in range(points):
        a = 2 * math.pi * i / points + rng.uniform(-0.2, 0.2)
        k = rng.uniform(0.78, 1.0)
        pts.append((cx + math.cos(a) * cx * k, cy + math.sin(a) * cy * k))
    n = len(pts)
    segs = []
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        segs.append((p1, c1, c2, p2))
    # normalise the DRAWN curve (sampled), not the through-points, to the full box: the mask must not overflow its
    # viewBox (overflow is clipped into flat edges); the original blob masks touch all four sides
    xs, ys = [], []
    for a, b, c, e in segs:
        for j in range(65):
            t = j / 64; u = 1 - t
            xs.append(u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*e[0])
            ys.append(u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*e[1])
    x0, y0 = min(xs), min(ys)
    sx, sy = w / (max(xs) - x0), h / (max(ys) - y0)
    f = lambda q: f'{(q[0] - x0) * sx:.2f} {(q[1] - y0) * sy:.2f}'
    d = f'M {f(segs[0][0])}'
    for a, b, c, e in segs:
        d += f' C {f(b)} {f(c)} {f(e)}'
    return d + ' Z'


def main():
    os.makedirs(os.path.join(PUB, 'standins'), exist_ok=True)
    os.makedirs(os.path.join(PUB, 'textures'), exist_ok=True)
    os.makedirs(os.path.join(PUB, 'masks'), exist_ok=True)
    rng = random.Random(1234)
    only = sys.argv[1:]
    unknown = [a for a in only if a not in SLOTS]
    if unknown:
        sys.exit(f'unknown slot(s): {unknown}')
    mpath = os.path.join(PUB, 'standins', 'manifest.json')
    manifest = json.load(open(mpath)) if only and os.path.exists(mpath) else {}
    for slot, (orig, w, h, base, fields, note) in SLOTS.items():
        if only and slot not in only:
            continue
        img = add_grain(field_image(w, h, base, fields, rng), rng)
        out = os.path.join(PUB, 'standins', f'{slot}.jpg')
        img.save(out, quality=82, optimize=True, progressive=True)
        manifest[slot] = {'file': f'/standins/{slot}.jpg', 'width': w, 'height': h, 'replacesOriginal': orig, 'note': note}
        print(f'{slot:16} {w}x{h}  {os.path.getsize(out)//1024} KB')
    if only:
        json.dump(manifest, open(mpath, 'w'), indent=1)
        return

    noise_tile(256, 1).save(os.path.join(PUB, 'textures', 'noise-a.png'))
    noise_tile(240, 2).save(os.path.join(PUB, 'textures', 'noise-b.png'))

    for name, (w, h), seed in [('blob-a', (314, 236), 11), ('blob-b', (297, 222), 22), ('blob-c', (314, 211), 33)]:
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><path d="{blob_path(w, h, seed)}" fill="#000"/></svg>\n'
        open(os.path.join(PUB, 'masks', f'{name}.svg'), 'w').write(svg)
    # avatar overlap: circle with a notch cut on the left where the previous avatar overlaps (48px grid, 32px step)
    open(os.path.join(PUB, 'masks', 'avatar-ring.svg'), 'w').write(
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">'
        '<mask id="m"><rect width="48" height="48" fill="#fff"/><circle cx="-8" cy="24" r="26" fill="#000"/></mask>'
        '<circle cx="24" cy="24" r="24" fill="#000" mask="url(#m)"/></svg>\n')

    json.dump(manifest, open(os.path.join(PUB, 'standins', 'manifest.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
