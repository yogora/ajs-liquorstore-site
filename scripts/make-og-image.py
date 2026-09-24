#!/usr/bin/env python3
"""
Generate assets/og-image.jpg — the Open Graph / Twitter Card share
image for the site — from the hero storefront photo plus the AJ's
logo badge.

Usage: python scripts/make-og-image.py
(Run from the repo root, or anywhere — paths below are resolved
relative to this script's location.)

Rerun this whenever the hero photo or logo changes.
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
HERO_PATH = ROOT / "assets" / "hero-exterior.png"
LOGO_PATH = ROOT / "assets" / "ajs-logo.png"
OUT_PATH = ROOT / "assets" / "og-image.jpg"

OUT_W, OUT_H = 1200, 630
LOGO_WIDTH = 520
SCRIM_RGBA = (12, 9, 9, 190)  # near-black, ~75% opacity
JPEG_QUALITY = 88
MAX_BYTES = 300 * 1024


def cover_resize(im: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Scale `im` up to fully cover target_w x target_h, then center-crop
    to exactly that size (like CSS `background-size: cover`)."""
    src_w, src_h = im.size
    scale = max(target_w / src_w, target_h / src_h)
    new_w, new_h = round(src_w * scale), round(src_h * scale)
    im = im.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return im.crop((left, top, left + target_w, top + target_h))


def main():
    hero = Image.open(HERO_PATH).convert("RGBA")
    canvas = cover_resize(hero, OUT_W, OUT_H)

    # Heavy, uniform dark scrim over the whole photo so the storefront
    # reads as a muted backdrop and the logo is the clear focal point,
    # rather than the two competing for attention.
    scrim = Image.new("RGBA", (OUT_W, OUT_H), SCRIM_RGBA)
    canvas = Image.alpha_composite(canvas, scrim)

    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_h = round(logo.size[1] * (LOGO_WIDTH / logo.size[0]))
    logo = logo.resize((LOGO_WIDTH, logo_h), Image.LANCZOS)

    # Dead center — comfortably inside the 630x630 safe zone platforms
    # use when they crop the image to a square.
    x = (OUT_W - LOGO_WIDTH) // 2
    y = (OUT_H - logo_h) // 2
    canvas.alpha_composite(logo, (x, y))

    canvas = canvas.convert("RGB")
    canvas.save(OUT_PATH, "JPEG", quality=JPEG_QUALITY, optimize=True)

    size = OUT_PATH.stat().st_size
    quality = JPEG_QUALITY
    while size > MAX_BYTES and quality > 60:
        quality -= 5
        canvas.save(OUT_PATH, "JPEG", quality=quality, optimize=True)
        size = OUT_PATH.stat().st_size

    print(f"Wrote {OUT_PATH} — {canvas.size[0]}x{canvas.size[1]}, "
          f"{size / 1024:.1f} KB, quality={quality}")


if __name__ == "__main__":
    main()
