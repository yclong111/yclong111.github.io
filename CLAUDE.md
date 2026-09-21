# The Story of My Life — working notes

A personal site about growing up between the US and China. Plain HTML, CSS and JS:
no build step, no dependencies, no framework. GitHub Pages serves `main` directly at
https://yclong111.github.io, so a push is a deploy and takes a minute or two to appear.

```
index.html       the whole site: opening + prologue + chapters I-V + coda, one page
chapters.css     chapters II-V, the chapter rail, the S connectors
chapters.js      reveals, rail state, connector draw
dragon.js        the animated dragon on the first screen (canvas)
us.html          Chapter I, light half   (Philadelphia skyline, disc #f4f2f1)
china.html       Chapter I, dark half    (Shanghai skyline, disc #cc2229)
place.css        layout for those two pages; they also load chapters.css/js
images/          photographs; yicheng.jpg is the opening portrait
transitions.js   canvas animations played when a yin-yang half is clicked
```

## The shape of the site

One page, one colour, read top to bottom:

| | | |
|---|---|---|
| The Name | the character, defined, with the dragon itself | why a dragon keeps appearing |
| Opening | portrait, name, introduction | who is speaking |
| I | Two Worlds | opens on the Lahiri quote, then the yin-yang |
| II | Not American Enough | coming back at sixteen, ostracized for the opposite reason |
| III | So I Said Yes | four pillars of high school: debate, real-life experience, community, sports |
| IV | The Present | CMU today: the fund, the academy, the chapter, the internships |
| V | Some Other Things That Matter the World to Me | family, the 76ers, sci-fi movies, skiing: four real photo cards that flip over to his own words |
| Why | Why Recalc | why this program (community, authenticity, inclusivity) |
| Coda | the wheel again | whole, and finally standing still |

**The opening page** fills its left 40% with the portrait and puts the name and
introduction on the right. The source photo is landscape and he stands just
right of centre, so `object-position:52% 30%` is what keeps his face inside the
strip as the column narrows - a plain centre crop loses him. The photo meets the
page on a hard edge; a gradient dissolve was tried and rejected. Below 1000px it
stacks above the text, still on a hard edge.

**The epigraph page waits to be reached.** It carries the "Chapter I" label and
is the second screen, so its lines reveal when the section scrolls into view -
`chapters.js` adds `.in` to `.quote-page` and the CSS is scoped to that. On load
it would finish playing while the reader is still on the opening page, and they
would arrive at a quote that had already landed.

**A reveal that never fires must not leave a blank page.** Everything waiting to
be revealed sits at `opacity:0`, so a dead IntersectionObserver would show nothing
rather than something unanimated. `chapters.js` watches whether the observer has
reported at all; if it has not shortly after load, it reveals what is on screen
and drives the rest from scroll instead. That net covers `.pop-scroll` too, which
the inline script in index.html reveals through its own observer.

**Nothing hides itself unless JavaScript is running.** An inline script in the
head puts `js` on `<html>`, and every reveal's `opacity:0` is scoped to `.js`.
Without it the reveals all start hidden and a broken script leaves a blank page.

The name page is the first screen, so its character and definition animate in on
load. The introduction, which used to be first and played on load, now waits to
be scrolled to - anything that plays on load while the reader is still on the
screen above it has finished before they arrive. `chapters.js` reveals both
`.quote-page` and `.intro` as whole sections. Each has its own keyframes ending at its own resting opacity -
the shared `.rise` helper ends at 1, which would burn off the deliberate dimming
on the bio and the scroll cue.

**Everything is `#0c0c0e`,** including the epigraph page and the mobile story
block, which were `#000` until the opening page sat above them and made the
seam visible. Nothing alternates, nothing inverts. An earlier
version alternated dark and light panels down the page and was rejected: the
only thing that should change as you scroll is the writing.

**Chapter II is one passage, not three strands.** It is the only chapter that
drops the entry grid: it is a single piece of writing whose point is that it
keeps going, and cutting it into three columns of fragments works against that.
It ends on its own line, set large under a short rule. The italic on *not* is
the sentence's hinge - not ostracized for being foreign, ostracized for not
being native - so keep it.

**Chapter III is four pillars, loosely scattered.** Debate, work, community and
sports as large white circles placed by hand across the field (percent
positions, slightly different sizes), not on a ring and not in a column: a
perfect ring read as a diagram, and none of the four came before the others.
Below 640px they drop into a loose 2x2, because four floating circles collide on
a phone.

Tapping one **blooms it into the pop-up**: the panel starts clipped to that
circle (`clip-path: circle()` at its centre and radius, read from its box) and
grows to cover the screen, then the writing arrives. The panel surface is
`#17171b`, one shade lighter than the page, on purpose - in the page's own black
the expanding edge is invisible and the panel just appears. The
panel's `.open` class and its focus move happen after a forced reflow rather
than inside `requestAnimationFrame`: on a throttled frame clock the rAF version
opened the panel fully transparent with focus left behind it.

**Chapter II ends on a reveal.** What he worked out from it sits behind a
"What I took from it" button, under the line it answers, and opens only when the
reader asks. It animates with `grid-template-rows: 0fr -> 1fr`, which is the one
way to transition to a height that is not known in advance. The chapter grows
past one screen when open; that is expected.

**Every chapter has a different shape, on purpose.** II is one passage with a
photo beside it; III is a ring of four circles that open full-screen panels; IV
is a ledger of what is running right now; V is an uneven wall of pictures that turn over, each with its story on the back. Scrolling should not feel like
the same slide four times. If another is ever added, give it a rhythm of its own
rather than reusing one of these.

**Chapters III and IV share one template** - ghost numeral, chapter label, title,
lede, then three entries in a row, each a rule, a heading, a line and a plain
picture frame. They have no artwork of their own. An earlier version gave each
chapter a bespoke animated emblem (rotating petals, an orbit) that doubled as a
door into a separate collage room; both the emblems and those four rooms were
cut. The content lives inline on the page now.

**The dragon is the site's motif, and it is explained before anything else.**
The FIRST screen is a dictionary entry for the character, because his surname is
Long - the character is the dragon, and without that the dragon elsewhere looks
decorative. After that it recurs three ways: the character itself returns small
at the coda and above the heading on `us.html`; a length of the dragon's back
shows in every connector between chapters, cut off at both ends so it reads as
one animal passing behind the page; and a full dragon arcs over the skyline on
`china.html`. The canvas dragon in `transitions.js` was always there and is now
part of the same idea.

**It belongs to the opening, not to the whole site.** The dragon is the name,
and the name is what the first screens are about; past the upbringing it would
just be swimming over other people's chapters. `dragon.js` fades the canvas out
once `#heroScroll` has left the top of the viewport and brings it back if the
reader scrolls up, and stops drawing while it is gone.

**It travels straight across and only across.** An earlier version steered
toward wandering targets and banked around at the edges, which meant it looped,
climbed and tangled itself over the writing. Its path is now a horizontal line -
it cannot loop, because there is nothing to loop with - and the S-shape is the
swimming wave laid on that line rather than a curve in the path. Direction only
changes once the whole body is off screen: a visible reversal either flips the
body to the far side of the head in one frame or swings the tail round like a rod.

The live dragon is drawn on a canvas (`dragon.js`), not in SVG: it has to keep
moving. Its spine is the sum of two travelling sine waves of different
wavelengths, so the body ripples instead of pulsing in lockstep, and every other
part - segments, dorsal spines, legs, mane, whiskers, jaw - hangs off that one
curve.

**The canvas is `position:fixed` over the whole viewport**, so the dragon stays
with the reader the whole way down rather than decorating one section. That is
why NO section on index.html paints its own background: the page's black comes
from `<body>`, the canvas sits above it at `z-index:0`, and every section's
content sits above that. Give a section back a background and the dragon
disappears underneath it.

It swims at 30-52 px/s, wanders toward a new point every 9-16 seconds, and turns
back once half of it has left the frame rather than disappearing and reappearing
elsewhere.

**The head is taken from the same curve as the body**, one short step apart,
rather than from the bare path. The wave is a lateral offset, so a head placed
on the path sits beside its own neck and the two visibly come apart.

**It stays the right way up on the way back.** The spines belong on its back and
the belly plates underneath whichever way it points, but both are derived from
the travel direction, which inverts when it swims left. A mirror (`upSign`)
handles that, and it is only flipped while the dragon is close to vertical,
where the switch cannot be seen. The wave itself is measured against the
un-mirrored normal - flipping that would phase-shift the whole body by half a
wavelength in one frame.

**The body follows the path the head actually took.** `dragon.js` keeps a trail
of head positions and samples each segment at a fixed arc length back along it.
This is the whole reason the trail exists: with the body simply drawn behind the
head in its current facing, turning round either swings the tail across the
screen like a rod or flips it to the other side in a single frame. The
undulation is a lateral offset applied on top of that path, not a wiggle in the
path itself - in the path, its wavelength would be tied to speed and a slow
dragon would ripple in slow motion.

**Check brace balance after editing chapters.css.** A stray `}` at the top level
does not throw anything: the parser folds it into the next rule's selector,
which becomes invalid, and that rule is silently dropped. That is how the Why
Recalc text sat at the Chapter II size for a while. Count `{` against `}` (with
comments stripped) before shipping.

Frame deltas are clamped to 50ms: a backgrounded tab resumes with a huge gap and
would teleport it across the screen in one frame. It pauses when the tab is
hidden, and a resize redraws immediately, because resizing clears the canvas and
the next frame may never arrive if rAF is throttled.

The hero zoom still works over the top of it: the dark lobe is an opaque fill,
so at full scale it covers the canvas, and it blends to the same `#0c0c0e` that
`<body>` paints.

The static symbols live in a `.dg-sprite` inside each document rather than an external
file: external `<use>` content cannot be styled by the referencing page, and the
whole point is that each instance takes the colour of wherever it sits. The body
strokes use `vector-effect:non-scaling-stroke` - the connector scales the symbol
to roughly 0.6, which would otherwise thin the line to about a pixel.

A drawn dragon head was tried at the coda and beside the character, and cut both
times: at that size it reads as a fish. The character does that job. The head
survives only small, at the end of the arc over Shanghai, where it reads fine.

**The other graphic motif is the wheel's own dividing curve**, drawn on scroll
in the connector between chapters. Chapters share Chapter I's left and right
insets (`--gutter`) so every text edge on the page lines up.

**The rail must never touch the writing.** It is ticks only; the label is a
chip that appears on hover, on its own solid background. Below 1000px it moves
to a row along the bottom, because the gap between Chapter I's right column and
a side rail closes to a few pixels as the viewport narrows. If you widen the
rail or the type, re-measure that gap before shipping.

**The wheel page is one centred row: the writing left, the wheel right.** Both
columns are anchored to their own gutter, so they bracket the screen with the
whitespace in the middle. Two earlier versions were rejected: a column of text
down each side of a centred wheel (with a taped polaroid under each), and then
the title and copy stacked above a centred wheel, which left the whole top-right
of the screen empty. The text column is capped at `38rem` so its measure stays
readable no matter how wide the screen gets. Below 900px it stacks, writing
first. The side columns, their labels and the polaroid styling are gone, along
with the `.story-flow` block that duplicated that copy for narrow screens.

The paragraph's dimming is done with `color:rgba(255,255,255,.7)`, NOT with
`opacity`, so the key phrases can read brighter than the text around them. The
Upbringing page has no bold in its writing and NO UNDERLINING anywhere (both asked
for explicitly): the key phrases stay regular weight and just brighten to white, one
after another, once the paragraph has landed. The title itself stays bold (900) and
upright - a lighter, italic-"My" version was tried and the owner asked for the
original back. The short rule under the title is not text underlining; it stays.

Under the paragraph sits the **life-line**: the wheel as a timeline. A filled bar is
the light half (the US), a hollow bar the dark half (China), and the widths are the
years - labelled "Age 0 - US", "Age 6 - China", "Age 16 - US" and "now" (the last bar
fades out, because it is not over). Black and white only, like everything else here.

The hover caption ("Stage 1: the US" / "Stage 2: china") and the "click the yin or the
yang" hint sit BELOW the wheel and clear of it - the caption first, the hint under
it. Neither may overlap the disc or its glow. On phones the wheel is smaller so the
hint stays above the bottom rail.

**The disc spins during a rest zone at the start of the pinned scroll**, and
freezes once the zoom begins - frozen because `SAFE_POINT` is only stable while
the disc is still. That zone was 15vh out of 165vh, which froze it almost as
soon as the section pinned and made it look like it never span at all. It is
40vh out of 190vh now. The zoom's own 150vh is unchanged.

**The two halves of the wheel are pages, not rooms.** `us.html` and `china.html`
are built from the same parts as the chapters - same type, same entries, same
frames - so clicking through the wheel does not land you on a different website.
They were collage pages and that was cut. What makes each one its place is a
line-drawn skyline (Philadelphia: rowhouses, City Hall with William Penn, the
two Liberty Places, Comcast; Shanghai: Jin Mao, the Shanghai Tower, the SWFC's
opening, the Oriental Pearl) and one disc behind it carrying the colour of the
half you arrived from - paper for the light half, red for the dark. The buildings
are filled with the page's own black and outlined, so the disc shows only through
the gaps. The light disc is held at half opacity; at the red one's it glares.

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
reintroduce it. The one exception is the character, set in Noto Serif SC and
requested from Google Fonts with `&text=%E9%BE%99` so only that single glyph is
downloaded.

**Colours:** spine black `#0c0c0e`, spine paper `#f4f2f1`, China red `#cc2229`.
The click transitions wipe in black and each destination fades up from black on
arrival (`body::after` in place.css).

## Click transitions

Clicking a half plays a full-screen canvas animation, then navigates: a Chinese dragon
dragging a red wipe for China (2.7s), a Philly cheesesteak with dripping cheese for the
US (2.1s). Everything is drawn in code — there are no image assets to lose. Both are
skipped when the visitor prefers reduced motion, and the destination pages fade up from
black via `body::after` in place.css.

## Still to do

**Chapter V's cards flip, and all four are real.** Each `.flip` is a button holding
two faces in one grid cell, so the card is as tall as the taller face. The photos are
`images/family.jpg`, `sixers.jpg`, `source-code.jpg` and `ski.jpg`; each card takes its
photo's own shape (`.flip-photo`, aspect ratios in chapters.css) and an inline
`object-position`, so the family card (wide) keeps all four faces and the ski card
keeps both skiers and the Matterhorn. The descriptions on the backs are his own
words, verbatim ("3.5 years younger me" is his). Re-measure that no back overflows if
the type or the column width changes: `.flip-back` scrolls if it must, and it should
never have to. When adding a photo, bake its rotation in first - the 76ers shot arrived
with an EXIF "rotate 90" flag - and downscale it (about 1200px on the long side).

**Chapter IV's photos are a spread beside the ledger** (`.now-photos` in chapters.css): the two
org logos on top as white label cards, the group shot full width under them, then two
portraits that overlap its lower edge inside a page-coloured ring, the second dropped so
the pair never lines up. Each ledger row carries a `data-k` (`tsf`, `iba`, `greek`, `ball`)
and so does each picture; hovering a row fades every picture that is not its own (with
`:has()`, and with opacity - brightness left the separator ring showing as a darker box).
Internships has no picture and dims nothing. The basketball frame is square, not tall,
because the players only fill the bottom of that photo. The group shot is uncaptioned on
purpose: which club it belongs to was not stated. The logos are palette PNGs (about 30 KB);
the HEIC was converted and its rotation baked in.

Every photo on the two city pages and in chapters II-III is still a placeholder, and so is every word in chapters III-V: the ledes
and all three entries in each. Chapter II is real copy, and Chapter V's photos and descriptions are real.

**The bridge into finance runs through debate, and it is load-bearing.** Chapter
II's reveal ends on "seizing every single opportunity my new school threw at
me"; Chapter III is what he seized, and it closes on "all these experiences
collectively led me to finance, which brings us to today", which hands straight
to Chapter IV. There was once a separate Pivot chapter between them; it was cut
because that bridge line does its job, and its best sentence - every argument
chased far enough is an argument about the economy - now sits inside the Debate
pillar, where it actually happened. The Work chapter was folded into The Present
for the same reason. Debate taught him argumentation and storytelling, and then that
every argument chased far enough is an argument about the economy. Do not let
III become a list of activities - it is evidence for the decision in II, which
is why it opens on "So I said yes".

The site closes on `#why`: why Recalc, in his own words, then the coda - the wheel
again, still, with one closing line: "The Yin and Yang could not have been more
different, yet somehow combine to make it work. My American and Chinese identities
never meshed well, but together have helped shaped me into the person I am today."
(verbatim - "helped shaped" is his). The short "why the yin and yang" note that used
to sit beside the Recalc text was cut at his request; do not bring it back.
The wheel page and the two city pages are real copy.
Chapter I is real everywhere: the wheel page, and both city pages carry the owner's own words.

Chapters II-V navigate nowhere - they are the whole of their own content. Only
Chapter I's two halves have click transitions (the dragon and the cheesesteak).

## Cache-busting: bump the ?v= stamps

GitHub Pages lets browsers cache CSS and JS for about ten minutes, so a deploy
can hand a visitor the new HTML with the *old* stylesheet. That actually
happened: the fix for the grey discs was live, but a cached `chapters.css`
without the fix kept drawing them. Every local asset is now referenced as
`chapters.css?v=<8 chars of its sha1>`, so changed files get a new URL and are
fetched fresh.

**After editing any .css or .js file, re-stamp the three pages**, or visitors can
see the new markup against old styles:

```
python -c "import io,re,hashlib as h;A=['chapters.css','place.css','chapters.js','dragon.js','transitions.js'];V={a:h.sha1(open(a,'rb').read()).hexdigest()[:8] for a in A};R=re.compile(r'((?:href|src)=\")('+'|'.join(map(re.escape,A))+r')(\?v=[0-9a-f]+)?(\")');W=lambda p,s:io.open(p,'w',encoding='utf-8').write(s);[W(p,R.sub(lambda m:m.group(1)+m.group(2)+'?v='+V[m.group(2)]+m.group(4),io.open(p,encoding='utf-8').read())) for p in ['index.html','us.html','china.html']]"
```

Run it from the repo root. It reads each page *before* opening it for writing -
the new text is built as an argument, and arguments are evaluated first. An
earlier version of this line opened the file for writing inside the same
expression that read it, which truncated every page to nothing before the read
happened. If you ever rewrite it, keep the read strictly before the write.

Closing a pillar panel also clips it to a zero radius as well as hiding it, so
even a stale stylesheet cannot leave anything painted over the circles.

## Working agreement

After every push, give BOTH links, unprompted, every time:

- the live page: https://yclong111.github.io (or the specific page that changed)
- the commit: https://github.com/yclong111/yclong111.github.io/commit/<sha>

Mention that GitHub Pages takes a minute or two to rebuild. The site is checked on
the deployed URL, never on a local preview.

The repo owner pushes to `main` from their own machine while work is in progress, so
always `git pull --rebase` before pushing and check `git log HEAD..origin/main` before
assuming the local copy is current.

## The two city pages (us.html, china.html)

Each tells its story in **two numbered passages** - the writing on the left edge (the
site's `--gutter`), a plain photo frame on the right - built from `.passage` in
place.css. Philadelphia: "Lower Merion" and "Only American", then a single large line,
"Little did I know, this would all soon change." (`.turn`). Shanghai: "Out of the
blue" and "Back to where it began", with a **fun fact** between them - a dictionary
card with 龙 set very large ("My surname literally means dragon"; `.fact`).

Philadelphia's sun (the disc behind the skyline) is **light blue** (`--accent:#a9dcf5`,
opacity .9), no longer paper. Shanghai's is still the China red.

Chinese characters need a real font: Archivo has none. Both pages load a Noto Serif SC
subset limited to 龙毅诚 (`&text=` in the Google Fonts URL, a few KB) and wrap the
characters in `.zh`. If the copy ever uses other characters, add them to that `text=`
parameter, or they fall back to the system's CJK font.

The chapter copy is the owner's own words; keep it verbatim, typos included, unless
asked. Photos are still placeholders.

## Chapter III panel photo spreads / Chapter V wall (latest)
- Each pillar panel uses `.panel-photos` (2-col grid) with `.pp` figures: `pp-wide`, `pp-end`, `pp-start`, `pp-lift`/`pp-drop` for the stagger, `pp-card` for white-backed logos. Fit was tuned at 1280x720; keep panels within one screen.
- `images/eyuan-paper.png` shows the owner's email address on the cover page.
- Chapter V `.flips`: cards 2-4 are 86% width; photo midlines aligned with percent `margin-top` on `.flip:nth-child(n)` (desktop only). Re-check `.flip-back` scrollHeight vs clientHeight if card widths change.
- Photos added: us.html two frames (us-statue, us-kindergarten), china.html second frame (china-graduation), and a single tall `.pp-tall` photo in the #p-learned panel (learned-grad.jpg).
- Photo spacing: overlapping/adjacent photos share `--ph-gap`, `--ph-overlap`, `--ph-drop`, `--ph-ring` (top of chapters.css); use them for any new photo spread.
