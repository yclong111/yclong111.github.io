/* Behaviour for the chapter spine (chapters II-V, the rail and the connectors).
 * Chapter I - the quote page and the yin-yang zoom - is handled by the inline
 * script in index.html and is deliberately left alone here. */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveal blocks as they scroll into view ---- */
  var rises = document.querySelectorAll('.rise');
  if ('IntersectionObserver' in window) {
    var riseObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); riseObs.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    rises.forEach(function (el) { riseObs.observe(el); });
  } else {
    rises.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- connectors: each S draws itself once, from its own real length ---- */
  var connectors = document.querySelectorAll('.connector');
  connectors.forEach(function (c) {
    var p = c.querySelector('path');
    if (!p) return;
    // stroke-dasharray/offset need the path's true length; hard-coding one
    // value would leave a gap or a head start on any other curve.
    var len = Math.ceil(p.getTotalLength());
    c.style.setProperty('--len', len);
  });
  if ('IntersectionObserver' in window) {
    var connObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); connObs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    connectors.forEach(function (c) { connObs.observe(c); });
  } else {
    connectors.forEach(function (c) { c.classList.add('in'); });
  }

  /* ---- chapter rail: mark whichever chapter owns the middle of the screen ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.rail a'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function markActive() {
    var mid = window.innerHeight / 2;
    var best = -1, bestDist = Infinity;
    targets.forEach(function (el, i) {
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var d = Math.abs((r.top + r.bottom) / 2 - mid);
      // a section taller than the viewport owns the screen outright
      if (r.top <= mid && r.bottom >= mid) d = 0;
      if (d < bestDist) { bestDist = d; best = i; }
    });
    links.forEach(function (a, i) { a.classList.toggle('active', i === best); });
  }

  var railTicking = false;
  function onScroll() {
    if (railTicking) return;
    railTicking = true;
    requestAnimationFrame(function () { markActive(); railTicking = false; });
  }
  markActive();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
