# yicheng long — the story of my life

A single scroll-driven homepage: a glowing 3D yin-yang over a corridor of
photos streaming toward the viewer. Hover each half for a caption ("Stage 1:
the US" / "Stage 2: china"); scroll down and the page zooms into the dark
half until it fills the screen and hands off seamlessly into the next
section of the story.

Plain HTML/CSS/JS, no build step, no dependencies. Deployed via GitHub Pages
from the `main` branch at https://yclong111.github.io.

## Add your own photos

Drop 9–12 images into `images/` named `photo1.jpg` through `photo12.jpg`
(fewer is fine — the sequence repeats). Until real files are added, broken
images fall back automatically to placeholder photos. You can also edit the
`IMAGES` array near the top of the `<script>` block in `index.html`.

## Local preview

```
python3 -m http.server 8765
```

then open http://localhost:8765.

## Structure

```
index.html    everything — markup, styles, and the corridor/zoom script
images/       your photos (photo1.jpg ... photo12.jpg)
```
