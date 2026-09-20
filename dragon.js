/* The dragon on the opening screen: drawn in code, and never still.
 *
 * Two travelling sine waves of different wavelengths are summed for the
 * spine, so the body ripples rather than pulsing in lockstep the way a
 * single wave does. Everything else - segments, spines, legs, whiskers,
 * mane, jaw - hangs off that one curve, so the whole animal moves together.
 *
 * Monochrome on purpose: the page's own black, outlined in the page's own
 * paper, like every other drawing on the site. */
(function () {
  var canvas = document.getElementById('dragonCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var INK = '#0c0c0e';
  var LINE = '#f5f5f4';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- one slow pass across the screen ----
   * The dragon crosses, leaves, and stays away for a while before coming back
   * at a new height and speed. Left swimming permanently it would be wallpaper
   * behind every paragraph on the site; arriving now and then, it reads as the
   * same animal passing through. */
  function rand(a, b) { return a + Math.random() * (b - a); }
  var pass = null, restUntil = 0;

  function bodyLen() { return Math.min(W * 1.06, 1500); }
  function newPass(firstOne) {
    return {
      // the first pass is already on screen: the character is the opening
      // statement and the dragon should be there with it, not en route
      headX: firstOne ? W * 0.78 : -bodyLen() * rand(0.05, 0.3),
      baseY: firstOne ? H * 0.3 : rand(0.15, 0.62) * H,
      speed: rand(13, 26),          // px per second
      phase: rand(0, Math.PI * 2),
      drift: rand(-1, 1)
    };
  }

  /* ---- the spine ---- */
  function amp() { return Math.min(H * 0.13, 88); }
  function lam() { return Math.max(W * 0.58, 430); }
  function spineY(x, t) {
    var a = amp(), l = lam();
    return pass.baseY
      + pass.drift * H * 0.04 * Math.sin(t * 0.16 + pass.phase)
      + a * Math.sin((2 * Math.PI * x / l) + t * 0.85)
      + a * 0.3 * Math.sin((2 * Math.PI * x / (l * 0.43)) - t * 1.25);
  }
  function angleAt(x, t) {
    var d = 2;
    return Math.atan2(spineY(x + d, t) - spineY(x - d, t), d * 2);
  }
  function bodyR() { return Math.max(11, Math.min(30, H * 0.075, W * 0.028)); }

  function stroked(fill) {
    ctx.fillStyle = fill === false ? 'transparent' : INK;
    if (fill !== false) ctx.fill();
    ctx.strokeStyle = LINE;
    ctx.stroke();
  }

  /* ---- the head ---- */
  function drawHead(x, y, th, h, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(th);
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // mane: spikes trailing off the back of the skull
    for (var k = 0; k < 5; k++) {
      var bx = -0.2 * h - k * 0.34 * h;
      var by = -0.5 * h + k * 0.05 * h;
      var flick = 0.09 * h * Math.sin(t * 2.2 + k * 0.7);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx - 0.22 * h, by - 0.5 * h, bx - 0.6 * h, by - 0.95 * h + flick);
      ctx.quadraticCurveTo(bx - 0.42 * h, by - 0.26 * h, bx - 0.36 * h, by + 0.06 * h);
      ctx.closePath();
      stroked();
    }

    // horns, branched
    ctx.beginPath();
    ctx.moveTo(-0.06 * h, -0.55 * h);
    ctx.quadraticCurveTo(-0.5 * h, -1.3 * h, -1.32 * h, -1.2 * h);
    ctx.moveTo(-0.68 * h, -1.1 * h);
    ctx.quadraticCurveTo(-0.9 * h, -1.66 * h, -1.44 * h, -1.76 * h);
    ctx.moveTo(0.16 * h, -0.58 * h);
    ctx.quadraticCurveTo(0.1 * h, -1.2 * h, -0.42 * h, -1.5 * h);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = Math.max(1.4, h * 0.09);
    ctx.stroke();
    ctx.lineWidth = 1.5;

    // whiskers, trailing and swaying
    for (var s = -1; s <= 1; s += 2) {
      var w1 = 0.28 * h * Math.sin(t * 1.7 + s);
      var w2 = 0.34 * h * Math.sin(t * 1.4 + 1 + s);
      ctx.beginPath();
      ctx.moveTo(1.05 * h, 0.02 * h);
      ctx.bezierCurveTo(0.55 * h, s * 0.85 * h + w1, -0.45 * h, s * 0.3 * h - w1, -1.75 * h, s * 1.0 * h + w2);
      ctx.strokeStyle = LINE;
      ctx.stroke();
    }

    // lower jaw, hinged and slowly working
    var open = 0.12 + 0.08 * (0.5 + 0.5 * Math.sin(t * 1.6));
    ctx.save();
    ctx.rotate(open);
    ctx.beginPath();
    ctx.moveTo(0.04 * h, 0.1 * h);
    ctx.lineTo(0.98 * h, 0.06 * h);
    ctx.quadraticCurveTo(1.16 * h, 0.3 * h, 0.84 * h, 0.36 * h);
    ctx.lineTo(-0.08 * h, 0.5 * h);
    ctx.closePath();
    stroked();
    ctx.restore();

    // skull and snout
    ctx.beginPath();
    ctx.moveTo(-0.72 * h, -0.42 * h);
    ctx.bezierCurveTo(-0.2 * h, -0.95 * h, 0.6 * h, -0.88 * h, 1.0 * h, -0.55 * h);
    ctx.bezierCurveTo(1.36 * h, -0.5 * h, 1.58 * h, -0.34 * h, 1.45 * h, -0.1 * h);
    ctx.lineTo(0.95 * h, 0.05 * h);
    ctx.lineTo(0.1 * h, 0.12 * h);
    ctx.lineTo(-0.72 * h, 0.28 * h);
    ctx.closePath();
    stroked();

    // teeth
    for (var i = 0; i < 4; i++) {
      var tx = 0.3 * h + i * 0.19 * h;
      ctx.beginPath();
      ctx.moveTo(tx, 0.08 * h);
      ctx.lineTo(tx + 0.07 * h, 0.08 * h);
      ctx.lineTo(tx + 0.035 * h, 0.23 * h);
      ctx.closePath();
      ctx.fillStyle = LINE;
      ctx.fill();
    }

    // brow, eye, nostril
    ctx.beginPath();
    ctx.ellipse(0.3 * h, -0.3 * h, 0.17 * h, 0.12 * h, 0, 0, 7);
    ctx.fillStyle = LINE; ctx.fill();
    ctx.beginPath();
    ctx.arc(0.34 * h + 0.02 * h * Math.sin(t * 0.9), -0.3 * h, 0.07 * h, 0, 7);
    ctx.fillStyle = INK; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.04 * h, -0.52 * h);
    ctx.lineTo(0.56 * h, -0.37 * h);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = Math.max(1.2, h * 0.055);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(1.26 * h, -0.3 * h, 0.05 * h, 0.035 * h, 0, 0, 7);
    ctx.fillStyle = LINE; ctx.fill();

    ctx.restore();
  }

  /* ---- a leg, two joints and three claws ---- */
  function drawLeg(x, y, nx, ny, tx, ty, r, t, phase) {
    var swing = 0.35 * r * Math.sin(t * 1.5 + phase);
    var kx = x - nx * r * 1.5 - tx * (r * 0.5 - swing);
    var ky = y - ny * r * 1.5 - ty * (r * 0.5 - swing);
    var fx = kx - nx * r * 1.25 + tx * (r * 0.75 + swing);
    var fy = ky - ny * r * 1.25 + ty * (r * 0.75 + swing);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = Math.max(1.4, r * 0.2);
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.lineWidth = 1.3;
    for (var c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + tx * r * 0.5 + nx * c * r * 0.3, fy + ty * r * 0.5 + ny * c * r * 0.3);
      ctx.stroke();
    }
  }

  /* ---- one frame ---- */
  function frame(t, dt) {
    ctx.clearRect(0, 0, W, H);

    if (!pass) {
      if (t < restUntil) return;
      pass = newPass(false);
    }
    pass.headX += pass.speed * dt;

    var R = bodyR();
    var N = 64;
    var span = bodyLen();
    var headX = pass.headX;
    var dx = span / N;

    // fully off the right edge: rest, then come back somewhere else
    if (headX - span > W) {
      pass = null;
      restUntil = t + rand(7, 18);
      return;
    }

    // tail to head, so each segment overlaps the one behind it
    for (var i = N; i >= 1; i--) {
      var x = headX - i * dx;
      if (x < -R * 5 || x > W + R * 5) continue;
      var y = spineY(x, t);
      var th = angleAt(x, t);
      var f = i / N;
      var r = R * (1 - 0.82 * Math.pow(f, 1.15));
      var nx = Math.sin(th), ny = -Math.cos(th);
      var tx = Math.cos(th), ty = Math.sin(th);

      if (i === 14 || i === 15 || i === 36 || i === 37) {
        drawLeg(x - nx * r * 0.65, y - ny * r * 0.65, nx, ny, tx, ty, R, t, i);
      }

      // dorsal spine
      if (i % 2 === 0 && r > 2) {
        ctx.beginPath();
        ctx.moveTo(x + nx * r * 0.85 - tx * r * 0.5, y + ny * r * 0.85 - ty * r * 0.5);
        ctx.lineTo(x + nx * r * 1.75, y + ny * r * 1.75);
        ctx.lineTo(x + nx * r * 0.85 + tx * r * 0.5, y + ny * r * 0.85 + ty * r * 0.5);
        ctx.closePath();
        ctx.lineWidth = 1.2;
        stroked();
      }

      // the segment itself
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(th);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.02, r, 0, 0, 7);
      ctx.lineWidth = 1.4;
      stroked();
      // a belly scale, to read as plated rather than smooth
      if (r > 5) {
        ctx.beginPath();
        ctx.arc(0, r * 0.28, r * 0.55, 0.35 * Math.PI, 0.65 * Math.PI);
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    drawHead(headX, spineY(headX, t), angleAt(headX, t), R * 1.25, t);
  }

  /* ---- the loop ---- */
  var running = false, raf = 0, t0 = null, last = 0;
  function tick(now) {
    if (t0 === null) { t0 = now; last = 0; }
    var t = (now - t0) / 1000;
    // clamp: a backgrounded tab resumes with a huge gap, which would teleport
    // the dragon halfway across the screen in one frame
    var dt = Math.min(0.05, Math.max(0, t - last));
    last = t;
    frame(t, dt);
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (running) return;
    running = true;
    if (reduced) { frame(0, 0); return; }
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();
  pass = newPass(true);
  frame(0, 0);

  // The canvas covers the viewport now, so there is no "off screen" to observe
  // against; tab visibility is the only thing worth pausing for.
  start();
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); if (!running || reduced) frame(0, 0); }, 120);
  });
})();
