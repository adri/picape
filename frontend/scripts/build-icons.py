#!/usr/bin/env python3
"""Regenerates the app icon set: light, dark and tinted variants.

The icon echoes the original photo: a still life of aubergine, vine
tomatoes and a pasta bundle on a warm ground — but drawn flat, the way
Apple's own icons are. Detail comes from layered silhouettes, one soft
sheen per object and cut-line gaps, not from photo shading.

Run: python3 scripts/build-icons.py
Output: assets/images/icon.png, icon-dark.png, icon-tinted.png
"""
import math

from PIL import Image, ImageChops, ImageDraw, ImageFilter

S = 4096          # working canvas, 4x supersampled
OUT = 1024

CREAM_TOP = (243, 229, 203)     # #F3E5CB — warm wood, light end
CREAM_BOT = (206, 165, 116)     # #CEA574
DARK_TOP = (38, 30, 24)         # #261E18 — dark wood
DARK_BOT = (16, 12, 9)          # #100C09

AUB = (62, 45, 79)              # #3E2D4F aubergine skin
AUB_SHADE = (46, 33, 60)        # #2E213C
AUB_SHEEN = (148, 126, 170)     # soft violet sheen
CALYX = (94, 122, 51)           # #5E7A33 olive calyx
CALYX_DARK = (74, 98, 40)
STEM = (107, 84, 46)            # #6B542E
TOMATO = (217, 62, 46)          # #D93E2E
TOMATO_SHADE = (176, 42, 32)    # #B02A20
TOMATO_SHEEN = (244, 124, 100)
VINE = (78, 104, 42)            # #4E682A
PASTA = (240, 214, 140)         # #F0D68C
PASTA_SHADE = (216, 182, 100)   # #D8B664
TWINE = (150, 110, 64)          # #966E40
WHITE = (255, 255, 255)


def gradient(size, top, bottom):
    img = Image.new("RGB", (1, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        px[0, y] = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    return img.resize((size, size))


def layer():
    return Image.new("RGBA", (S, S), (0, 0, 0, 0))


def mask_of(img):
    return img.split()[3]


def clip_to(img, mask):
    img.putalpha(ImageChops.multiply(mask_of(img), mask))
    return img


def aubergine(cx, top, height, max_hw, tinted):
    """A plump teardrop: full bulb low, slim neck under the calyx."""
    img = layer()
    d = ImageDraw.Draw(img)
    col = WHITE if tinted else AUB
    # Bulb ellipse and neck ellipse unioned into one silhouette.
    d.ellipse([cx - max_hw, top + int(height * 0.30),
               cx + max_hw, top + height], fill=col)
    d.ellipse([cx - int(max_hw * 0.55), top,
               cx + int(max_hw * 0.55), top + int(height * 0.55)], fill=col)
    skin = mask_of(img)

    if not tinted:
        shade = layer()
        ImageDraw.Draw(shade).ellipse(
            [cx + int(max_hw * 0.15), top + int(height * 0.30),
             cx + int(max_hw * 1.5), top + height + 200],
            fill=AUB_SHADE + (255,))
        img.alpha_composite(clip_to(shade, skin))
        # A long soft sheen down the left flank, as on the photo's gloss.
        sheen = layer()
        ImageDraw.Draw(sheen).ellipse(
            [cx - int(max_hw * 1.05), top + int(height * 0.28),
             cx - int(max_hw * 0.35), top + int(height * 0.85)],
            fill=AUB_SHEEN + (255,))
        sheen = sheen.filter(ImageFilter.GaussianBlur(110))
        img.alpha_composite(clip_to(sheen, skin))

    # Calyx: a cap over the neck with pointed leaves splaying over the skin.
    cal = layer()
    cd = ImageDraw.Draw(cal)
    ccol = WHITE if tinted else CALYX
    neck_y = top + int(height * 0.10)
    cd.ellipse([cx - int(max_hw * 0.62), neck_y - 200,
                cx + int(max_hw * 0.62), neck_y + 300], fill=ccol)
    for ang in (-58, -28, 0, 28, 58):
        tx = cx + int(max_hw * 0.72 * math.sin(math.radians(ang)))
        ty = neck_y + int(430 * (0.55 + 0.45 * abs(math.cos(math.radians(ang)))))
        cd.polygon([(cx + int(170 * math.sin(math.radians(ang))), neck_y - 40),
                    (tx - 120, ty - 150), (tx, ty + 60), (tx + 120, ty - 130)],
                   fill=ccol)
    cd.rounded_rectangle([cx - 70, neck_y - 460, cx + 70, neck_y - 100],
                         radius=60, fill=WHITE if tinted else STEM)
    img.alpha_composite(cal)
    return img, skin


def tomato(cx, cy, r, tinted):
    img = layer()
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE if tinted else TOMATO)
    skin = mask_of(img)

    if not tinted:
        shade = layer()
        ImageDraw.Draw(shade).ellipse(
            [cx - r // 3, cy, cx + r + r // 2, cy + r + r // 3],
            fill=TOMATO_SHADE + (255,))
        img.alpha_composite(clip_to(shade, skin))
        sheen = layer()
        ImageDraw.Draw(sheen).ellipse(
            [cx - r + r // 5, cy - r + r // 6, cx - r // 6, cy - r // 3],
            fill=TOMATO_SHEEN + (255,))
        sheen = sheen.filter(ImageFilter.GaussianBlur(60))
        img.alpha_composite(clip_to(sheen, skin))

    # Star calyx sunk into the top.
    cal = layer()
    cd = ImageDraw.Draw(cal)
    ccol = WHITE if tinted else CALYX_DARK
    for ang in (-75, -38, 0, 38, 75):
        ex = cx + int(r * 0.62 * math.sin(math.radians(ang)))
        ey = cy - r + int(r * 0.30 * (1 - math.cos(math.radians(ang))))
        cd.polygon([(cx, cy - r + r * 0.18), (ex - r * 0.10, ey),
                    (ex, ey + r * 0.30), (ex + r * 0.10, ey)], fill=ccol)
    cd.ellipse([cx - r * 0.16, cy - r - r * 0.06, cx + r * 0.16, cy - r + r * 0.30],
               fill=ccol)
    img.alpha_composite(cal)
    return img, skin


def vine(pts, width, tinted):
    img = layer()
    d = ImageDraw.Draw(img)
    col = WHITE if tinted else VINE
    d.line(pts, fill=col, width=width, joint="curve")
    for x, y in pts:
        d.ellipse([x - width // 2, y - width // 2, x + width // 2, y + width // 2],
                  fill=col)
    return img


def pasta_bundle(cx, base_y, tinted):
    """A tall bundle of thin spaghetti strands standing nearly upright,
    tied low with a twine band and a small knot — as in the photo."""
    img = layer()
    n, w, h = 11, 78, 2100
    for i in range(n):
        f = (i / (n - 1)) - 0.5            # -0.5..0.5
        strand = layer()
        sd = ImageDraw.Draw(strand)
        col = WHITE if tinted else (PASTA if i % 3 else PASTA_SHADE)
        top = base_y - h - int(abs(f) * 180)  # edge strands slightly shorter
        sd.rounded_rectangle([cx - w // 2, top, cx + w // 2, base_y],
                             radius=w // 2, fill=col)
        img.alpha_composite(
            strand.rotate(f * 9, resample=Image.BICUBIC, center=(cx, base_y)))
    d = ImageDraw.Draw(img)
    # Twine band just above the tomatoes, with a small knot at the front.
    band_y = base_y - 1300
    d.rounded_rectangle([cx - 330, band_y, cx + 330, band_y + 150],
                        radius=70, fill=WHITE if tinted else TWINE)
    d.ellipse([cx - 90, band_y - 20, cx + 110, band_y + 170],
              fill=WHITE if tinted else TWINE)
    return img


def compose(bg_top, bg_bot, tinted=False):
    img = layer() if tinted else gradient(S, bg_top, bg_bot).convert("RGBA")

    # Back to front: pasta, aubergine, tomatoes, vine.
    elements = [pasta_bundle(3050, 3300, tinted)]

    aub, aub_skin = aubergine(1900, 560, 2750, 700, tinted)
    aub = aub.rotate(-18, resample=Image.BICUBIC, center=(1900, 2000))
    aub_skin = aub_skin.rotate(-18, resample=Image.BICUBIC, center=(1900, 2000))
    elements.append(aub)

    for cx, cy, r in [(2700, 2950, 430), (3300, 2650, 360), (2620, 2180, 320)]:
        t, _ = tomato(cx, cy, r, tinted)
        elements.append(t)

    elements.append(vine([(2430, 1990), (2620, 1870), (2960, 1900), (3300, 2280)],
                         40, tinted))

    for el in elements:
        if tinted:
            # A cut-line gap where a front object overlaps what's behind it.
            dilated = mask_of(el).filter(ImageFilter.MaxFilter(27))
            img.putalpha(ImageChops.subtract(mask_of(img), dilated))
        img.alpha_composite(el)

    if tinted:
        # A sheen slit keeps the aubergine readable as a silhouette.
        cut = layer()
        ImageDraw.Draw(cut).ellipse([1560, 1350, 1860, 2650], fill=WHITE)
        img.putalpha(ImageChops.subtract(mask_of(img),
                                         ImageChops.multiply(mask_of(cut), aub_skin)))

    return img.resize((OUT, OUT), Image.LANCZOS)


compose(CREAM_TOP, CREAM_BOT).convert("RGB").save("assets/images/icon.png")
compose(DARK_TOP, DARK_BOT).convert("RGB").save("assets/images/icon-dark.png")
compose(None, None, tinted=True).save("assets/images/icon-tinted.png")
print("wrote assets/images/icon{,-dark,-tinted}.png")
