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
    hullDark: '#565c66',
    outline: '#2f333b',
    window: '#ffe9c2',
    cockpit: '#fff4de',
    rail: '#262b31',
    tie: '#121417',
    stripeStart: '#e8b84b',
    stripeEnd: '#d1453d',
    glow: 'rgba(240,200,120,0.35)',
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

    CARS.forEach((c) => {
      const h = BOTTOM - c.top;
      ctx.fillStyle = COLORS.hull;
      ctx.fillRect(gx(c.x), gx(c.top), gw(c.w), gw(h));
      ctx.fillStyle = COLORS.hullDark;
      ctx.fillRect(gx(c.x), gx(BOTTOM - 2), gw(c.w), gw(2));
      ctx.lineWidth = Math.max(2, Math.round(px * 0.3));
      ctx.strokeStyle = COLORS.outline;
      ctx.strokeRect(gx(c.x), gx(c.top), gw(c.w), gw(h));
    });

    NOSE_TOPS.forEach((top, i) => {
      const x = NOSE_X + i;
      const h = BOTTOM - top;
      ctx.fillStyle = COLORS.hull;
      ctx.fillRect(gx(x), gx(top), gw(1), gw(h));
      const dh = Math.min(2, h);
      ctx.fillStyle = COLORS.hullDark;
      ctx.fillRect(gx(x), gx(BOTTOM - dh), gw(1), gw(dh));
    });

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
      ctx.fillStyle = COLORS.window;
      WINDOW_GROUPS.forEach((g) => {
        g.xs.forEach((x) => {
          ctx.fillRect(gx(x), gx(g.y), gw(g.w), gw(g.h));
        });
      });
      ctx.fillStyle = COLORS.cockpit;
      ctx.fillRect(gx(NOSE_X + 2), gx(7), gw(2), gw(2));
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
