# The Story of My Life — working notes

A personal site about growing up between the US and China. Plain HTML, CSS and JS:
no build step, no dependencies, no framework. GitHub Pages serves `main` directly at
https://yclong111.github.io, so a push is a deploy and takes a minute or two to appear.

```
index.html       quote page -> "My Upbringing" yin-yang page -> Stage 3 section
us.html          Stage 1: the US      (scrapbook page, paper #f4f2f1)
china.html       Stage 2: China       (scrapbook page, paper #cc2229)
scrapbook.css    shared collage styling for both stage pages
scrapbook.svg    sticker symbols referenced by <use href="scrapbook.svg#id">
transitions.js   canvas animations played when a yin-yang half is clicked
```

Preview locally with `python3 -m http.server 8765`; the `<use href>` sticker references
need a real server, so opening the files directly from disk will not render them.

## Decisions that are easy to undo by accident

**The wheel is the only colour on the homepage.** Everything else is plain black and
white. This was asked for explicitly after a more decorated version; resist adding
accent colours to the headings, the side text or the polaroids.

**The scroll zooms into the DARK half, not the light one.** Both versions were built;
dark won. The zoom is anchored to `SAFE_POINT` (150, 126) — the point inside the dark
lobe furthest from any non-dark pixel, in the SVG's own 200x200 viewBox. It is expressed
in SVG coordinates rather than screen pixels on purpose: the disc keeps spinning until
the moment the scroll starts, so a screen-space fraction would go stale and the "safe"
point would drift off the dark half.

**The zoom blends colour as it scales.** `blendStops()` walks the dark gradient's stops
toward `#0c0c0e`, finishing at 80% of the scroll, so the frame is already flat Stage 3
black before it fills the screen. That is why the hand-off needs no cross-fade — a
cross-fade was tried and explicitly rejected.

**The lighting stays fixed while the disc spins.** `lightingLoop()` reads the live
rotation every frame and counter-rotates each gradient plus the drop-shadow offset.
The gradients are converted to `userSpaceOnUse` first, because `objectBoundingBox` units
skew a rotation whenever a shape's bounding box is not square — and the dark half's is not.
Without this the highlight orbits the ball like a moving sun.

**Font is Archivo**, the wide grotesque chosen from a reference photo, with
`font-stretch:expanded`. Times New Roman was tried for a while and reverted; do not
reintroduce it.

**Colours:** Stage 3 / homepage black `#0c0c0e`, US paper `#f4f2f1`, China red `#cc2229`.
The transition wipes in `transitions.js` reuse these exact values so each animation lands
on its destination page's own background with no visible seam.

## Click transitions

Clicking a half plays a full-screen canvas animation, then navigates: a Chinese dragon
dragging a red wipe for China (2.7s), a Philly cheesesteak with dripping cheese for the
US (2.1s). Everything is drawn in code — there are no image assets to lose. Both are
skipped when the visitor prefers reduced motion, and the destination pages fade in over
the wipe colour via `.board`'s `pageIn` animation.

## Still to do

Every photo on every page is a placeholder: the `📷 Add a photo` polaroids on the
homepage's two columns, and the `.polaroid` figures on `us.html` and `china.html`. They
need real photos and real captions. The Stage 3 section is also still placeholder copy.

## Working agreement

Give the live URL after every push, and mention that GitHub Pages takes a minute or two
to rebuild. The site is checked on the deployed URL, not on a local preview.
