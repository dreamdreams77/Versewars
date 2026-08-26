// Verse Wars: pixel-art train hero
//
// Renders a small retro bullet-train sprite on a <canvas>, built entirely
// from a handful of rectangles defined as data (car bounds + a stepped
// taper for the nose) rather than a hand-drawn bitmap or an SVG illustration.
// Motion (bob + drift) is handled by CSS on the wrapping elements, so the
// canvas itself is only ever drawn once per mount.

window.VW = window.VW || {};

(function () {
  const COLORS = {
    hull: '#8891a0',
    hullLight: '#b7bfcb',
    hullDark: '#565c66',
    panelLine: '#6f7682',
    outline: '#2f333b',
    window: '#ffe9c2',
    windowFrame: '#20242c',
    windowGlint: '#fffaf0',
    cockpit: '#fff4de',
    rail: '#262b31',
    tie: '#121417',
    stripeStart: '#e8b84b',
    stripeEnd: '#d1453d',
    glow: 'rgba(240,200,120,0.35)',
    wheel: '#14171b',
    wheelHub: '#454c57',
    headlight: '#fff6d8',
    tailLight: '#d1453d',
  };

  const BOTTOM = 14; // baseline row every car and the nose sit on
  const CARS = [
    { x: 2, w: 13, top: 6 },
    { x: 17, w: 15, top: 5 },
    { x: 34, w: 22, top: 3 },
  ];
  const NOSE_X = 56; // continues seamlessly from the last car's right edge
  const NOSE_TOPS = [3, 4, 6, 8, 10, 12, 13]; // one entry per nose column
  const WINDOW_GROUPS = [
    { xs: [5, 9], y: 8, w: 2, h: 2 },
    { xs: [19, 23, 27], y: 7, w: 2, h: 2 },
    { xs: [37, 41, 45, 49], y: 5, w: 2, h: 2 },
    { xs: [37, 41, 45, 49], y: 8, w: 2, h: 2 },
  ];
  const STRIPE_Y = 11;
  const STRIPE_H = 2;
  const GRID_W = 66;
  const GRID_H = 17;

  // Draws just the train shape (glow + cars + nose + stripe + windows +
  // cockpit) at the given pixel scale, from the current canvas origin.
  // Shared by the menu hero below and by the comic panels in codex.js, so
  // every appearance of the train in the app is the exact same sprite.
  function drawTrainShape(ctx, px, opts) {
    opts = opts || {};
    const gx = (u) => Math.round(u * px);
    const gw = (u) => Math.round(u * px) + 1;
    const rect = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(gx(x), gx(y), gw(w), gw(h));
    };

    if (opts.glow !== false) {
      const cx = gx(8);
      const cy = gx(BOTTOM - 4);
      const steps = [
        { r: 9, color: 'rgba(240,200,120,0.16)' },
        { r: 6, color: 'rgba(240,200,120,0.26)' },
        { r: 3, color: 'rgba(248,214,150,0.4)' },
      ];
      steps.forEach((s) => {
        const side = gx(s.r * 2);
        ctx.fillStyle = s.color;
        ctx.fillRect(cx - side / 2, cy - side / 2, side, side);
      });
    }

    // A small pair of wheel bogies under a car/nose span, drawn into the
    // undercarriage shadow band rather than below BOTTOM (that row is the
    // rail itself), so they read as wheels peeking out from under the skirt.
    function wheels(x, w) {
      const positions = w > 5 ? [x + w * 0.22, x + w * 0.78] : [x + w * 0.5];
      positions.forEach((wx) => {
        rect(wx - 0.7, BOTTOM - 1.6, 1.4, 1.5, COLORS.wheel);
        rect(wx - 0.25, BOTTOM - 1.2, 0.5, 0.5, COLORS.wheelHub);
      });
    }

    CARS.forEach((c) => {
      const h = BOTTOM - c.top;
      rect(c.x, c.top, c.w, h, COLORS.hull);
      rect(c.x, c.top, c.w, 1.3, COLORS.hullLight);
      rect(c.x, c.top + h * 0.56, c.w, 0.4, COLORS.panelLine);
      rect(c.x, BOTTOM - 2, c.w, 2, COLORS.hullDark);
      wheels(c.x, c.w);
      ctx.lineWidth = Math.max(2, Math.round(px * 0.3));
      ctx.strokeStyle = COLORS.outline;
      ctx.strokeRect(gx(c.x), gx(c.top), gw(c.w), gw(h));
    });

    // Coupler bars bridging the gaps between adjacent car bodies.
    for (let i = 0; i < CARS.length - 1; i++) {
      const a = CARS[i];
      const b = CARS[i + 1];
      const gapX = a.x + a.w;
      const gapW = b.x - gapX;
      if (gapW > 0) rect(gapX, BOTTOM - 1.6, gapW, 1.2, COLORS.outline);
    }

    // A small marker lamp on the rear-most car.
    rect(CARS[0].x + 0.5, CARS[0].top + 1.6, 1, 1, COLORS.tailLight);

    NOSE_TOPS.forEach((top, i) => {
      const x = NOSE_X + i;
      const h = BOTTOM - top;
      rect(x, top, 1, h, COLORS.hull);
      rect(x, top, 1, Math.min(0.9, h), COLORS.hullLight);
      const dh = Math.min(2, h);
      rect(x, BOTTOM - dh, 1, dh, COLORS.hullDark);
    });
    wheels(NOSE_X, NOSE_TOPS.length);

    // Headlight at the very tip of the nose, with a soft halo.
    const tipX = NOSE_X + NOSE_TOPS.length - 1;
    const tipTop = NOSE_TOPS[NOSE_TOPS.length - 1];
    ctx.fillStyle = 'rgba(255,246,216,0.3)';
    ctx.fillRect(gx(tipX - 0.6), gx(tipTop - 0.6), gw(2.2), gw(2.2));
    rect(tipX, tipTop, 1, 1, COLORS.headlight);

    if (opts.stripe !== false) {
      const stripeX = gx(CARS[0].x);
      const stripeW = gx(NOSE_X - CARS[0].x);
      const splitAt = Math.round(stripeW * 0.55);
      ctx.fillStyle = COLORS.stripeStart;
      ctx.fillRect(stripeX, gx(STRIPE_Y), splitAt, gw(STRIPE_H));
      ctx.fillStyle = COLORS.stripeEnd;
      ctx.fillRect(stripeX + splitAt, gx(STRIPE_Y), stripeW - splitAt + 1, gw(STRIPE_H));
    }

    if (opts.windows !== false) {
      WINDOW_GROUPS.forEach((g) => {
        g.xs.forEach((x) => {
          rect(x - 0.35, g.y - 0.35, g.w + 0.7, g.h + 0.7, COLORS.windowFrame);
          rect(x, g.y, g.w, g.h, COLORS.window);
          rect(x, g.y, g.w * 0.4, g.h * 0.4, COLORS.windowGlint);
        });
      });
      rect(NOSE_X + 1.6, 6.6, 2.4, 2.4, COLORS.windowFrame);
      rect(NOSE_X + 2, 7, 2, 2, COLORS.cockpit);
      rect(NOSE_X + 2, 7, 0.8, 0.8, COLORS.windowGlint);
    }
  }

  function drawTrain(canvas, opts) {
    opts = opts || {};
    const px = opts.scale || 8;
    canvas.width = GRID_W * px;
    canvas.height = GRID_H * px;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gx = (u) => Math.round(u * px);
    const gw = (u) => Math.round(u * px) + 1; // +1 avoids hairline seams between adjacent units

    drawTrainShape(ctx, px);

    // rail line + sleepers, running the full width
    ctx.fillStyle = COLORS.rail;
    ctx.fillRect(0, gx(BOTTOM), canvas.width, gw(1));
    ctx.fillStyle = COLORS.tie;
    for (let x = 0; x < GRID_W; x += 5) {
      ctx.fillRect(gx(x), gx(BOTTOM + 1), gw(2), gw(2));
    }
  }

  function mount(container, opts) {
    opts = opts || {};
    const compact = !!opts.compact;
    container.innerHTML = '';
    container.className = 'train-hero' + (compact ? ' train-hero--compact' : '');

    const frame = document.createElement('div');
    frame.className = 'train-hero__frame';

    const speedWrap = document.createElement('div');
    speedWrap.className = 'train-hero__speedlines';
    for (let i = 0; i < 3; i++) {
      const bar = document.createElement('div');
      bar.className = 'train-hero__speedline train-hero__speedline--' + i;
      speedWrap.appendChild(bar);
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'train-hero__canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'A pixel-art bullet train, three cars deep, running along the Hyperrail');

    frame.appendChild(speedWrap);
    frame.appendChild(canvas);
    container.appendChild(frame);
    drawTrain(canvas, { scale: compact ? 5 : 9 });

    if (!compact) {
      const caption = document.createElement('p');
      caption.className = 'train-hero__caption';
      caption.textContent = 'A modified runner, three cars deep, screaming down the Hyperrail.';
      container.appendChild(caption);
    }
  }

  window.VW.train = { drawTrain, mount, drawTrainShape, GRID_W, GRID_H, BOTTOM, COLORS };
})();
