#!/usr/bin/env python3
"""
Generate the site favicons from the full-resolution logo master in
scripts/source/ajs-logo.png:

  favicon.ico                 (16, 32, 48 px, repo root)
  assets/favicon-32x32.png
  assets/apple-touch-icon.png (180x180)

The full logo (with BEER · WINE · SPIRITS) is illegible at favicon
sizes, so this crops just the red "AJ's" wordmark and centers it on a
square of the logo's own dark panel color.

Usage: python scripts/make-favicons.py
Rerun this whenever the logo changes.
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = ROOT / "scripts" / "source" / "ajs-logo.png"

# "AJ's" wordmark bounds inside the 1544x980 master, white outline included.
WORDMARK_BOX = (186, 78, 1362, 496)
PANEL_COLOR = (35, 31, 32, 255)  # the logo's dark panel
PADDING = 0.08                   # fraction of the square left on each side


def make_icon(wordmark: Image.Image, size: int) -> Image.Image:
    # Work at 8x and downsample once, so thin outlines stay crisp.
    big = size * 8
    canvas = Image.new("RGBA", (big, big), PANEL_COLOR)
    avail = round(big * (1 - 2 * PADDING))
    scale = avail / max(wordmark.size)
    w, h = round(wordmark.width * scale), round(wordmark.height * scale)
    mark = wordmark.resize((w, h), Image.LANCZOS)
    canvas.alpha_composite(mark, ((big - w) // 2, (big - h) // 2))
    return canvas.resize((size, size), Image.LANCZOS)


def main():
    logo = Image.open(LOGO_PATH).convert("RGBA")
    wordmark = logo.crop(WORDMARK_BOX)

    make_icon(wordmark, 180).convert("RGB").save(
        ROOT / "assets" / "apple-touch-icon.png", optimize=True)
    make_icon(wordmark, 32).save(
        ROOT / "assets" / "favicon-32x32.png", optimize=True)
    make_icon(wordmark, 48).save(
        ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    print("Wrote favicon.ico, assets/favicon-32x32.png, "
          "assets/apple-touch-icon.png")


if __name__ == "__main__":
    main()
