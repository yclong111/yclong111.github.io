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

// Reveal on scroll
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
const stageList = Array.from(document.querySelectorAll('[data-stage]'));
const dots = document.querySelectorAll('.rail-dot');
const intersecting = new Set();

function updateActiveDot() {
  let current = null;
  for (const el of stageList) {
    if (intersecting.has(el)) current = el; // last (lowest) matching wins
  }
  dots.forEach(d => d.classList.remove('active'));
  if (current) {
    const dot = document.querySelector(`.rail-dot[data-stage="${current.getAttribute('data-stage')}"]`);
    if (dot) dot.classList.add('active');
  }
}

const stageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) intersecting.add(entry.target);
    else intersecting.delete(entry.target);
  });
  updateActiveDot();
}, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
stageList.forEach(s => stageObserver.observe(s));
