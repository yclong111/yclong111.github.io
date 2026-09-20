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

  /* ---- how it moves ----
   * The head swims; the body follows the path the head actually took. That is
   * the whole reason for the trail: if the body were simply drawn behind the
   * head in its current facing, turning round would swing the tail across the
   * screen like a rod, or flip it to the other side in a single frame. Sampled
   * from a trail, a U-turn curls the way an animal's does.
   *
   * The undulation is a lateral offset applied on top of that path, not a wiggle
   * in the path itself - otherwise the wavelength would be tied to speed, and a
   * slow dragon would ripple in slow motion. */
  function rand(a, b) { return a + Math.random() * (b - a); }

  var hx, hy, angle, targetAngle, speed, retargetAt;
  var trail = [];          // newest first, each with distance to the previous
  var TURN_RATE = 0.62;    // rad/s - a wide bank, not a pivot
  var upSign = 1;          // +1 while it swims right, -1 while it swims left

  // The spines belong on its back and the belly plates underneath, whichever
  // way it is pointing. The drawing faces +x, so coming back leftwards it has
  // to be mirrored - and the mirror is only flipped while the dragon is close
  // to vertical, where the switch cannot be seen.
  function updateUpSign() {
    var c = Math.cos(angle);
    if (Math.abs(c) < 0.3) upSign = c >= 0 ? 1 : -1;
  }

  // The wave is measured against the geometric normal, never the mirrored one:
  // flipping it would phase-shift the whole body by half a wavelength in a
  // single frame.
  function waveAt(s, t) {
    return amp() * (1 - 0.25 * Math.min(1, s / span())) *
           Math.sin((2 * Math.PI * s / lam()) + t * 1.7);
  }
  // A point on the animal itself: the path, plus the wave riding on it. The
  // head is taken from this too, so it cannot drift off the front of the body.
  function bodyPoint(s, t) {
    var p = atDistance(s);
    var o = waveAt(s, t);
    return { x: p.x + Math.sin(p.th) * o, y: p.y - Math.cos(p.th) * o, th: p.th };
  }

  function span() { return Math.min(W * 1.06, 1500); }
  function amp() { return Math.min(H * 0.055, 38); }   // shallow: it swims, it does not thrash
  function lam() { return Math.max(W * 0.5, 380); }
  function bodyR() { return Math.max(11, Math.min(30, H * 0.075, W * 0.028)); }

  // every shape is the page's own black, outlined in the page's own paper
  function stroked() {
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.strokeStyle = LINE;
    ctx.stroke();
  }

  function aimSomewhereInside() {
    var tx = rand(0.12, 0.88) * W;
    var ty = rand(0.16, 0.66) * H;
    targetAngle = Math.atan2(ty - hy, tx - hx);
  }

  function init() {
    hx = W * 0.78;
    hy = H * 0.3;
    angle = 0;               // heading right, across the opening screen
    targetAngle = angle;
    speed = rand(30, 52);
    retargetAt = rand(9, 16);
    // lay a straight trail behind it so the body exists on the first frame
    trail.length = 0;
    var step = 6;
    for (var d = 0; d <= span() + step; d += step) {
      trail.push({ x: hx - d, y: hy, d: d === 0 ? 0 : step });
    }
  }

  function halfOffScreen() {
    var m = span() * 0.5;
    return hx > W + m || hx < -m || hy > H + m || hy < -m;
  }

  function advance(t, dt) {
    if (t > retargetAt) { aimSomewhereInside(); retargetAt = t + rand(9, 16); }
    // Turn back once half of it has left the frame, rather than waiting for it
    // to vanish and reappear somewhere else.
    if (halfOffScreen()) { aimSomewhereInside(); retargetAt = t + rand(9, 16); }

    var diff = Math.atan2(Math.sin(targetAngle - angle), Math.cos(targetAngle - angle));
    var step = TURN_RATE * dt;
    angle += Math.abs(diff) < step ? diff : (diff > 0 ? step : -step);

    updateUpSign();
    hx += Math.cos(angle) * speed * dt;
    hy += Math.sin(angle) * speed * dt;

    var prev = trail[0];
    var d = prev ? Math.hypot(hx - prev.x, hy - prev.y) : 0;
    if (d > 0.5) {
      trail.unshift({ x: hx, y: hy, d: d });
      var total = 0, keep = span() + 40;
      for (var i = 0; i < trail.length; i++) {
        total += trail[i].d;
        if (total > keep) { trail.length = i + 1; break; }
      }
    }
  }

  // point on the trail at arc length s behind the head, with its tangent
  function atDistance(s) {
    var acc = 0;
    for (var i = 1; i < trail.length; i++) {
      var seg = trail[i].d;
      if (acc + seg >= s) {
        var f = seg > 0 ? (s - acc) / seg : 0;
        var a = trail[i - 1], b = trail[i];
        return {
          x: a.x + (b.x - a.x) * f,
          y: a.y + (b.y - a.y) * f,
          th: Math.atan2(a.y - b.y, a.x - b.x)
        };
      }
      acc += seg;
    }
    var last = trail[trail.length - 1] || { x: hx, y: hy };
    return { x: last.x, y: last.y, th: angle };
  }

  /* ---- the head ---- */
  function drawHead(x, y, th, h, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(th);
    if (upSign < 0) ctx.scale(1, -1);   // right way up on the way back
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
    advance(t, dt);

    var R = bodyR();
    var N = 64;
    var L = span();
    var dx = L / N;
    // (amp and wavelength are read inside waveAt)

    // tail to head, so each segment overlaps the one behind it
    for (var i = N; i >= 1; i--) {
      var s = i * dx;
      var p = bodyPoint(s, t);
      var th = p.th;
      var x = p.x, y = p.y;
      if (x < -R * 6 || x > W + R * 6 || y < -R * 6 || y > H + R * 6) continue;

      // "up" for spines and legs, mirrored when it is swimming leftwards
      var nx = Math.sin(th) * upSign, ny = -Math.cos(th) * upSign;
      var f = i / N;
      var r = R * (1 - 0.82 * Math.pow(f, 1.15));
      var tx = Math.cos(th), ty = Math.sin(th);

      if (i === 14 || i === 15 || i === 36 || i === 37) {
        drawLeg(x - nx * r * 0.65, y - ny * r * 0.65, nx, ny, tx, ty, R, t, i);
      }

      if (i % 2 === 0 && r > 2) {
        ctx.beginPath();
        ctx.moveTo(x + nx * r * 0.85 - tx * r * 0.5, y + ny * r * 0.85 - ty * r * 0.5);
        ctx.lineTo(x + nx * r * 1.75, y + ny * r * 1.75);
        ctx.lineTo(x + nx * r * 0.85 + tx * r * 0.5, y + ny * r * 0.85 + ty * r * 0.5);
        ctx.closePath();
        ctx.lineWidth = 1.2;
        stroked();
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(th);
      if (upSign < 0) ctx.scale(1, -1);   // keep the belly plates underneath
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.02, r, 0, 0, 7);
      ctx.lineWidth = 1.4;
      stroked();
      if (r > 5) {
        ctx.beginPath();
        ctx.arc(0, r * 0.28, r * 0.55, 0.35 * Math.PI, 0.65 * Math.PI);
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    // taken from the same curve as the body, one short step apart, so the head
    // sits on the neck and turns with it instead of riding the bare path
    var h0 = bodyPoint(0, t);
    var h1 = bodyPoint(Math.min(12, dx), t);
    drawHead(h0.x, h0.y, Math.atan2(h0.y - h1.y, h0.x - h1.x), R * 1.25, t);
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
  init();
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
    rt = setTimeout(function () {
      resize();
      // the trail is in screen coordinates, so a resize invalidates it
      init();
      // resizing clears the canvas; redraw straight away rather than waiting
      // for the next frame, which may never come if rAF is being throttled
      frame(0, 0);
    }, 120);
  });
})();
