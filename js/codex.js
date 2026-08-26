// Verse Wars: codex
//
// Static reference content for the in-menu Codex: the Story, a full Rules
// reference, and a short comic retelling of the Story. The comic is drawn
// with the exact same technique as the menu's train hero: a low-res grid
// of flat-colored rectangles rendered with image smoothing turned off, so
// everything reads as chunky, old-school pixel art rather than smooth
// vector shapes. No curves, no smooth gradients, no SVG.

window.VW = window.VW || {};

(function () {
  const STORY_SECTIONS = [
    {
      title: 'The Line',
      body: [
        "Long before anyone alive can remember, someone laid the Hyperrail: a maglev spine stitching star systems together, station by station. Nobody builds new rail anymore. Nobody needs to. You just run what's already there, faster and quieter than the last crew, and hope the rail hasn't noticed you're behind on your fees.",
        "The old maps call it a marvel of engineering. The newer maps, the ones crews actually trust, call it something closer to a living thing. Track that reroutes itself overnight. Junctions that weren't there yesterday. Whoever built the Hyperrail is long gone, if they ever existed as anyone would recognize, and the frontier learned a long time ago to stop asking questions it can't afford answers to.",
      ],
    },
    {
      title: 'The Combine',
      body: [
        "The Combine calls itself an authority. Everyone else calls it a toll booth with an army. It doesn't own the Hyperrail, since nobody built it and nobody can prove they do, but it polices the stations, taxes the yards, and remembers every crew that's ever slipped a blockade. It has a very long memory, and very little patience.",
        "Combine agents don't chase, not really. They wait. A crew that dodges a checkpoint today gets flagged for tomorrow, and the day after, until the debt comes due at whichever junction offers no other way through. Most independent runners don't fear getting caught so much as they fear getting remembered.",
      ],
    },
    {
      title: 'The Static',
      body: [
        "Past a certain point on the line, the signal goes quiet. Not off, quiet, like something is listening instead of broadcasting. Crews call it the Static. Nobody agrees on what it actually is. Everybody agrees you don't want to find out with an empty fuel line.",
        "The stories change depending on who's telling them. Some say it's what's left of a line that was never finished. Some say it's what happens to a signal that travels far enough with nobody left to hear it. The oldest runners just go quiet themselves when you bring it up, and change the subject to something safer, like the weather, or the Combine, or anything at all.",
      ],
    },
    {
      title: 'Your Crew',
      body: [
        "You're not Combine. You're not Static. You're a runner, one more independent crew keeping a modified train barely a car length ahead of a toll collector, threading rules that change faster than the scenery, chasing whatever's waiting at the end of the line.",
        "Nobody runs the Hyperrail alone for long. The train needs hands it can trust, and the frontier has a way of finding you exactly the crew you need, usually right when you're about to give up looking. Some you'll hire. Some you'll steal fair and square from a rival's tableau. All of them, eventually, start to feel less like cargo and more like family, which is either the nicest thing about this life or the most dangerous, depending who you ask.",
      ],
    },
    {
      title: 'The Roster',
      body: [
        "Every crew is built, not born. A captain who runs the train like it's the only thing left of home. An engineer who can coax another hundred miles out of an engine that should have died three stations back. A medic who patches up crew and secrets in equal measure. Somewhere on every good crew there's also the one who forgets where the train's parked but never forgets a punchline, and somehow that's the one everybody would run back into a Combine blockade for.",
        "Scrip earned out on the line goes back into building that crew further, Vessel by Vessel, Location by Location, until the whole roster looks less like a list of strangers and more like a life. The Hangar remembers every hand you've ever hired. None of them ever really leave.",
      ],
    },
    {
      title: 'Scrip and the Hangar',
      body: [
        "Nobody pays you to run the Hyperrail. You earn Scrip the same way every independent crew always has: by surviving a stage the Combine expected you to lose. It isn't much on its own, a handful of credits scraped together after a hard stretch of track, but it adds up the way everything on the frontier adds up, slowly, and then all at once.",
        "Spend it wisely at the Hangar and the next run starts a little stronger than the last. Spend it recklessly and you'll be back to running with whatever crew you can scrape together from an empty tableau. Either way, nothing earned out on the line stays out on the line. It always finds its way home.",
      ],
    },
    {
      title: 'The Last Junction',
      body: [
        "Every chart, every manifest, every rail map anyone's ever trusted eventually runs out at the same place: the Last Junction. Past it, the ink just stops, like whoever drew the map got there, looked at what was next, and decided some things are better left undrawn.",
        "Runners who've made it that far don't agree on much, but they agree on this: the Static gets louder the closer you get, and the Combine's checkpoints get thinner, like even the people paid to enforce the rules would rather not be out there when the sun goes down. Whatever's waiting past the Last Junction, it isn't on anybody's payroll, and it isn't going anywhere. The only question that's ever mattered is whether you are.",
      ],
    },
    {
      title: 'This Run',
      body: [
        "Dustfall Station. The Glass Concourse. Nine Rivers Yard. Sakura Junction. The Rustbelt Span. The Cinderline. Cold Harbor Yard. Hollowpoint Crossing. The Static Fringe. And if you're still standing, the Last Junction.",
        "Every run starts the same way, with a rumor, a job, or just a reason to point the train toward the frontier and go. No two runs take the same line through it. Every junction is a choice, and you won't see every named stop in one trip. After that, the charted line ends, and everything else is up to the crew you've built and the choices you make, one station at a time.",
      ],
    },
  ];

  const RULES_SECTIONS = [
    {
      title: 'Card Types',
      body: [
        'Crew, Vessel, Location, Artifact: these are Keepers. Play one and it stays in front of you, counting toward whichever Goal is active. Every Keeper can carry a passive ability now, not just Crew.',
        'Rule: sets the Rule for its slot (hand limit, play limit, or draw count). Rules in different slots stack, so up to three can be active for both players at once.',
        'Action: resolves immediately, then goes to the discard pile. Boarding Party and Swap Rails let you choose which rival Keeper to target, instead of picking at random.',
        'Goal: replaces the active Goal and defines what it takes to win this stage. It can change mid-stage, for either side.',
      ],
    },
    {
      title: 'Your Turn',
      body: [
        'Draw first (1 card by default, more with certain Rules, or with a DRAW-boosting Keeper in your tableau).',
        'Then play up to your play limit (1 by default, more with Full Throttle, or with a PLAY-boosting Keeper).',
        'Playing Boarding Party or Swap Rails pauses your turn for one choice: tap the rival Keeper you want. Nothing else is clickable until you pick.',
        "A win is checked the instant any card is played, by anyone. A Goal can complete on your rival's turn too.",
      ],
    },
    {
      title: 'The Run',
      body: [
        'A run is five stages deep: Dustfall Station to start, the Last Junction to finish, and three choices in between. Win a stage and your tableau carries forward into the next.',
        "Clearing most stages offers two paths onward. One side of that choice runs a tougher rival for bonus Scrip; the game marks it clearly before you pick. Both sides eventually lead to the same place, so there's no wrong choice, only a different one.",
        'Lose a stage and you lose 1 HP, then retry that same stage fresh, unless an HP_SHIELD Keeper absorbs it first. Run out of HP and the run ends, though every stage you already cleared banked its Scrip for good.',
        'Clear the Last Junction for a full run complete.',
      ],
    },
    {
      title: 'Crew Abilities',
      body: [
        'Capt. Rhys Kade: +2 bonus Scrip when you win a stage.',
        'Toli Vance: +1 card drawn each of your turns.',
        'Dr. Sable Renn: shields one Keeper from the next forced discard, once per stage.',
        'Bex Orlan: +1 play each of your turns.',
        'Iris Quon: +1 hand limit while in your tableau.',
        'Bub: draws 1 extra card the moment they\u2019re played.',
      ],
    },
    {
      title: 'Vessel Abilities',
      body: [
        'The Midnight Comet: +1 bonus Scrip when you win a stage.',
        'Cargo Hold Car: +1 hand limit while in your tableau.',
        'Ironclad Engine Car: absorbs one lost stage\u2019s HP cost, once per run.',
        'Stealth Plating Car: this Vessel can never be taken by Boarding Party.',
        'DJ Cool: the rival starts each stage with 1 fewer card.',
      ],
    },
    {
      title: 'Location & Artifact Abilities',
      body: [
        'Dustfall Station and The Glass Concourse each grant a bonus, Scrip or draw, while active (check the Hangar for exact numbers).',
        'Nine Rivers Yard: +1 play each of your turns.',
        'The Last Junction: +2 hand limit while in your tableau.',
        'Sakura Junction: restores HP when you win a stage.',
        'The Sundial Core: +1 card drawn each of your turns.',
        'A Forgotten Manifest: shields a Keeper from the next forced discard, once per stage.',
        'The Quiet Signal: +3 bonus Scrip when you win a stage.',
        'The Last Save Point: absorbs one lost stage\u2019s HP cost, once per run.',
      ],
    },
    {
      title: 'The Hangar',
      body: [
        'Scrip banked from cleared stages carries over between runs.',
        'Spend it in the Hangar, from the main menu, to permanently unlock more Crew, Vessels, Locations, and Artifacts for every future run. Full ability text is shown right on each card there.',
      ],
    },
  ];

  const COMIC_PANELS = [
    { kind: 'train-wide', caption: 'Long before anyone remembers, someone laid the Hyperrail.' },
    { kind: 'checkpoint', caption: 'The Combine collects. The Combine remembers.' },
    { kind: 'crew', caption: 'Every independent crew runs the same bet.', speech: "Fees are due at the Junction. We won't be there." },
    { kind: 'chase', caption: 'Every stage is a station. Every station is a bet.' },
    { kind: 'static', caption: 'Something past the Last Junction listens back.' },
    { kind: 'horizon', caption: 'The maps just say good luck.' },
  ];

  // --- Pixel-grid drawing kit ------------------------------------------
  // Every panel is drawn on a low-resolution grid (GRID_W x GRID_H "big
  // pixels"), the same technique train.js uses for the menu hero, so the
  // whole comic reads as one consistent 16-bit-era sprite style. SCALE is
  // how many real canvas pixels one grid unit covers; every helper below
  // draws straight onto the real 2D context using that.

  const GRID_W = 90;
  const GRID_H = 58;
  const SCALE = 5;

  function px(ctx, gx, gy, gw, gh, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(gx * SCALE), Math.round(gy * SCALE), Math.round(gw * SCALE) + 1, Math.round(gh * SCALE) + 1);
  }

  // Flat horizontal color bands instead of a smooth gradient, a classic
  // limited-palette pixel-art sky.
  function bands(ctx, rows) {
    let y = 0;
    rows.forEach((r) => {
      px(ctx, 0, y, GRID_W, r[0], r[1]);
      y += r[0];
    });
  }

  // A small plus-shaped "twinkle" star, or a single dot for dimmer ones,
  // both classic 8-bit star treatments.
  function star(ctx, gx, gy, color, big) {
    if (big) {
      px(ctx, gx - 1, gy, 3, 1, color);
      px(ctx, gx, gy - 1, 1, 3, color);
    } else {
      px(ctx, gx, gy, 1, 1, color);
    }
  }

  // Fills a symmetric silhouette from an array of row-width numbers,
  // centered horizontally at cx, the standard pixel-art way to approximate
  // a circle or badge as stepped horizontal bars.
  function stepped(ctx, cx, topY, rowWidths, color) {
    rowWidths.forEach((w, i) => {
      if (w <= 0) return;
      px(ctx, cx - w / 2, topY + i, w, 1, color);
    });
  }

  // A small blocky humanoid sprite, drawn from a row-string bitmap, the
  // same idea as an old JRPG overworld sprite. '#' = fill, '.' = empty.
  const FIGURE_ROWS = ['..####..', '..####..', '.######.', '.######.', '.######.', '.######.', '.######.', '.######.', '.######.', '.##..##.', '.##..##.', '.##..##.', '.##..##.', '.##..##.', '.##..##.', '.##..##.'];
  function figure(ctx, gx, gy, color, scale, shadowColor) {
    scale = scale || 1;
    if (shadowColor) {
      px(ctx, gx + scale, gy + 16 * scale, 6 * scale, scale, shadowColor);
    }
    FIGURE_ROWS.forEach((row, ry) => {
      let start = -1;
      for (let i = 0; i <= row.length; i++) {
        const filled = row[i] === '#';
        if (filled && start === -1) start = i;
        if (!filled && start !== -1) {
          px(ctx, gx + start * scale, gy + ry * scale, (i - start) * scale, scale, color);
          start = -1;
        }
      }
    });
  }

  function ties(ctx, y, color, step) {
    for (let x = 1; x < GRID_W; x += step || 6) {
      px(ctx, x, y, 2, 2, color);
    }
  }

  function zigzag(ctx, points, color, weight) {
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
      for (let s = 0; s <= steps; s++) {
        const gx = Math.round(a[0] + ((b[0] - a[0]) * s) / steps);
        const gy = Math.round(a[1] + ((b[1] - a[1]) * s) / steps);
        px(ctx, gx, gy, weight || 1, weight || 1, color);
      }
    }
  }

  // Composites the shared train sprite (the exact same one the menu hero
  // uses) into a panel. drawTrainShape draws in its own 66x17 grid at
  // whatever real-pixel scale it's given, using real gradients/strokes,
  // so rather than intercept its draw calls, this just moves the real
  // canvas origin to the right spot first, the ordinary Canvas 2D way.
  function compositeTrain(ctx, gridX, gridY, trainScale, opts) {
    ctx.save();
    ctx.translate(Math.round(gridX * SCALE), Math.round(gridY * SCALE));
    VW.train.drawTrainShape(ctx, SCALE * trainScale, opts);
    ctx.restore();
  }

  const PAL = {
    inkA: '#0b0e14', inkB: '#141a24', inkC: '#1c2430', duskA: '#241a2c', duskB: '#171018',
    coldA: '#0c1218', coldB: '#16232c', coldC: '#203444',
    warmA: '#20140f', warmB: '#2c1c12', warmC: '#3a2818',
    dangerA: '#1c0c0c', dangerB: '#2c1010', dangerC: '#4a1414',
    voidA: '#050408', voidB: '#0e0810',
    ground: '#05070a', groundLine: '#0d0a08',
    paper: '#ece4d3', brass: '#c99a4b', brassBright: '#e8b84b', signalRed: '#d1453d',
    steel: '#5b7a99', steelDark: '#2a323c', plum: '#8b6a9e',
    postLight: '#3a4048', postDark: '#14171b',
  };

  const PANEL_DRAWERS = {
    'train-wide': function (ctx) {
      bands(ctx, [[16, PAL.inkA], [16, PAL.inkB], [14, PAL.duskB], [6, PAL.duskA]]);
      [[6, 4], [15, 8], [24, 3], [33, 6], [41, 2], [50, 9], [58, 4], [66, 7], [72, 2], [80, 6], [10, 12], [46, 11], [63, 13]].forEach((s, i) => star(ctx, s[0], s[1], PAL.paper, i % 4 === 0));

      px(ctx, 0, 50, GRID_W, 2, PAL.groundLine);
      ties(ctx, 53, PAL.ground, 6);

      compositeTrain(ctx, 4, 32, 1, { glow: true });
    },

    checkpoint: function (ctx) {
      bands(ctx, [[20, PAL.coldA], [18, PAL.coldB], [16, PAL.coldC]]);

      px(ctx, 20, 42, 5, 16, PAL.postLight);
      px(ctx, 65, 42, 5, 16, PAL.postLight);
      px(ctx, 20, 51, 50, 4, PAL.postDark);
      px(ctx, 20, 52, 50, 2, PAL.signalRed);

      const badgeWidths = [5, 9, 11, 13, 13, 13, 13, 13, 13, 11, 9, 5];
      stepped(ctx, 45, 8, badgeWidths, PAL.steel);
      stepped(ctx, 45, 10, [3, 7, 9, 9, 9, 9, 9, 7, 3], PAL.steelDark);
      stepped(ctx, 45, 13, [5, 5, 5], PAL.signalRed);

      figure(ctx, 41, 33, PAL.inkA, 1);
    },

    crew: function (ctx) {
      bands(ctx, [[24, PAL.warmA], [16, PAL.warmB], [10, PAL.warmC]]);
      px(ctx, 0, 50, GRID_W, 8, PAL.groundLine);
      px(ctx, 0, 49, GRID_W, 1, PAL.warmC);

      figure(ctx, 24, 26, PAL.steel, 2, PAL.groundLine);
      figure(ctx, 40, 22, PAL.brass, 2.2, PAL.groundLine);
      figure(ctx, 58, 27, PAL.plum, 1.9, PAL.groundLine);
    },

    chase: function (ctx) {
      bands(ctx, [[22, PAL.dangerA], [18, PAL.dangerB], [10, PAL.dangerC]]);

      [[3, 14], [2, 22], [4, 30], [1, 38]].forEach((l) => px(ctx, l[0], l[1], 8 + l[0], 1, PAL.steel));

      px(ctx, 58, 4, 14, 3, PAL.steelDark);
      px(ctx, 70, 5, 5, 2, PAL.signalRed);

      px(ctx, 0, 50, GRID_W, 8, PAL.ground);
      ties(ctx, 51, PAL.groundLine, 5);

      compositeTrain(ctx, 2, 24, 1.05, { glow: false });
    },

    static: function (ctx) {
      bands(ctx, [[58, PAL.voidA]]);
      px(ctx, 41, 27, 8, 6, PAL.dangerC);
      px(ctx, 43, 25, 4, 10, PAL.dangerC);

      zigzag(ctx, [[45, 29], [38, 20], [41, 15], [32, 8]], PAL.paper, 1);
      zigzag(ctx, [[45, 29], [54, 19], [50, 12], [58, 6]], PAL.paper, 1);
      zigzag(ctx, [[45, 29], [34, 33], [26, 31], [18, 38]], PAL.paper, 1);
      zigzag(ctx, [[45, 29], [56, 35], [62, 31], [70, 36]], PAL.paper, 1);
      zigzag(ctx, [[45, 29], [43, 42], [48, 49], [40, 55]], PAL.paper, 1);
      zigzag(ctx, [[45, 29], [49, 40], [45, 50]], PAL.signalRed, 1);

      [[10, 9], [80, 14], [16, 46], [76, 48], [5, 28], [84, 32], [34, 4], [58, 52]].forEach((d) => star(ctx, d[0], d[1], PAL.paper));

      px(ctx, 43, 27, 4, 4, PAL.paper);
      px(ctx, 44, 28, 2, 2, PAL.dangerA);
      px(ctx, 44.5, 28.5, 1, 1, PAL.signalRed);
    },

    horizon: function (ctx) {
      bands(ctx, [[14, PAL.voidB], [14, PAL.duskA], [16, PAL.inkC], [14, PAL.voidA]]);
      px(ctx, 62, 18, 10, 10, PAL.plum);
      px(ctx, 65, 21, 4, 4, PAL.duskA);

      [[9, 8], [20, 5], [33, 11], [7, 18]].forEach((s) => star(ctx, s[0], s[1], PAL.paper));

      px(ctx, 0, 48, GRID_W, 2, PAL.groundLine);
      ties(ctx, 50, PAL.voidA, 6);
      px(ctx, 0, 50, GRID_W, 8, PAL.voidA);

      compositeTrain(ctx, 30, 33, 0.55, { glow: false });
    },
  };

  function drawPanel(canvas, kind) {
    canvas.width = GRID_W * SCALE;
    canvas.height = GRID_H * SCALE;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawer = PANEL_DRAWERS[kind];
    if (drawer) drawer(ctx);
  }

  window.VW.codex = {
    STORY_SECTIONS: STORY_SECTIONS,
    RULES_SECTIONS: RULES_SECTIONS,
    COMIC_PANELS: COMIC_PANELS,
    drawPanel: drawPanel,
  };
})();
