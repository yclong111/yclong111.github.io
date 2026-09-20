/* Behaviour for the chapter spine (chapters II-V, the rail and the connectors).
 * Chapter I - the quote page and the yin-yang zoom - is handled by the inline
 * script in index.html and is deliberately left alone here. */
(function () {
  // sections that reveal as a whole rather than element by element
  var sections = Array.prototype.slice.call(document.querySelectorAll('.quote-page, .intro'));
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveal blocks as they scroll into view ----
   * Anything waiting to be revealed sits at opacity 0, so if the observer
   * never reports the page is blank rather than merely unanimated. Some
   * engines throttle or defer IntersectionObserver callbacks - background
   * tabs, restored sessions, reduced-power modes - so a dead observer has to
   * degrade to something, not to nothing. */
  var rises = Array.prototype.slice.call(document.querySelectorAll('.rise'));
  var observerFired = false;

  function onScreen(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }
  // The hero's own elements are revealed by the inline script in index.html,
  // which has the same dependency on the observer, so the fallback covers them
  // too rather than leaving the wheel and its title blank.
  var fallbackEls = rises.concat(
    Array.prototype.slice.call(document.querySelectorAll('.pop-scroll')));

  function revealVisible() {
    fallbackEls.forEach(function (el) {
      if (!el.classList.contains('in') && onScreen(el)) el.classList.add('in');
    });
    sections.forEach(function (el) {
      if (!el.classList.contains('in') && onScreen(el)) el.classList.add('in');
    });
  }

  if ('IntersectionObserver' in window) {
    var riseObs = new IntersectionObserver(function (entries) {
      observerFired = true;
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); riseObs.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    rises.forEach(function (el) { riseObs.observe(el); });

    /* The quote page is the second screen: on load its animation would finish
     * while the reader is still on the opening page, and they would scroll
     * onto a quote that had already arrived. */
    var sectionObs = new IntersectionObserver(function (entries) {
      observerFired = true;
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); sectionObs.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    sections.forEach(function (el) { sectionObs.observe(el); });

    // If nothing has been reported shortly after load, assume the observer is
    // not going to run and drive the reveals from scroll instead.
    window.setTimeout(function () {
      if (observerFired) return;
      revealVisible();
      window.addEventListener('scroll', revealVisible, { passive: true });
      window.addEventListener('resize', revealVisible);
    }, 1500);
  } else {
    rises.forEach(function (el) { el.classList.add('in'); });
    sections.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- connectors: each length of dragon wipes in as it is reached ---- */
  var connectors = document.querySelectorAll('.connector');
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
