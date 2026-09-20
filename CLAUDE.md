# The Story of My Life — working notes

A personal site about growing up between the US and China. Plain HTML, CSS and JS:
no build step, no dependencies, no framework. GitHub Pages serves `main` directly at
https://yclong111.github.io, so a push is a deploy and takes a minute or two to appear.

```
index.html       the whole spine: prologue + chapters I-V + coda
chapters.css     chapters II-V, the chapter rail, the S connectors
chapters.js      reveals, rail state, connector draw, emblem links
us.html          Chapter I, light half   (scrapbook room, paper #f4f2f1)
china.html       Chapter I, dark half    (scrapbook room, paper #cc2229)
highschool.html  Chapter II room   (#debate / #sports / #community)
finance.html     Chapter III room  (#spark / #language / #proof)
today.html       Chapter IV room   (#campus / #internships / #next)
home.html        Chapter V room    (#family / #fun / #curious)
scrapbook.css    shared collage styling for every room
rooms.css        multi-spread room layout, loaded after scrapbook.css
scrapbook.svg    sticker symbols referenced by <use href="scrapbook.svg#id">
transitions.js   canvas animations played when a yin-yang half is clicked
```

## The shape of the site

One chronological read, top to bottom, in six movements:

| | | |
|---|---|---|
| Prologue | the Lahiri quote | sets the tension |
| I | Two Worlds | upbringing; the yin-yang, two rooms |
| II | Finding My Voice | high school: debate, sports, community |
| III | The Pivot | how the cross-cultural read became a read on markets |
| IV | The Work | college organisations, internships, what comes next |
| V | Off the Clock | family, fun, current obsessions |
| Coda | the wheel again | whole, and finally standing still |

Three rules hold it together:

**Panels alternate dark and light** all the way down, so the yin/yang split
becomes the rhythm of the whole site rather than one page's trick. II and IV are
black; III, V and the coda are paper.

**Every chapter carries one emblem**, drawn in the same language as the wheel:
monochrome, glowing, built from circles and the wheel's own S-curve. The emblem is
the only door into that chapter's room. Chapter II's three petals deep-link to the
three sections of `highschool.html`; the others open their room at the top.

**The spine is monochrome; colour lives inside the rooms.** Each room gets its own
paper (manila for high school, ledger green for finance, blueprint blue for today,
warm peach for home). Never bring those colours out onto the spine.

The connector between chapters is the yin-yang's own dividing curve, pulled out and
drawn on scroll. Chapters share Chapter I's exact left and right insets
(`--gutter` in chapters.css) so every text edge on the site lines up.

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

**Colours:** spine black `#0c0c0e`, spine paper `#f4f2f1`, China red `#cc2229`.
The click transitions now wipe in black and each room fades up from black on arrival
(`body::after` in scrapbook.css), so a room's own paper colour is free to be anything.

## Click transitions

Clicking a half plays a full-screen canvas animation, then navigates: a Chinese dragon
dragging a red wipe for China (2.7s), a Philly cheesesteak with dripping cheese for the
US (2.1s). Everything is drawn in code — there are no image assets to lose. Both are
skipped when the visitor prefers reduced motion, and the destination pages fade in over
the wipe colour via `.board`'s `pageIn` animation.

## Still to do

Every photo on every page is a placeholder, and so is every word in chapters II-V:
the ledes, the three strands beside each emblem, and all the notes and captions in
`highschool.html`, `finance.html`, `today.html` and `home.html`. The structure is
finished; the content is not. Chapter I is the only chapter whose copy is real.

The new rooms have no signature click animation yet - they navigate plainly, unlike the
dragon and the cheesesteak. That was deliberate, to keep out of `transitions.js` while it
was being edited, and it is the obvious next thing to build.

## Working agreement

Give the live URL after every push, and mention that GitHub Pages takes a minute or two
to rebuild. The site is checked on the deployed URL, not on a local preview.
