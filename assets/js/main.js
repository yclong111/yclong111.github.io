document.getElementById('year').textContent = new Date().getFullYear();

// Smooth-scroll for in-page anchor links only (keeps direct URL loads instant)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Reveal on scroll (post-story sections only)
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// Active rail dot tracking — a section counts as "current" while it crosses
// a thin band through the vertical middle of the viewport. We track the full
// intersecting set (not just the latest true event) so a stale match can't
// get stuck active after a layout shift (e.g. web fonts swapping in).
const stageList = Array.from(document.querySelectorAll('[data-stage]:not(.rail-dot)'));
const dots = document.querySelectorAll('.rail-dot');
const intersecting = new Set();

function updateActiveDot() {
  let current = null;
  for (const el of stageList) {
    if (intersecting.has(el)) current = el; // last (lowest) matching wins
  }
  // If nothing is currently in the tracking band (e.g. deep inside a long
  // section like Leadership/Connect that has no [data-stage] of its own),
  // keep showing the last stage reached instead of blanking or reverting.
  if (!current) return;
  dots.forEach(d => d.classList.remove('active'));
  const dot = document.querySelector(`.rail-dot[data-stage="${current.getAttribute('data-stage')}"]`);
  if (dot) dot.classList.add('active');
}

const stageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) intersecting.add(entry.target);
    else intersecting.delete(entry.target);
  });
  updateActiveDot();
}, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
stageList.forEach(s => stageObserver.observe(s));

// Sticky-stack "cross-dissolve" transition: each panel is pinned full-screen,
// and as the NEXT one arrives it fades in over the current one (opacity 0→1)
// instead of hard-covering it, so for a stretch of scroll both are partially
// visible and genuinely blend/merge into each other rather than cutting.
const isMobileStack = () => window.matchMedia('(max-width: 700px)').matches;
const panels = Array.from(document.querySelectorAll('.stack .panel'));
let depthTicking = false;

function updateDepth() {
  if (!isMobileStack()) {
    const vh = window.innerHeight;
    panels.forEach((panel, i) => {
      if (i === 0) { panel.style.opacity = ''; panel.style.transform = ''; return; }
      const rect = panel.getBoundingClientRect();
      const progress = 1 - Math.min(Math.max(rect.top / vh, 0), 1); // 0 = not yet arrived, 1 = fully arrived
      panel.style.opacity = progress;
      panel.style.transform = `scale(${0.97 + progress * 0.03})`;
    });
  } else {
    panels.forEach(panel => { panel.style.opacity = ''; panel.style.transform = ''; });
  }
  depthTicking = false;
}

function requestDepthUpdate() {
  if (!depthTicking) {
    depthTicking = true;
    requestAnimationFrame(updateDepth);
  }
}

window.addEventListener('scroll', requestDepthUpdate, { passive: true });
window.addEventListener('resize', requestDepthUpdate);
requestDepthUpdate();
