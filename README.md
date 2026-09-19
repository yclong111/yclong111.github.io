# yicheng long — the story of my life

A scroll-driven homepage: it opens on a black page with a quote whose words
pop onto the screen one by one, then a glowing 3D yin-yang. Hover each half
for a caption ("Stage 1: the US" / "Stage 2: china"); scroll down and the page
zooms into the dark half until it fills the screen and hands off into the next
section of the story. Elements pop in as they scroll into view.

Plain HTML/CSS/JS, no build step, no dependencies. Deployed via GitHub Pages
from the `main` branch at https://yclong111.github.io.

## Local preview

```
python3 -m http.server 8765
```

then open http://localhost:8765.

## Structure

```
index.html       homepage: quote, yin-yang, scroll-zoom script
us.html, china.html   the two stage pages
scrapbook.css/.svg    shared collage styling and stickers
```
