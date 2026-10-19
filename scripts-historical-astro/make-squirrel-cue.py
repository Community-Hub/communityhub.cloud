"""Cut the happy squirrel out of its scene background (the source GIFs have no alpha).

Output: public/assets/squirrel-cue.webp (animated, transparent) and
squirrel-cue-still.png (first frame, used for reduced motion).
Run from the repo root: python3 scripts/make-squirrel-cue.py
"""
import numpy as np
from PIL import Image, ImageSequence
from scipy import ndimage as ndi

SRC = "public/assets/mascot-happy-clean.gif"
FRAMES = range(9, 17)  # the arms-out "look here" loop of the happy squirrel


def cut(rgb):
    a = rgb.astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    bgish = (b - r) >= 8                      # sky, shelf shadow and floor are blue-tinted; the squirrel is neutral
    lab, _ = ndi.label(bgish)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    fg = ~bg
    # Keep only the squirrel: drop floor-line specks and the stray heart pixels.
    lab2, n = ndi.label(fg, structure=np.ones((3, 3)))
    sizes = ndi.sum(fg, lab2, range(1, n + 1))
    main = lab2 == (1 + int(np.argmax(sizes)))
    near = ndi.binary_dilation(main, iterations=5)
    keep = np.isin(lab2, [i for i in np.unique(lab2[near]) if i and sizes[i - 1] >= 12])
    fg = fg & keep
    bg = ~fg
    ring = ndi.binary_dilation(fg, iterations=2) & bg
    lum = (0.3 * r + 0.59 * g + 0.11 * b)
    alpha = np.where(fg, 255.0, 0.0)
    soft = np.clip((235 - lum) / (235 - 30), 0, 1) * 255
    alpha = np.where(ring, soft, alpha)
    out = np.dstack([np.where(ring, 30, rgb[..., 0]), np.where(ring, 30, rgb[..., 1]), np.where(ring, 30, rgb[..., 2]), alpha]).astype("uint8")
    return out


im = Image.open(SRC)
all_frames = [np.array(f.convert("RGB")) for f in ImageSequence.Iterator(im)]
cut_frames = [cut(all_frames[i]) for i in FRAMES]
alpha_union = np.max([f[..., 3] for f in cut_frames], axis=0) > 20
ys, xs = np.where(alpha_union)
pad = 2
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad + 1, 182), min(ys.max() + pad + 1, 206))
print("crop", box)
imgs = [Image.fromarray(f, "RGBA").crop(box) for f in cut_frames]
imgs[0].save("public/assets/squirrel-cue-still.png", optimize=True)
imgs[0].save("public/assets/squirrel-cue.webp", save_all=True, append_images=imgs[1:], duration=300, loop=0, lossless=True, method=6)
print(len(imgs), imgs[0].size)
