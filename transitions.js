/* Page transitions for the yin-yang homepage.
 *   china -> a Chinese dragon flies across the screen and drags a red wipe behind it
 *   us    -> a Philly cheesesteak rolls across, melted cheese dripping off the leading edge
 * Both end on the destination page's own background colour, so the navigation is seamless.
 * Everything is drawn on one full-screen canvas; nothing to download. */
(function () {
  var COLORS = { china: '#cc2229', us: '#f4f2f1' };
  var DURATION = { china: 3240, us: 2520 }; // 20% slower than the first version (2700 / 2100)
  var wipe = { china: COLORS.china, us: COLORS.us };
  var running = false;
  var overlay = null;

  function easeInOut(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function seeded(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  /* ---------------------------------------------------------------- dragon */

  // Wavelength/amplitude scale with the screen; on narrow screens keep the wave gentle instead of steep.
  function wave(W, H) { var lam = Math.max(W * 0.62, 420); return { lam: lam, amp: Math.min(H * 0.16, lam * 0.16) }; }
  function waveY(x, W, H) { var w = wave(W, H); return H * 0.5 + w.amp * Math.sin(2 * Math.PI * x / w.lam); }
  function waveSlope(x, W, H) { var w = wave(W, H); return w.amp * (2 * Math.PI / w.lam) * Math.cos(2 * Math.PI * x / w.lam); }
  function bodyRadius(W, H) { return Math.max(22, Math.min(54, H * 0.06, W * 0.06)); }

  function outlineFill(ctx, fill, stroke, lw) {
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
  }

  function drawDragonHead(ctx, x, y, theta, h, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(theta);
    var dark = '#7a0c14', gold = '#f7c948';

    // mane: flame-like spikes trailing off the back of the head
    for (var k = 0; k < 5; k++) {
      var bx = -0.15 * h - k * 0.36 * h, by = -0.62 * h + k * 0.04 * h;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx - 0.25 * h, by - 0.55 * h, bx - 0.65 * h, by - 0.95 * h - 0.05 * h * Math.sin(t * 9 + k));
      ctx.quadraticCurveTo(bx - 0.45 * h, by - 0.3 * h, bx - 0.4 * h, by + 0.05 * h);
      ctx.closePath();
      outlineFill(ctx, '#d1232b', dark, 2);
    }

    // horns
    ctx.lineCap = 'round';
    [[dark, h * 0.2], ['#f6e7b3', h * 0.11]].forEach(function (st) {
      ctx.strokeStyle = st[0]; ctx.lineWidth = st[1];
      ctx.beginPath(); ctx.moveTo(-0.05 * h, -0.6 * h); ctx.quadraticCurveTo(-0.55 * h, -1.4 * h, -1.4 * h, -1.25 * h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-0.72 * h, -1.16 * h); ctx.quadraticCurveTo(-0.95 * h, -1.75 * h, -1.5 * h, -1.85 * h); ctx.stroke();
    });

    // whiskers
    ctx.lineWidth = h * 0.07; ctx.strokeStyle = gold;
    [-1, 1].forEach(function (s) {
      var w1 = 0.25 * h * Math.sin(t * 7 + s), w2 = 0.32 * h * Math.sin(t * 6 + 1 + s);
      ctx.beginPath();
      ctx.moveTo(1.1 * h, 0.02 * h);
      ctx.bezierCurveTo(0.6 * h, s * 0.9 * h + w1, -0.4 * h, s * 0.3 * h - w1, -1.7 * h, s * 1.05 * h + w2);
      ctx.stroke();
    });

    // mouth interior + lower jaw (animated open/close)
    var open = 0.16 + 0.1 * Math.sin(t * 9);
    ctx.beginPath();
    ctx.moveTo(0.05 * h, 0.12 * h); ctx.lineTo(0.95 * h, 0.05 * h); ctx.lineTo(1.0 * h, 0.45 * h); ctx.lineTo(0.05 * h, 0.5 * h); ctx.closePath();
    ctx.fillStyle = '#4a060c'; ctx.fill();
    ctx.save();
    ctx.translate(0.05 * h, 0.12 * h); ctx.rotate(open);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(1.0 * h, 0); ctx.quadraticCurveTo(1.18 * h, 0.3 * h, 0.85 * h, 0.36 * h); ctx.lineTo(-0.1 * h, 0.52 * h); ctx.closePath();
    outlineFill(ctx, '#e8b230', dark, 3);
    ctx.restore();

    // upper head / snout
    var g = ctx.createLinearGradient(0, -0.9 * h, 0, 0.2 * h);
    g.addColorStop(0, '#ffe07a'); g.addColorStop(1, '#e2a41f');
    ctx.beginPath();
    ctx.moveTo(-0.7 * h, -0.45 * h);
    ctx.bezierCurveTo(-0.2 * h, -0.95 * h, 0.6 * h, -0.88 * h, 1.0 * h, -0.55 * h);
    ctx.bezierCurveTo(1.35 * h, -0.5 * h, 1.58 * h, -0.36 * h, 1.46 * h, -0.1 * h);
    ctx.lineTo(0.95 * h, 0.05 * h); ctx.lineTo(0.1 * h, 0.12 * h); ctx.lineTo(-0.7 * h, 0.28 * h); ctx.closePath();
    outlineFill(ctx, g, dark, 3);

    // teeth
    ctx.fillStyle = '#fff';
    for (var i = 0; i < 4; i++) {
      var tx = 0.3 * h + i * 0.2 * h;
      ctx.beginPath(); ctx.moveTo(tx, 0.09 * h - i * 0.012 * h); ctx.lineTo(tx + 0.07 * h, 0.09 * h - i * 0.012 * h); ctx.lineTo(tx + 0.035 * h, 0.24 * h); ctx.closePath(); ctx.fill();
    }

    // eye, brow, nostril
    ctx.beginPath(); ctx.ellipse(0.3 * h, -0.28 * h, 0.17 * h, 0.12 * h, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath(); ctx.arc(0.34 * h, -0.28 * h, 0.075 * h, 0, 7); ctx.fillStyle = '#111'; ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = h * 0.1;
    ctx.beginPath(); ctx.moveTo(0.05 * h, -0.5 * h); ctx.lineTo(0.55 * h, -0.36 * h); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(1.27 * h, -0.3 * h, 0.05 * h, 0.035 * h, 0, 0, 7); ctx.fillStyle = dark; ctx.fill();

    ctx.restore();
  }

  function drawDragon(ctx, W, H, headX, t) {
    var R0 = bodyRadius(W, H);
    var N = 58, bodyLen = Math.min(W * 0.82, 1250), dx = bodyLen / N;
    var dark = '#7a0c14';

    for (var i = N; i >= 1; i--) {
      var x = headX - i * dx;
      if (x < -R0 * 4 || x > W + R0 * 4) continue;
      var y = waveY(x, W, H), th = Math.atan(waveSlope(x, W, H));
      var r = R0 * (1 - 0.8 * Math.pow(i / N, 1.1));
      var tx = Math.cos(th), ty = Math.sin(th), nx = Math.sin(th), ny = -Math.cos(th); // n = "up"

      // legs (two pairs)
      if (i === 13 || i === 14 || i === 33 || i === 34) {
        var bx = x - nx * r * 0.7, by = y - ny * r * 0.7;
        var fx = bx - nx * r * 1.5 - tx * r * 0.7, fy = by - ny * r * 1.5 - ty * r * 0.7;
        ctx.lineCap = 'round';
        ctx.strokeStyle = dark; ctx.lineWidth = r * 0.62; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.strokeStyle = '#f0b93a'; ctx.lineWidth = r * 0.4; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.strokeStyle = dark; ctx.lineWidth = 2;
        for (var c = -1; c <= 1; c++) {
          ctx.beginPath(); ctx.moveTo(fx, fy);
          ctx.lineTo(fx - nx * r * 0.5 + tx * c * r * 0.4 - tx * r * 0.2, fy - ny * r * 0.5 + ty * c * r * 0.4 - ty * r * 0.2); ctx.stroke();
        }
      }

      // body segment
      var g = ctx.createRadialGradient(x + nx * r * 0.25, y + ny * r * 0.25, r * 0.1, x, y, r);
      g.addColorStop(0, '#ffe58a'); g.addColorStop(1, '#e0a020');
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
      outlineFill(ctx, g, dark, 2.5);
      ctx.beginPath(); ctx.arc(x - tx * r * 0.1, y - ty * r * 0.1, r * 0.55, Math.PI * 0.75 + th, Math.PI * 1.25 + th);
      ctx.strokeStyle = 'rgba(122,12,20,.45)'; ctx.lineWidth = 2; ctx.stroke();

      // dorsal spike
      if (i % 2 === 0 && i > 2) {
        ctx.beginPath();
        ctx.moveTo(x + nx * r * 0.8 - tx * r * 0.35, y + ny * r * 0.8 - ty * r * 0.35);
        ctx.lineTo(x + nx * r * 1.8 - tx * r * 0.65, y + ny * r * 1.8 - ty * r * 0.65);
        ctx.lineTo(x + nx * r * 0.8 + tx * r * 0.35, y + ny * r * 0.8 + ty * r * 0.35);
        ctx.closePath();
        outlineFill(ctx, '#d1232b', dark, 2);
      }
    }

    var headY = waveY(headX, W, H), headTh = Math.atan(waveSlope(headX, W, H));
    drawDragonHead(ctx, headX, headY, headTh, R0 * 1.5, t);
    return bodyLen;
  }

  function renderChina(ctx, W, H, p, t) {
    var R0 = bodyRadius(W, H);
    var bodyLen = Math.min(W * 0.82, 1250);
    var startX = -R0 * 4, endX = W + bodyLen + R0 * 3;
    var headX = startX + (endX - startX) * easeInOut(p);

    // red wipe trailing the middle of the body, with a smoky wavy edge
    var base = headX - bodyLen * 0.38;
    ctx.fillStyle = wipe.china;
    ctx.beginPath(); ctx.moveTo(0, -10);
    for (var y = -10; y <= H + 10; y += 6) {
      var x = base + 34 * Math.sin(y / 70 + t * 3) + 18 * Math.sin(y / 29 - t * 5);
      ctx.lineTo(Math.min(x, W + 80), y);
    }
    ctx.lineTo(0, H + 10); ctx.closePath(); ctx.fill();
    if (base > W + 100) ctx.fillRect(0, 0, W, H);

    drawDragon(ctx, W, H, headX, t);
  }

  /* ----------------------------------------------------------- cheesesteak */

  function drawCheesesteak(ctx, cx, cy, w, rot, t) {
    var rnd = seeded(7);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    var outline = '#7a4a1c';

    // steam
    for (var s = 0; s < 3; s++) {
      var sp = ((t * 0.9 + s / 3) % 1);
      ctx.beginPath(); ctx.arc((s - 1) * w * 0.18 + Math.sin(t * 3 + s) * 8, -w * 0.5 - sp * w * 0.22, w * (0.03 + sp * 0.035), 0, 7);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.55 * (1 - sp)) + ')'; ctx.fill();
    }

    // bottom bun
    var gb = ctx.createLinearGradient(0, 0.02 * w, 0, 0.18 * w);
    gb.addColorStop(0, '#e6b064'); gb.addColorStop(1, '#c5852f');
    ctx.beginPath();
    ctx.moveTo(-0.5 * w, 0.02 * w); ctx.lineTo(0.5 * w, 0.02 * w);
    ctx.quadraticCurveTo(0.52 * w, 0.17 * w, 0.4 * w, 0.18 * w); ctx.lineTo(-0.4 * w, 0.18 * w);
    ctx.quadraticCurveTo(-0.52 * w, 0.17 * w, -0.5 * w, 0.02 * w); ctx.closePath();
    outlineFill(ctx, gb, outline, 3);

    // steak, onions, peppers
    var steak = ['#6b3a1f', '#84492a', '#5a2f18', '#9a5a35'];
    for (var i = 0; i < 110; i++) {
      var ex = (rnd() - 0.5) * 0.95 * w, ey = -0.15 * w + rnd() * 0.17 * w;
      var kind = rnd();
      ctx.beginPath();
      if (kind < 0.72) { ctx.ellipse(ex, ey, w * (0.05 + rnd() * 0.05), w * (0.016 + rnd() * 0.014), (rnd() - 0.5) * 0.7, 0, 7); ctx.fillStyle = steak[i % 4]; ctx.fill(); ctx.strokeStyle = 'rgba(50,25,10,.5)'; ctx.lineWidth = 1; ctx.stroke(); ctx.beginPath(); ctx.ellipse(ex - w * 0.01, ey - w * 0.004, w * 0.02, w * 0.005, 0, 0, 7); ctx.fillStyle = 'rgba(255,190,140,.35)'; }
      else if (kind < 0.9) { ctx.ellipse(ex, ey, w * 0.028, w * 0.011, (rnd() - 0.5), 0, 7); ctx.fillStyle = '#f0d28a'; }
      else { ctx.ellipse(ex, ey, w * 0.026, w * 0.012, (rnd() - 0.5), 0, 7); ctx.fillStyle = '#5aa02c'; }
      ctx.fill();
    }

    // melted cheese draped over the steak, dripping down the front
    var gc = ctx.createLinearGradient(0, -0.1 * w, 0, 0.16 * w);
    gc.addColorStop(0, '#ffd84d'); gc.addColorStop(1, '#ffb400');
    ctx.beginPath();
    ctx.moveTo(-0.34 * w, -0.09 * w);
    ctx.bezierCurveTo(-0.2 * w, -0.16 * w, 0.0, -0.08 * w, 0.16 * w, -0.14 * w);
    ctx.bezierCurveTo(0.26 * w, -0.16 * w, 0.32 * w, -0.11 * w, 0.36 * w, -0.07 * w);
    [[0.33, 0.04], [0.26, 0.12], [0.18, 0.03], [0.09, 0.15], [0.0, 0.04], [-0.08, 0.1], [-0.17, 0.02], [-0.25, 0.13], [-0.32, 0.03]].forEach(function (d) {
      ctx.quadraticCurveTo((d[0] + 0.03) * w, (d[1] + 0.05) * w, d[0] * w, d[1] * w);
    });
    ctx.closePath();
    outlineFill(ctx, gc, '#d98e00', 2.5);
    ctx.beginPath(); ctx.moveTo(-0.24 * w, -0.11 * w); ctx.quadraticCurveTo(0, -0.13 * w, 0.24 * w, -0.12 * w);
    ctx.strokeStyle = 'rgba(255,240,150,.85)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();

    // top bun (slightly lifted)
    var gt = ctx.createLinearGradient(0, -0.44 * w, 0, -0.18 * w);
    gt.addColorStop(0, '#c98a3c'); gt.addColorStop(1, '#efc27c');
    ctx.beginPath();
    ctx.moveTo(-0.5 * w, -0.2 * w);
    ctx.bezierCurveTo(-0.5 * w, -0.42 * w, -0.2 * w, -0.44 * w, 0, -0.44 * w);
    ctx.bezierCurveTo(0.2 * w, -0.44 * w, 0.5 * w, -0.42 * w, 0.5 * w, -0.2 * w);
    ctx.quadraticCurveTo(0, -0.24 * w, -0.5 * w, -0.2 * w); ctx.closePath();
    outlineFill(ctx, gt, outline, 3);
    ctx.beginPath(); ctx.moveTo(-0.3 * w, -0.32 * w); ctx.quadraticCurveTo(0, -0.38 * w, 0.3 * w, -0.32 * w);
    ctx.strokeStyle = 'rgba(122,74,28,.35)'; ctx.lineWidth = 3; ctx.stroke();

    ctx.restore();
  }

  function renderUS(ctx, W, H, p, t) {
    var w = Math.max(240, Math.min(560, W * 0.42));
    var front = -w * 0.6 + (W + w * 1.3 + 90) * easeInOut(p);

    function drips(y) {
      return 46 * Math.pow(Math.max(0, Math.sin(y / 53 + 1.1)), 2.5) + 26 * Math.pow(Math.max(0, Math.sin(y / 29 + 2.2)), 3);
    }
    var pts = [], y;
    ctx.beginPath(); ctx.moveTo(0, -10);
    for (y = -10; y <= H + 10; y += 4) { var xe = front + 26 + drips(y); pts.push([Math.min(xe, W + 120), y]); ctx.lineTo(Math.min(xe, W + 120), y); }
    ctx.lineTo(0, H + 10); ctx.closePath();
    ctx.fillStyle = '#ffc933'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    pts.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
    ctx.strokeStyle = '#e0a000'; ctx.lineWidth = 3; ctx.stroke();

    ctx.fillStyle = wipe.us;
    ctx.beginPath(); ctx.moveTo(0, -10);
    for (y = -10; y <= H + 10; y += 6) ctx.lineTo(Math.min(front - 8 + 10 * Math.sin(y / 40 + t * 4), W + 120), y);
    ctx.lineTo(0, H + 10); ctx.closePath(); ctx.fill();

    // toppings falling out behind the sandwich
    var rnd = seeded(21), cols = ['#84492a', '#f0d28a', '#5aa02c', '#6b3a1f'];
    for (var k = 0; k < 14; k++) {
      var bx = front - w * (0.2 + rnd() * 0.9), by0 = H * 0.5 + (rnd() - 0.3) * w * 0.15, fall = (t * (60 + rnd() * 90)) % (H * 0.45);
      ctx.beginPath(); ctx.ellipse(bx, by0 + fall, 7 + rnd() * 7, 4 + rnd() * 3, rnd() * 3, 0, 7);
      ctx.fillStyle = cols[k % 4]; ctx.fill();
    }

    drawCheesesteak(ctx, front - w * 0.08, H * 0.5 + Math.sin(t * 6) * 8, w, -0.09 + Math.sin(t * 5) * 0.04, t);
  }

  /* ---------------------------------------------------------------- driver */

  // opts.reverse: mirror the scene so it travels right -> left (the dragon then faces left).
  // opts.wipe: colour left behind, so leaving a page can wipe to the *next* page's colour.
  function render(ctx, kind, W, H, p, t, opts) {
    opts = opts || {};
    wipe.china = opts.wipe || COLORS.china;
    wipe.us = opts.wipe || COLORS.us;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (opts.reverse) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    (kind === 'china' ? renderChina : renderUS)(ctx, W, H, p, t);
    ctx.restore();
  }

  function removeOverlay() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null; running = false;
    document.documentElement.style.overflow = '';
  }

  function play(kind, url, opts) {
    if (running) return;
    running = true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.location.href = url; return; }

    var W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cv = document.createElement('canvas');
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99999;pointer-events:all;cursor:wait';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    document.documentElement.style.overflow = 'hidden';
    overlay = cv;
    var ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    var dur = DURATION[kind], t0 = null, done = false;
    function go() { if (!done) { done = true; window.location.href = url; } }
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      render(ctx, kind, W, H, p, (ts - t0) / 1000, opts);
      if (p < 1) requestAnimationFrame(frame); else go();
    }
    requestAnimationFrame(frame);
    setTimeout(go, dur + 1200); // safety net if animation frames are throttled (background tab)
  }

  // coming back with the browser's Back button can restore this page from cache with the overlay still on it
  window.addEventListener('pageshow', function (e) { if (e.persisted || overlay) removeOverlay(); });

  window.PageTransitions = { play: play, render: render, colors: COLORS };
})();
