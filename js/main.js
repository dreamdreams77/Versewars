// Verse Wars: main
//
// No framework: game state lives in one variable, every dispatch re-renders
// by rebuilding innerHTML, and a single delegated click listener on the
// root handles every button and card in the app. The Codex (Story/Rules/
// Comic) is pure reference content with no game-state implications, so it
// lives in its own small local UI state rather than going through the
// engine reducer.

window.VW = window.VW || {};

(function () {
  const TYPE_META = window.VW.TYPE_META;
  const ABILITY_TEXT = window.VW.ABILITY_TEXT;
  const STAGE_MAP = window.VW.STAGE_MAP;
  const STARTING_HP = window.VW.STARTING_HP;
  const UNLOCKABLE = window.VW.UNLOCKABLE;
  const CREW_CARDS = window.VW.CREW_CARDS;
  const VESSEL_CARDS = window.VW.VESSEL_CARDS;
  const LOCATION_CARDS = window.VW.LOCATION_CARDS;
  const ARTIFACT_CARDS = window.VW.ARTIFACT_CARDS;
  const ACHIEVEMENTS = window.VW.ACHIEVEMENTS;
  const engine = window.VW.engine;
  const sound = window.VW.sound;
  const train = window.VW.train;
  const codex = window.VW.codex;

  const root = document.getElementById('app');
  let state = engine.createMenuState();
  let aiTimer = null;
  let codexOpen = false; // dropdown, menu screen only
  let codexView = null; // null | 'story' | 'rules' | 'comic' | 'achievements': overlay tab, if open

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  // Achievement toasts live in their own layer appended straight to
  // <body>, outside #app, so they survive the next full re-render instead
  // of getting wiped the moment render() rebuilds the root's innerHTML.
  let toastLayer = null;
  function getToastLayer() {
    if (!toastLayer) {
      toastLayer = document.createElement('div');
      toastLayer.className = 'achievement-toast-layer';
      document.body.appendChild(toastLayer);
    }
    return toastLayer;
  }

  function showAchievementToast(def) {
    const layer = getToastLayer();
    const el = document.createElement('div');
    el.className = 'achievement-toast';
    el.innerHTML =
      '<span class="achievement-toast__mark">&#9733;</span>' +
      '<div class="achievement-toast__text"><strong>Achievement unlocked</strong><span>' + escapeHtml(def.name) + '</span></div>';
    layer.appendChild(el);
    requestAnimationFrame(() => el.classList.add('achievement-toast--in'));
    setTimeout(() => {
      el.classList.remove('achievement-toast--in');
      el.classList.add('achievement-toast--out');
      setTimeout(() => el.remove(), 400);
    }, 4200);
  }

  function dispatch(action) {
    const prevOutcome = state.stageOutcome;
    const prevScrip = state.meta ? state.meta.totalScrip : 0;
    const prevAchIds = (state.meta && state.meta.achievements) || [];
    state = engine.reduce(state, action);
    render();

    const nextAchIds = (state.meta && state.meta.achievements) || [];
    if (nextAchIds.length > prevAchIds.length) {
      const newIds = nextAchIds.filter((id) => prevAchIds.indexOf(id) === -1);
      newIds.forEach((id) => {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (def) showAchievementToast(def);
      });
      sound.achievement();
    }

    if (state.log && state.log[0] && state.log[0].indexOf('static storm rattles') !== -1) {
      const boardEl = document.querySelector('.board');
      if (boardEl) {
        boardEl.classList.add('board--shake');
        setTimeout(() => boardEl.classList.remove('board--shake'), 400);
      }
    }

    if (state.stageOutcome && state.stageOutcome !== prevOutcome) {
      if (state.stageOutcome === 'cleared') sound.win();
      else if (state.stageOutcome === 'run-complete') sound.runComplete();
      else if (state.stageOutcome === 'hp-lost') sound.hpLost();
      else if (state.stageOutcome === 'run-over') sound.runOver();
    }
    if (state.meta && state.meta.totalScrip < prevScrip) {
      sound.unlock();
    }
    scheduleAiTurnIfNeeded();
  }

  function scheduleAiTurnIfNeeded() {
    if (aiTimer) {
      clearTimeout(aiTimer);
      aiTimer = null;
    }
    if (state.phase === 'playing' && state.turn === 'ai' && !state.winner) {
      aiTimer = setTimeout(() => {
        sound.aiTurn();
        dispatch({ type: 'AI_FULL_TURN' });
      }, 1000);
    }
  }

  function hpPips(hp, maxHp) {
    let out = '';
    for (let i = 0; i < maxHp; i++) {
      out += i < hp ? '&#9829;' : '&#9825;';
    }
    return out;
  }

  function runSummaryHtml(state, stagesCleared) {
    const cardsCollected = state.run.tableau.length;
    const scripThisRun = state.run.scripEarnedThisRun || 0;
    const mvp = state.run.tableau.find((c) => c.type === 'crew');
    return (
      '<div class="run-summary">' +
      '<div class="run-summary__row"><span>Stages cleared</span><strong>' + stagesCleared + ' / ' + STAGE_MAP.totalDepth + '</strong></div>' +
      '<div class="run-summary__row"><span>Cards collected</span><strong>' + cardsCollected + '</strong></div>' +
      '<div class="run-summary__row"><span>Scrip this run</span><strong>' + scripThisRun + '</strong></div>' +
      '<div class="run-summary__row"><span>MVP</span><strong>' + (mvp ? escapeHtml(mvp.name) : 'none') + '</strong></div>' +
      '</div>'
    );
  }

  function abilityHtml(card) {
    if (!card.ability || !ABILITY_TEXT[card.ability.type]) return '';
    const text = ABILITY_TEXT[card.ability.type](card.ability.value);
    return '<span class="card__ability">' + escapeHtml(text) + '</span>';
  }

  function typeLabelHtml(card) {
    const meta = TYPE_META[card.type];
    return '<span class="card__type" style="color:' + meta.accent + '">[ <span class="card__icon card__icon--' + card.type + '"></span>' + meta.label + ' ]</span>';
  }

  function cardHtml(card, opts) {
    opts = opts || {};
    const meta = TYPE_META[card.type];
    const sizeClass = opts.size === 'sm' ? ' card--sm' : '';
    const clickable = !!opts.clickable;
    const isTarget = !!opts.isTarget;
    const disabled = !!opts.disabled;
    const interactive = clickable || isTarget;
    const tag = interactive ? 'button' : 'div';
    const idAttr = isTarget ? 'data-target-id' : 'data-card-id';
    const attrs = interactive ? 'type="button" ' + idAttr + '="' + card.id + '"' + (disabled ? ' disabled' : '') : '';
    const desc = card.description ? '<span class="card__desc">' + escapeHtml(card.description) + '</span>' : '';
    const flavor = card.flavor ? '<span class="card__flavor">' + escapeHtml(card.flavor) + '</span>' : '';
    return (
      '<' + tag + ' class="card' + sizeClass + (interactive ? ' card--clickable' : '') + (disabled ? ' card--disabled' : '') + (isTarget ? ' card--targetable' : '') + '"' +
      ' style="border-left-color:' + meta.accent + '" ' + attrs + '>' +
      typeLabelHtml(card) +
      '<span class="card__name">' + escapeHtml(card.name) + '</span>' +
      desc + flavor + abilityHtml(card) +
      '</' + tag + '>'
    );
  }

  function lockedCardHtml(card, cost, canAfford) {
    const meta = TYPE_META[card.type];
    const flavor = card.flavor ? '<span class="card__flavor">' + escapeHtml(card.flavor) + '</span>' : '';
    return (
      '<div class="card card--locked" style="border-left-color:' + meta.accent + '">' +
      typeLabelHtml(card) +
      '<span class="card__name">' + escapeHtml(card.name) + '</span>' +
      flavor + abilityHtml(card) +
      '<button type="button" class="btn btn--unlock" data-action="unlock" data-card-id="' + card.id + '"' + (canAfford ? '' : ' disabled') + '>' +
      'Unlock: ' + cost + ' Scrip' +
      '</button>' +
      '</div>'
    );
  }

  // --- Codex ---------------------------------------------------------

  function codexDropdownHtml() {
    if (!codexOpen) return '';
    const items = ['story', 'rules', 'comic', 'achievements']
      .map((t) => '<button type="button" data-action="open-codex" data-tab="' + t + '">' + tabLabel(t) + '</button>')
      .join('');
    return '<div class="codex-dropdown__menu">' + items + '</div>';
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function tabLabel(t) {
    return t === 'achievements' ? 'Achievements' : capitalize(t);
  }

  // The open codex's own tab bar is tighter on space than the dropdown
  // menu that opens it, so "Achievements" gets a shorter label there
  // specifically, rather than relying on the row scrolling sideways.
  function tabBarLabel(t) {
    return t === 'achievements' ? 'Awards' : capitalize(t);
  }

  function codexOverlayHtml(tab) {
    const tabButtons = ['story', 'rules', 'comic', 'achievements']
      .map((t) => '<button type="button" class="codex-tab' + (t === tab ? ' codex-tab--active' : '') + '" data-action="codex-tab" data-tab="' + t + '">' + tabBarLabel(t) + '</button>')
      .join('');

    let body = '';
    if (tab === 'story') {
      body = codex.STORY_SECTIONS.map(
        (s) => '<section class="codex-section"><h3>' + escapeHtml(s.title) + '</h3>' + s.body.map((p) => '<p>' + escapeHtml(p) + '</p>').join('') + '</section>'
      ).join('');
    } else if (tab === 'rules') {
      body = codex.RULES_SECTIONS.map(
        (s) =>
          '<section class="codex-section"><h3>' + escapeHtml(s.title) + '</h3><ul>' +
          s.body.map((line) => '<li>' + escapeHtml(line) + '</li>').join('') +
          '</ul></section>'
      ).join('');
    } else if (tab === 'comic') {
      const panels = codex.COMIC_PANELS.map(
        (p) =>
          '<div class="comic-panel">' +
          '<div class="comic-panel__art">' +
          '<canvas class="comic-panel__canvas" data-kind="' + p.kind + '"></canvas>' +
          (p.speech ? '<div class="comic-bubble">' + escapeHtml(p.speech) + '</div>' : '') +
          '</div>' +
          '<p class="comic-panel__caption">' + escapeHtml(p.caption) + '</p>' +
          '</div>'
      ).join('');
      body = '<div class="comic-strip">' + panels + '</div>';
    } else if (tab === 'achievements') {
      const earned = (state.meta && state.meta.achievements) || [];
      body =
        '<div class="achievement-list">' +
        ACHIEVEMENTS.map((a) => {
          const got = earned.indexOf(a.id) !== -1;
          return (
            '<div class="achievement' + (got ? ' achievement--earned' : '') + '">' +
            '<span class="achievement__mark">' + (got ? '&#9733;' : '&#9734;') + '</span>' +
            '<div class="achievement__text">' +
            '<strong>' + escapeHtml(a.name) + '</strong>' +
            '<span>' + escapeHtml(a.description) + '</span>' +
            '</div>' +
            '</div>'
          );
        }).join('') +
        '</div>';
    }

    return (
      '<div class="codex-overlay">' +
      '<div class="codex-overlay__panel">' +
      '<div class="win-titlebar"><span class="win-titlebar__title"><span class="icon--floppy"></span>CODEX.SYS</span>' +
      '<button type="button" class="win-titlebar__close" data-action="close-codex" aria-label="Close">&times;</button></div>' +
      '<div class="codex-overlay__header">' +
      '<div class="codex-overlay__tabs">' + tabButtons + '</div>' +
      '</div>' +
      '<div class="codex-overlay__body">' + body + '</div>' +
      '</div>' +
      '</div>'
    );
  }

  // --- Screens ---------------------------------------------------------

  function renderMenu() {
    const scrip = state.meta.totalScrip;
    root.innerHTML =
      '<div class="menu">' +
      '<div class="menu__inner">' +
      '<p class="menu__eyebrow">Route: uncharted &middot; independent run</p>' +
      '<h1 class="menu__title">VERSE WARS</h1>' +
      '<div id="train-hero-menu"></div>' +
      '<p class="menu__tagline">Rules shift. Goals flip. Build your crew across five branching stages, all the way to the Last Junction. One Keeper, one Rule, one betrayal at a time.</p>' +
      '<p class="menu__scrip">[ Scrip banked: ' + scrip + ' ]</p>' +
      '<div class="menu__actions">' +
      '<button type="button" class="btn btn--primary btn--lg" data-action="start">Enter the Hyperrail</button>' +
      '</div>' +
      '<div class="menu__actions menu__actions--secondary">' +
      '<button type="button" class="btn btn--ghost" data-action="go-to-hangar">The Hangar</button>' +
      '<div class="codex-dropdown">' +
      '<button type="button" class="btn btn--ghost" data-action="toggle-codex">Codex &#9662;</button>' +
      codexDropdownHtml() +
      '</div>' +
      '</div>' +
      '<div class="menu__howto">' +
      '<h2>How to play</h2>' +
      '<ul>' +
      '<li>Play cards from your Manifest: Crew, Vessels, Locations, and Artifacts stay in front of you as Keepers.</li>' +
      '<li>Rule cards change how everyone plays. Action cards cause one-off chaos. Goal cards define how to win, and can flip at any time.</li>' +
      '<li>Clear a stage&rsquo;s Goal to move on. Lose one and you&rsquo;ll retry it, but a run only has ' + STARTING_HP + ' HP.</li>' +
      '<li>Crew cards carry passive abilities now. Check what&rsquo;s in your tableau.</li>' +
      '<li>Scrip earned from cleared stages can be spent in the Hangar to permanently unlock more of the roster.</li>' +
      '<li>Full rules and the story so far are in the Codex above.</li>' +
      '</ul>' +
      '</div>' +
      '</div>' +
      '</div>';
    train.mount(document.getElementById('train-hero-menu'));
  }

  function renderHangar() {
    const meta = state.meta;
    const unlockedSet = {};
    meta.unlockedIds.forEach((id) => {
      unlockedSet[id] = true;
    });

    function section(title, cards) {
      const items = cards
        .map((c) => {
          if (unlockedSet[c.id]) return cardHtml(c, {});
          const entry = UNLOCKABLE.find((u) => u.id === c.id);
          const cost = entry ? entry.cost : 0;
          return lockedCardHtml(c, cost, meta.totalScrip >= cost);
        })
        .join('');
      return '<div class="hangar-section"><h2>' + title + '</h2><div class="hangar-grid">' + items + '</div></div>';
    }

    root.innerHTML =
      '<div class="hangar">' +
      '<div class="win-titlebar"><span class="win-titlebar__title"><span class="icon--floppy"></span>HANGAR.SYS</span>' +
      '<button type="button" class="win-titlebar__close" data-action="back-to-menu" aria-label="Back">&times;</button></div>' +
      '<header class="hangar__header">' +
      '<span class="hangar__scrip">[ Scrip: ' + meta.totalScrip + ' ]</span>' +
      '</header>' +
      '<p class="hangar__intro">Spend Scrip earned from cleared stages to permanently unlock more Crew, Vessels, Locations, and Artifacts for every future run.</p>' +
      section('Crew', CREW_CARDS) +
      section('Vessels', VESSEL_CARDS) +
      section('Locations', LOCATION_CARDS) +
      section('Artifacts', ARTIFACT_CARDS) +
      '</div>';
  }

  function renderBoard() {
    const players = state.players;
    const activeGoal = state.activeGoal;
    const activeRules = state.activeRules;
    const pendingTarget = state.pendingTarget;
    const turn = state.turn;
    const playsLeft = state.playsLeft;
    const winner = state.winner;
    const log = state.log;
    const phase = state.phase;
    const yourTurn = phase === 'playing' && turn === 'you' && !winner && !pendingTarget;
    const stageDef = STAGE_MAP.nodes[state.run.nodeId];

    const goalBanner = activeGoal
      ? '<strong>' + escapeHtml(activeGoal.name) + '</strong><span>' + escapeHtml(activeGoal.description) + '</span>'
      : '<span class="banner__empty">No Goal in play yet. Play one to define how to win.</span>';

    const activeRuleList = ['HAND_LIMIT', 'PLAY_LIMIT', 'DRAW_COUNT'].map((slot) => activeRules[slot]).filter(Boolean);
    const ruleBanner = activeRuleList.length
      ? activeRuleList.map((r) => '<div class="rule-line"><strong>' + escapeHtml(r.name) + '</strong><span>' + escapeHtml(r.description) + '</span></div>').join('')
      : '<span class="banner__empty">Default rules: draw 1, play 1.</span>';

    const targetPrompt = pendingTarget
      ? '<p class="target-prompt">' + (pendingTarget.effect === 'STEAL_KEEPER' ? 'Choose a Keeper to steal.' : 'Choose a rival Keeper to swap for.') + '</p>'
      : '';
    const rivalRow = players.ai.keepers.length
      ? players.ai.keepers
          .map((c) => {
            if (!pendingTarget) return cardHtml(c, { size: 'sm' });
            const immune = c.ability && c.ability.type === 'STEAL_IMMUNE';
            return cardHtml(c, { size: 'sm', isTarget: !immune, disabled: immune });
          })
          .join('')
      : '<p class="empty-row">No Keepers yet.</p>';
    const yourRow = players.you.keepers.length
      ? players.you.keepers.map((c) => cardHtml(c, { size: 'sm' })).join('')
      : '<p class="empty-row">No Keepers yet.</p>';
    const handRow = players.you.hand.map((c) => cardHtml(c, { clickable: true, disabled: !yourTurn })).join('');

    const thinking = turn === 'ai' && !winner ? ' <em class="thinking">&middot; plotting a route<span class="cursor">&#9612;</span></em>' : '';
    const playsBadge = yourTurn ? ' <span class="plays-left">&middot; ' + playsLeft + ' play' + (playsLeft === 1 ? '' : 's') + ' left</span>' : '';

    let overlay = '';
    if (state.stageOutcome) {
      let heading = '';
      let bodyHtml = '';
      let actionsHtml = '';
      const goalLine = activeGoal ? '<p class="overlay__goal">Goal completed: ' + escapeHtml(activeGoal.name) + '</p>' : '';

      if (state.stageOutcome === 'cleared') {
        heading = 'Stage cleared!';
        bodyHtml = goalLine + '<p class="overlay__scrip">+' + state.scripEarned + ' Scrip</p>';
        const currentNode = STAGE_MAP.nodes[state.run.nodeId];
        const routeButtons = currentNode.next
          .map((nextId) => {
            const n = STAGE_MAP.nodes[nextId];
            const hint = n.harder ? '+1 rival hand, +' + n.scripBonus + ' Scrip' : 'Standard difficulty';
            const cls = n.harder ? 'btn--danger' : 'btn--primary';
            return '<button type="button" class="btn ' + cls + '" data-action="continue-stage" data-next-node-id="' + n.id + '">' + escapeHtml(n.name) + '<span>' + hint + '</span></button>';
          })
          .join('');
        actionsHtml = '<div class="overlay__routes">' + routeButtons + '</div>';
      } else if (state.stageOutcome === 'run-complete') {
        heading = 'You cleared the whole run!';
        const note = state.homecomingLine
          ? '<p class="overlay__homecoming">' + escapeHtml(state.homecomingLine) + '</p><p class="overlay__note">Thank you. Always and forever.</p>'
          : '';
        bodyHtml = goalLine + '<p class="overlay__scrip">+' + state.scripEarned + ' Scrip, ' + state.meta.totalScrip + ' total</p>' + runSummaryHtml(state, STAGE_MAP.totalDepth) + note;
        actionsHtml = '<button type="button" class="btn btn--primary" data-action="back-to-menu">Back to Menu</button>';
      } else if (state.stageOutcome === 'hp-lost') {
        heading = 'The rival crew takes this stage.';
        bodyHtml = '<p class="overlay__goal">&minus;1 HP, ' + state.run.hp + ' of ' + STARTING_HP + ' remaining</p>';
        actionsHtml = '<button type="button" class="btn btn--primary" data-action="retry-stage">Try Again</button>';
      } else if (state.stageOutcome === 'run-over') {
        heading = 'Out of runs.';
        bodyHtml = '<p class="overlay__goal">The Combine holds the line, for now. ' + state.meta.totalScrip + ' Scrip banked for next time.</p>' + runSummaryHtml(state, state.run.depth - 1);
        actionsHtml = '<button type="button" class="btn btn--primary" data-action="back-to-menu">Back to Menu</button>';
      }

      overlay = '<div class="overlay"><div class="overlay__card"><h2>' + heading + '</h2>' + bodyHtml + actionsHtml + '</div></div>';
    }

    root.innerHTML =
      '<div class="board">' +
      '<header class="board__header">' +
      '<div id="train-hero-board"></div>' +
      '<div class="board__title">' +
      '<h1>Verse Wars</h1>' +
      '<div class="board__header-actions">' +
      '<button type="button" class="btn btn--ghost btn--icon" data-action="toggle-sound" aria-label="Toggle sound">' +
      (sound.isEnabled() ? '&#128266;' : '&#128263;') +
      '</button>' +
      '<div class="codex-dropdown">' +
      '<button type="button" class="btn btn--ghost" data-action="toggle-codex">Codex &#9662;</button>' +
      codexDropdownHtml() +
      '</div>' +
      '<button type="button" class="btn btn--ghost" data-action="restart">New Run</button>' +
      '</div>' +
      '</div>' +
      '</header>' +
      '<div class="board__progress">' +
      '<span class="board__stage">Stage ' + state.run.depth + ' of ' + STAGE_MAP.totalDepth + ': ' + escapeHtml(stageDef.name) + (STAGE_MAP.nodes[state.run.nodeId].harder ? ' <em class="risky-tag">RISKY</em>' : '') + '</span>' +
      '<span class="board__hp" aria-label="' + state.run.hp + ' of ' + STARTING_HP + ' HP remaining">' + hpPips(state.run.hp, STARTING_HP) + '</span>' +
      '</div>' +
      '<div class="board__banners">' +
      '<div class="banner banner--goal"><span class="banner__label">[ Active Goal ]</span>' + goalBanner + '</div>' +
      '<div class="banner banner--rule"><span class="banner__label">[ Active Rule ]</span>' + ruleBanner + '</div>' +
      '</div>' +
      '<section class="board__tableau">' +
      '<h2>Rival Crew&rsquo;s Rails' + thinking + '</h2>' +
      targetPrompt +
      '<div class="tableau-row">' + rivalRow + '</div>' +
      '</section>' +
      '<section class="board__tableau">' +
      '<h2>Your Rails</h2>' +
      '<div class="tableau-row">' + yourRow + '</div>' +
      '</section>' +
      '<section class="board__hand">' +
      '<h2>Your Manifest' + playsBadge + '</h2>' +
      '<div class="hand-row">' + handRow + '</div>' +
      '</section>' +
      '<section class="board__log">' +
      '<h2>Dispatch Log</h2>' +
      '<ul>' + log.slice(0, 6).map((entry) => '<li>' + escapeHtml(entry) + '</li>').join('') + '</ul>' +
      '</section>' +
      overlay +
      '</div>';

    train.mount(document.getElementById('train-hero-board'), { compact: true });
  }

  function render() {
    if (state.phase === 'menu') {
      renderMenu();
    } else if (state.phase === 'hangar') {
      renderHangar();
    } else {
      renderBoard();
    }
    if (codexView) {
      root.insertAdjacentHTML('beforeend', codexOverlayHtml(codexView));
      if (codexView === 'comic') {
        root.querySelectorAll('.comic-panel__canvas').forEach((c) => {
          codex.drawPanel(c, c.getAttribute('data-kind'));
        });
      }
    }
  }

  root.addEventListener('click', (e) => {
    if (codexOpen && !e.target.closest('.codex-dropdown')) {
      codexOpen = false;
      render();
      return;
    }

    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      const action = actionEl.getAttribute('data-action');
      if (action === 'start' || action === 'restart') {
        sound.start();
        dispatch({ type: 'START_RUN' });
      } else if (action === 'toggle-sound') {
        sound.setEnabled(!sound.isEnabled());
        render();
      } else if (action === 'go-to-hangar') {
        dispatch({ type: 'GO_TO_HANGAR' });
      } else if (action === 'back-to-menu') {
        dispatch({ type: 'BACK_TO_MENU' });
      } else if (action === 'continue-stage') {
        dispatch({ type: 'CONTINUE_STAGE', nextNodeId: actionEl.getAttribute('data-next-node-id') });
      } else if (action === 'retry-stage') {
        sound.start();
        dispatch({ type: 'RETRY_STAGE' });
      } else if (action === 'unlock') {
        if (!actionEl.disabled) {
          dispatch({ type: 'UNLOCK_CARD', cardId: actionEl.getAttribute('data-card-id') });
        }
      } else if (action === 'toggle-codex') {
        codexOpen = !codexOpen;
        render();
      } else if (action === 'open-codex') {
        codexView = actionEl.getAttribute('data-tab');
        codexOpen = false;
        render();
      } else if (action === 'codex-tab') {
        codexView = actionEl.getAttribute('data-tab');
        render();
      } else if (action === 'close-codex') {
        codexView = null;
        render();
      }
      return;
    }

    const targetEl = e.target.closest('[data-target-id]');
    if (targetEl && !targetEl.disabled) {
      sound.playCard();
      dispatch({ type: 'CHOOSE_TARGET', targetCardId: targetEl.getAttribute('data-target-id') });
      return;
    }

    const cardEl = e.target.closest('[data-card-id]');
    if (cardEl && !cardEl.disabled) {
      sound.playCard();
      dispatch({ type: 'PLAY_CARD', cardId: cardEl.getAttribute('data-card-id') });
    }
  });

  render();
})();
