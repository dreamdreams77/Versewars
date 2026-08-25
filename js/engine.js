// Verse Wars: game engine
//
// Plain functions operating on a plain state object. No framework. main.js
// calls VW.engine.reduce(state, action) and re-renders from the result,
// the same shape as a reducer, just without React around it.
//
// State shape:
//   phase: 'menu' | 'hangar' | 'playing'
//   meta:  { totalScrip, unlockedIds }: persisted between runs
//   run:   { nodeId, depth, hp, tableau }: persists across stages
//                                                      within one run, reset
//                                                      on death or on a
//                                                      fresh START_RUN
//   ...plus the current stage-attempt's players/deck/discard/rule/goal/turn
//   fields, only meaningful while phase === 'playing'.

window.VW = window.VW || {};

(function () {
  const CARD_TYPES = window.VW.CARD_TYPES;
  const KEEPER_TYPES = window.VW.KEEPER_TYPES;
  const GOAL_CHECKS = window.VW.GOAL_CHECKS;
  const GOAL_REQUIREMENTS = window.VW.GOAL_REQUIREMENTS;
  const ABILITY = window.VW.ABILITY;
  const countByType = window.VW.countByType;
  const RULE_CARDS = window.VW.RULE_CARDS;
  const ACTION_CARDS = window.VW.ACTION_CARDS;
  const GOAL_CARDS = window.VW.GOAL_CARDS;
  const STAGE_MAP = window.VW.STAGE_MAP;

  function createMenuState() {
    return { phase: 'menu', meta: window.VW.storage.loadMeta() };
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function label(playerKey) {
    return playerKey === 'you' ? 'You' : 'The rival crew';
  }

  function getUnlockedPool(meta) {
    const unlocked = {};
    meta.unlockedIds.forEach((id) => {
      unlocked[id] = true;
    });
    return window.VW.ALL_KEEPER_CARDS.filter((c) => unlocked[c.id]);
  }

  function buildStageDeck(meta, excludeIds) {
    const exclude = {};
    (excludeIds || []).forEach((id) => {
      exclude[id] = true;
    });
    const keeperPool = getUnlockedPool(meta).filter((c) => !exclude[c.id]);
    const all = [].concat(keeperPool, RULE_CARDS, ACTION_CARDS, GOAL_CARDS).map((c) => Object.assign({}, c));
    return shuffle(all);
  }

  // Not just Crew abilities anymore. Every Keeper type can carry an
  // `ability` now, and this just sums whichever ones match, regardless of
  // card type.
  function getCrewBonus(keepers, abilityType) {
    return keepers.reduce((sum, c) => {
      if (c.ability && c.ability.type === abilityType) return sum + (c.ability.value || 0);
      return sum;
    }, 0);
  }

  function stealableKeepers(keepers) {
    return keepers.filter((k) => !(k.ability && k.ability.type === ABILITY.STEAL_IMMUNE));
  }

  // --- AI heuristics -----------------------------------------------------
  // How much a passive/triggered ability is worth to whoever holds it, used
  // both to rank which Keeper the AI should play and which rival Keeper is
  // worth targeting with Boarding Party / Swap Rails, rather than picking
  // either uniformly at random.
  const ABILITY_WEIGHT = {
    HAND_LIMIT_BONUS: 2.5,
    DRAW_BONUS: 3,
    PLAY_BONUS: 3.5,
    SCRIP_ON_WIN: 1,
    SHIELD_KEEPER: 1.5,
    ON_PLAY_DRAW: 2.2,
    HP_SHIELD: 1.2,
    STEAL_IMMUNE: 1.3,
    RIVAL_HAND_DEBUFF: 2,
    HEAL_ON_WIN: 1.2,
  };

  function keeperScore(c) {
    if (!c.ability) return 1;
    const w = ABILITY_WEIGHT[c.ability.type] || 1;
    return 1 + w * (c.ability.value || 1);
  }

  function bestKeeper(pool) {
    if (pool.length === 0) return null;
    let best = [pool[0]];
    let bestScore = keeperScore(pool[0]);
    for (let i = 1; i < pool.length; i++) {
      const s = keeperScore(pool[i]);
      if (s > bestScore) {
        best = [pool[i]];
        bestScore = s;
      } else if (s === bestScore) {
        best.push(pool[i]);
      }
    }
    return best[Math.floor(Math.random() * best.length)];
  }

  function worstKeeper(pool) {
    if (pool.length === 0) return null;
    let worst = pool[0];
    let worstScore = keeperScore(pool[0]);
    for (let i = 1; i < pool.length; i++) {
      const s = keeperScore(pool[i]);
      if (s < worstScore) {
        worst = pool[i];
        worstScore = s;
      }
    }
    return worst;
  }

  // Fraction (0..1) of a Goal's per-type Keeper requirements a side already
  // satisfies, e.g. 0.5 for a Goal needing 2 Crew when a side controls 1.
  // Lets the AI weigh a Goal by how close either side already is to it,
  // instead of only knowing pass/fail.
  function goalProgress(keepers, checkId) {
    const req = GOAL_REQUIREMENTS[checkId];
    if (!req) return 0;
    const types = Object.keys(req);
    if (types.length === 0) return 0;
    const total = types.reduce((sum, t) => sum + Math.min(countByType(keepers, t), req[t]) / req[t], 0);
    return total / types.length;
  }

  // Scores one playable hand card for the AI: how good a pick is it right
  // now, given the rest of its hand, its own tableau, the rival's tableau,
  // the active Goal, and the active Rules. Keeper cards favor strong
  // abilities and pieces the active Goal still needs; Action cards favor
  // whichever effect does the most damage or gain in the current board
  // state; Rule cards favor higher draw/play limits.
  function scoreAiCard(c, ctx) {
    const myKeepers = ctx.myKeepers;
    const rivalKeepers = ctx.rivalKeepers;
    const activeGoal = ctx.activeGoal;

    if (KEEPER_TYPES.includes(c.type)) {
      let score = keeperScore(c);
      if (activeGoal) {
        const req = GOAL_REQUIREMENTS[activeGoal.checkId];
        if (req && req[c.type] && countByType(myKeepers, c.type) < req[c.type]) score += 3;
      }
      return score;
    }

    if (c.type === 'rule') {
      if (c.effect === 'HAND_LIMIT') return c.value == null ? 4 : 1 + c.value * 0.6;
      if (c.effect === 'PLAY_LIMIT') return 1 + c.value * 1.2;
      if (c.effect === 'DRAW_COUNT') return 1 + c.value * 1.0;
      return 1;
    }

    if (c.type === 'goal') {
      const mine = goalProgress(myKeepers, c.checkId);
      const rival = goalProgress(rivalKeepers, c.checkId);
      return 1.5 + (mine - rival) * 5;
    }

    if (c.type === 'action') {
      switch (c.effect) {
        case 'STEAL_KEEPER': {
          const best = bestKeeper(stealableKeepers(rivalKeepers));
          return best ? 2 + keeperScore(best) : 0;
        }
        case 'TRADE_KEEPER': {
          const best = bestKeeper(stealableKeepers(rivalKeepers));
          const worst = worstKeeper(myKeepers);
          if (!best || !worst) return 0;
          return 1.5 + Math.max(0, keeperScore(best) - keeperScore(worst));
        }
        case 'ALL_DISCARD_KEEPER': {
          if (rivalKeepers.length === 0) return 0.2;
          const rivalAvg = rivalKeepers.reduce((s, k) => s + keeperScore(k), 0) / rivalKeepers.length;
          const myAvg = myKeepers.length ? myKeepers.reduce((s, k) => s + keeperScore(k), 0) / myKeepers.length : 0;
          return Math.max(0.2, 1 + (rivalAvg - myAvg));
        }
        case 'REDRAW_HAND': {
          const rest = ctx.hand.filter((h) => h.id !== c.id);
          const goodCount = rest.filter((h) => KEEPER_TYPES.includes(h.type) || h.type === 'action').length;
          return Math.max(0.3, 2.5 - goodCount);
        }
        case 'EXTRA_TURN':
          return 2.3;
        case 'DRAW_TWO':
          return 2.1;
        case 'DISCARD_RULE': {
          const activeCount = Object.keys(ctx.activeRules).filter((k) => ctx.activeRules[k]).length;
          return activeCount > 0 ? 0.8 : 0;
        }
        case 'DISCARD_GOAL': {
          if (!activeGoal) return 0;
          const mine = goalProgress(myKeepers, activeGoal.checkId);
          const rival = goalProgress(rivalKeepers, activeGoal.checkId);
          return rival > mine ? 1 + (rival - mine) * 4 : 0.2;
        }
        case 'DISCARD_RIVAL_HAND':
          return ctx.rivalHand.length > 0 ? 1.8 : 0;
        default:
          return 1;
      }
    }

    return 1;
  }

  function getDrawCount(state, playerKey) {
    const rule = state.activeRules.DRAW_COUNT;
    const base = rule ? rule.value : 1;
    const bonus = getCrewBonus(state.players[playerKey].keepers, ABILITY.DRAW_BONUS);
    const stageBonus = playerKey === 'ai' ? STAGE_MAP.nodes[state.run.nodeId].rivalDrawBonus : 0;
    return base + bonus + stageBonus;
  }
  function getPlayCount(state, playerKey) {
    const rule = state.activeRules.PLAY_LIMIT;
    const base = rule ? rule.value : 1;
    const bonus = getCrewBonus(state.players[playerKey].keepers, ABILITY.PLAY_BONUS);
    return base + bonus;
  }
  function getHandLimit(state, playerKey) {
    const rule = state.activeRules.HAND_LIMIT;
    const base = rule ? rule.value : null;
    if (base == null) return null;
    const bonus = getCrewBonus(state.players[playerKey].keepers, ABILITY.HAND_LIMIT_BONUS);
    return base + bonus;
  }

  function drawCards(state, playerKey, n) {
    const player = state.players[playerKey];
    for (let i = 0; i < n; i++) {
      if (state.deck.length === 0) {
        if (state.discard.length === 0) break;
        state.deck = shuffle(state.discard);
        state.discard = [];
        state.log.unshift('The discard pile is reshuffled back into the deck.');
      }
      const c = state.deck.pop();
      if (c) player.hand.push(c);
    }
  }

  function beginTurn(state, playerKey) {
    drawCards(state, playerKey, getDrawCount(state, playerKey));
    state.playsLeft = getPlayCount(state, playerKey);
    state.turn = playerKey;
  }

  function enforceHandLimit(state, playerKey) {
    const limit = getHandLimit(state, playerKey);
    if (limit == null) return;
    const player = state.players[playerKey];
    while (player.hand.length > limit) {
      const idx = Math.floor(Math.random() * player.hand.length);
      const discarded = player.hand.splice(idx, 1)[0];
      state.discard.push(discarded);
      state.log.unshift(label(playerKey) + ' discards ' + discarded.name + ' (hand limit).');
    }
  }

  // A play-count boost (Full Throttle, or Bex Orlan's PLAY_BONUS) can ask a
  // player to play more cards than their draw rate supplies, especially a
  // few turns into a stage. If a player's hand empties with plays still
  // owed, there's no move left to make, so treat that exactly like the
  // turn ending, rather than leaving the game waiting on a play that can
  // never come. Depth-capped in case both players are ever simultaneously
  // out of cards (the whole pool exhausted into hands/tableaus).
  function passIfStuck(state, playerKey, otherKey, depth) {
    if (depth >= 6) return;
    if (state.playsLeft > 0 && state.players[playerKey].hand.length === 0) {
      enforceHandLimit(state, playerKey);
      beginTurn(state, otherKey);
      passIfStuck(state, otherKey, playerKey, depth + 1);
    }
  }

  function resolveAction(cardPlayed, state, playerKey) {
    const otherKey = playerKey === 'you' ? 'ai' : 'you';
    const me = state.players[playerKey];
    const other = state.players[otherKey];

    switch (cardPlayed.effect) {
      case 'STEAL_KEEPER': {
        const pool = stealableKeepers(other.keepers);
        if (pool.length > 0) {
          const chosen = bestKeeper(pool);
          const idx = other.keepers.findIndex((k) => k.id === chosen.id);
          const stolen = other.keepers.splice(idx, 1)[0];
          me.keepers.push(stolen);
          state.log.unshift(label(playerKey) + ' snatched ' + stolen.name + ' from ' + label(otherKey) + '!');
        }
        break;
      }
      case 'EXTRA_TURN': {
        state.playsLeft += 1;
        state.log.unshift(label(playerKey) + ' pushes for one more play.');
        break;
      }
      case 'ALL_DISCARD_KEEPER': {
        ['you', 'ai'].forEach((key) => {
          const p = state.players[key];
          if (p.keepers.length === 0) return;
          const hasShield = !state.shieldUsed[key] && getCrewBonus(p.keepers, ABILITY.SHIELD_KEEPER) > 0;
          if (hasShield) {
            state.shieldUsed[key] = true;
            state.log.unshift(label(key) + "'s medic shields a Keeper from the storm.");
            return;
          }
          const idx = Math.floor(Math.random() * p.keepers.length);
          const d = p.keepers.splice(idx, 1)[0];
          state.discard.push(d);
        });
        state.log.unshift('A static storm rattles the line.');
        break;
      }
      case 'REDRAW_HAND': {
        state.discard.push.apply(state.discard, me.hand);
        me.hand = [];
        drawCards(state, playerKey, 5);
        state.log.unshift(label(playerKey) + ' tears up the manifest and draws a fresh hand.');
        break;
      }
      case 'TRADE_KEEPER': {
        const pool = stealableKeepers(other.keepers);
        if (me.keepers.length > 0 && pool.length > 0) {
          const chosen = bestKeeper(pool);
          const oi = other.keepers.findIndex((k) => k.id === chosen.id);
          const mi = Math.floor(Math.random() * me.keepers.length);
          const tmp = me.keepers[mi];
          me.keepers[mi] = other.keepers[oi];
          other.keepers[oi] = tmp;
          state.log.unshift(label(playerKey) + ' and ' + label(otherKey) + ' swap cargo.');
        }
        break;
      }
      case 'DISCARD_RULE': {
        const activeKeys = Object.keys(state.activeRules).filter((k) => state.activeRules[k]);
        if (activeKeys.length > 0) {
          const key = activeKeys[Math.floor(Math.random() * activeKeys.length)];
          state.log.unshift(label(playerKey) + ' scraps the "' + state.activeRules[key].name + '" rule.');
          state.discard.push(state.activeRules[key]);
          state.activeRules[key] = null;
        }
        break;
      }
      case 'DISCARD_GOAL': {
        if (state.activeGoal) {
          state.log.unshift(label(playerKey) + ' reroutes, discards "' + state.activeGoal.name + '".');
          state.discard.push(state.activeGoal);
          state.activeGoal = null;
        }
        break;
      }
      case 'DRAW_TWO': {
        drawCards(state, playerKey, 2);
        state.log.unshift(label(playerKey) + ' draws 2 cards.');
        break;
      }
      case 'DISCARD_RIVAL_HAND': {
        if (other.hand.length > 0) {
          const idx = Math.floor(Math.random() * other.hand.length);
          const discarded = other.hand.splice(idx, 1)[0];
          state.discard.push(discarded);
          state.log.unshift(label(otherKey) + ' loses ' + discarded.name + ' to a jammed signal.');
        }
        break;
      }
      default:
        break;
    }
  }

  function grantAchievement(state, id) {
    if (state.meta.achievements && state.meta.achievements.indexOf(id) !== -1) return;
    const current = state.meta.achievements || [];
    state.meta = Object.assign({}, state.meta, { achievements: current.concat(id) });
    window.VW.storage.saveMeta(state.meta);
    if (state.log) {
      const def = (window.VW.ACHIEVEMENTS || []).find((a) => a.id === id);
      state.log.unshift('Achievement unlocked: ' + (def ? def.name : id) + '.');
    }
  }

  function checkStageOutcome(state) {
    if (!state.activeGoal) return;
    const checker = GOAL_CHECKS[state.activeGoal.checkId];
    if (!checker) return;
    for (const key of ['you', 'ai']) {
      if (checker(state.players[key].keepers)) {
        state.winner = key;
        state.log.unshift(label(key) + ' completed "' + state.activeGoal.name + '" and wins the stage!');

        if (key === 'you') {
          const node = STAGE_MAP.nodes[state.run.nodeId];
          state.run.tableau = state.players.you.keepers.slice();
          const scripBonus = getCrewBonus(state.run.tableau, ABILITY.SCRIP_ON_WIN);
          const reward = window.VW.BASE_SCRIP_PER_STAGE + scripBonus + (node.scripBonus || 0);
          state.scripEarned = reward;
          state.run.scripEarnedThisRun = (state.run.scripEarnedThisRun || 0) + reward;
          state.meta = Object.assign({}, state.meta, { totalScrip: state.meta.totalScrip + reward, unlockedIds: state.meta.unlockedIds.slice() });
          window.VW.storage.saveMeta(state.meta);

          if (state.activeGoal.checkId === 'full_house') grantAchievement(state, 'full-house');
          if (node.harder) {
            state.meta = Object.assign({}, state.meta, { riskyWinsLifetime: (state.meta.riskyWinsLifetime || 0) + 1 });
            window.VW.storage.saveMeta(state.meta);
            if (state.meta.riskyWinsLifetime >= 5) grantAchievement(state, 'high-roller');
          }

          const healBonus = getCrewBonus(state.run.tableau, ABILITY.HEAL_ON_WIN);
          if (healBonus > 0 && state.run.hp < window.VW.STARTING_HP) {
            const before = state.run.hp;
            state.run.hp = Math.min(window.VW.STARTING_HP, state.run.hp + healBonus);
            state.log.unshift('Sakura Junction patches you up: +' + (state.run.hp - before) + ' HP.');
          }

          if (node.isFinal) {
            state.stageOutcome = 'run-complete';
            const specialIds = ['crew-bub', 'vessel-djcool', 'loc-sakura'];
            const hasAllSpecial = specialIds.every((id) => state.run.tableau.some((c) => c.id === id));
            if (hasAllSpecial) {
              state.secretEnding = true;
              state.homecomingLine = window.VW.SECRET_HOMECOMING_LINE;
              grantAchievement(state, 'whole-crew');
            } else {
              state.homecomingLine = window.VW.HOMECOMING_LINES[Math.floor(Math.random() * window.VW.HOMECOMING_LINES.length)];
            }
            state.log.unshift('The whole run is clear. The Last Junction is behind you.');

            grantAchievement(state, 'first-run');
            if (!state.run.everLostStage) grantAchievement(state, 'clean-sweep');
            const totalUnlockable = window.VW.STARTER_UNLOCKED.length + window.VW.UNLOCKABLE.length;
            if (state.meta.unlockedIds.length >= totalUnlockable) grantAchievement(state, 'fully-loaded');
          } else {
            state.stageOutcome = 'cleared';
          }
        } else {
          state.run.everLostStage = true;
          const hasHpShield = !state.run.hpShieldUsed && getCrewBonus(state.players.you.keepers, ABILITY.HP_SHIELD) > 0;
          if (hasHpShield) {
            state.run.hpShieldUsed = true;
            state.log.unshift('Ironclad Engine Car absorbs the loss. No HP lost.');
          } else {
            state.run.hp -= 1;
          }
          if (state.run.hp <= 0) {
            state.stageOutcome = 'run-over';
            state.log.unshift('Out of runs. The Combine holds the line, for now.');
          } else {
            state.stageOutcome = 'hp-lost';
          }
        }
        break;
      }
    }
  }

  function applyCard(state, playerKey, cardId) {
    const player = state.players[playerKey];
    const idx = player.hand.findIndex((c) => c.id === cardId);
    if (idx === -1) return;
    const played = player.hand.splice(idx, 1)[0];
    state.log.unshift(label(playerKey) + ' played ' + played.name + '.');

    if (KEEPER_TYPES.includes(played.type)) {
      player.keepers.push(played);
      if (played.ability && played.ability.type === ABILITY.ON_PLAY_DRAW) {
        const n = played.ability.value;
        drawCards(state, playerKey, n);
        state.log.unshift(label(playerKey) + ' draws ' + n + ' extra card' + (n === 1 ? '' : 's') + ', ' + played.name + "'s doing.");
      }
    } else if (played.type === 'rule') {
      const slot = played.effect;
      if (state.activeRules[slot]) state.discard.push(state.activeRules[slot]);
      state.activeRules[slot] = played;
    } else if (played.type === 'goal') {
      if (state.activeGoal) state.discard.push(state.activeGoal);
      state.activeGoal = played;
    } else if (played.type === 'action') {
      const otherKey = playerKey === 'you' ? 'ai' : 'you';
      const isTargetable = played.effect === 'STEAL_KEEPER' || played.effect === 'TRADE_KEEPER';
      const hasTarget = isTargetable && stealableKeepers(state.players[otherKey].keepers).length > 0;
      if (isTargetable && playerKey === 'you' && hasTarget) {
        // Deferred: wait for a CHOOSE_TARGET action instead of resolving
        // with a random pick. The card isn't discarded until it resolves.
        state.pendingTarget = { effect: played.effect, card: played };
      } else {
        resolveAction(played, state, playerKey);
        state.discard.push(played);
      }
    }

    checkStageOutcome(state);
  }

  function resolvePendingTarget(state, targetCardId) {
    const pending = state.pendingTarget;
    if (!pending) return;
    const played = pending.card;
    const me = state.players.you;
    const other = state.players.ai;
    const targetIdx = other.keepers.findIndex((k) => k.id === targetCardId);

    if (targetIdx !== -1) {
      if (pending.effect === 'STEAL_KEEPER') {
        const stolen = other.keepers.splice(targetIdx, 1)[0];
        me.keepers.push(stolen);
        state.log.unshift('You snatched ' + stolen.name + ' from the rival crew!');
      } else if (pending.effect === 'TRADE_KEEPER' && me.keepers.length > 0) {
        const mi = Math.floor(Math.random() * me.keepers.length);
        const tmp = me.keepers[mi];
        me.keepers[mi] = other.keepers[targetIdx];
        other.keepers[targetIdx] = tmp;
        state.log.unshift('You swap cargo with the rival crew.');
      }
    }

    state.discard.push(played);
    state.pendingTarget = null;
    checkStageOutcome(state);
  }

  // Picks the AI's next play: an immediate win takes priority over
  // anything else, otherwise every playable card is scored by scoreAiCard
  // and the best (ties broken at random) wins, rather than just favoring
  // whichever card type comes first.
  function chooseAiCard(hand, myKeepers, rivalKeepers, rivalHand, activeGoal, activeRules) {
    if (hand.length === 0) return null;
    const winningGoal = hand.find((c) => c.type === 'goal' && GOAL_CHECKS[c.checkId] && GOAL_CHECKS[c.checkId](myKeepers));
    if (winningGoal) return winningGoal;

    const ctx = { hand: hand, myKeepers: myKeepers, rivalKeepers: rivalKeepers, rivalHand: rivalHand, activeGoal: activeGoal, activeRules: activeRules };
    let best = [hand[0]];
    let bestScore = scoreAiCard(hand[0], ctx);
    for (let i = 1; i < hand.length; i++) {
      const s = scoreAiCard(hand[i], ctx);
      if (s > bestScore) {
        best = [hand[i]];
        bestScore = s;
      } else if (s === bestScore) {
        best.push(hand[i]);
      }
    }
    return best[Math.floor(Math.random() * best.length)];
  }

  function dealStage(meta, run) {
    const stageDef = STAGE_MAP.nodes[run.nodeId];
    const tableauIds = run.tableau.map((c) => c.id);
    const deck = buildStageDeck(meta, tableauIds);

    const debuff = getCrewBonus(run.tableau, ABILITY.RIVAL_HAND_DEBUFF);
    const rivalHand = Math.max(2, stageDef.rivalHand - debuff);

    const you = { hand: deck.splice(0, 3), keepers: run.tableau.slice() };
    const ai = { hand: deck.splice(0, rivalHand), keepers: [] };

    for (let i = 0; i < (stageDef.playerHeadStart || 0); i++) {
      const idx = you.hand.findIndex((c) => KEEPER_TYPES.includes(c.type));
      if (idx !== -1) you.keepers.push(you.hand.splice(idx, 1)[0]);
      else {
        // Hand didn't happen to contain a Keeper, so pull one straight from
        // the deck instead, so the head start is reliable rather than
        // dependent on the initial 3-card draw.
        const deckIdx = deck.findIndex((c) => KEEPER_TYPES.includes(c.type));
        if (deckIdx !== -1) you.keepers.push(deck.splice(deckIdx, 1)[0]);
      }
    }

    for (let i = 0; i < stageDef.rivalHeadStart; i++) {
      const idx = ai.hand.findIndex((c) => KEEPER_TYPES.includes(c.type));
      if (idx !== -1) {
        ai.keepers.push(ai.hand.splice(idx, 1)[0]);
      } else {
        const deckIdx = deck.findIndex((c) => KEEPER_TYPES.includes(c.type));
        if (deckIdx !== -1) ai.keepers.push(deck.splice(deckIdx, 1)[0]);
      }
    }

    const state = {
      phase: 'playing',
      meta: meta,
      run: run,
      players: { you: you, ai: ai },
      deck: deck,
      discard: [],
      activeRules: { HAND_LIMIT: null, PLAY_LIMIT: null, DRAW_COUNT: null },
      activeGoal: null,
      turn: 'you',
      playsLeft: 1,
      shieldUsed: { you: false, ai: false },
      pendingTarget: null,
      winner: null,
      stageOutcome: null,
      scripEarned: 0,
      homecomingLine: null,
      secretEnding: false,
      log: ['Arriving at ' + stageDef.name + ', stage ' + run.depth + ' of ' + STAGE_MAP.totalDepth + '.'],
    };
    beginTurn(state, 'you');
    return state;
  }

  function startRun() {
    const meta = window.VW.storage.loadMeta();
    const run = { nodeId: STAGE_MAP.start, depth: 1, hp: window.VW.STARTING_HP, tableau: [], hpShieldUsed: false, everLostStage: false, scripEarnedThisRun: 0 };
    return dealStage(meta, run);
  }

  function continueStage(state, nextNodeId) {
    const currentNode = STAGE_MAP.nodes[state.run.nodeId];
    if (!currentNode || currentNode.next.indexOf(nextNodeId) === -1) return state;
    const nextRun = {
      nodeId: nextNodeId,
      depth: state.run.depth + 1,
      hp: state.run.hp,
      tableau: state.run.tableau,
      hpShieldUsed: state.run.hpShieldUsed,
      everLostStage: state.run.everLostStage,
      scripEarnedThisRun: state.run.scripEarnedThisRun,
    };
    return dealStage(state.meta, nextRun);
  }

  function retryStage(state) {
    return dealStage(state.meta, state.run);
  }

  function unlockCard(state, cardId) {
    const entry = window.VW.UNLOCKABLE.find((u) => u.id === cardId);
    if (!entry) return state;
    if (state.meta.unlockedIds.indexOf(cardId) !== -1) return state;
    if (state.meta.totalScrip < entry.cost) return state;
    const nextMeta = Object.assign({}, state.meta, {
      totalScrip: state.meta.totalScrip - entry.cost,
      unlockedIds: state.meta.unlockedIds.concat(cardId),
    });
    window.VW.storage.saveMeta(nextMeta);
    const nextState = Object.assign({}, state, { meta: nextMeta });
    const totalUnlockable = window.VW.STARTER_UNLOCKED.length + window.VW.UNLOCKABLE.length;
    if (nextMeta.unlockedIds.length >= totalUnlockable) grantAchievement(nextState, 'fully-loaded');
    return nextState;
  }

  // Deep-clones state via JSON (state only ever holds plain data: strings,
  // numbers, arrays, and objects, so this is a safe, dependency-free clone).
  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  // Shared by PLAY_CARD and CHOOSE_TARGET: ends "you"'s turn once plays are
  // spent or the hand runs dry, but not while a target choice is still
  // pending, since the play that triggered it hasn't actually finished yet.
  function finishYourPlay(next) {
    if (next.winner || next.pendingTarget) return;
    if (next.playsLeft <= 0 || next.players.you.hand.length === 0) {
      enforceHandLimit(next, 'you');
      beginTurn(next, 'ai');
      passIfStuck(next, 'ai', 'you', 0);
    }
  }

  function reduce(state, action) {
    switch (action.type) {
      case 'START_RUN':
        return startRun();

      case 'PLAY_CARD': {
        if (state.phase !== 'playing' || state.turn !== 'you' || state.winner || state.playsLeft <= 0 || state.pendingTarget) return state;
        if (!state.players.you.hand.some((c) => c.id === action.cardId)) return state;
        const next = cloneState(state);
        next.playsLeft -= 1;
        applyCard(next, 'you', action.cardId);
        finishYourPlay(next);
        return next;
      }

      case 'CHOOSE_TARGET': {
        if (state.phase !== 'playing' || !state.pendingTarget) return state;
        const next = cloneState(state);
        resolvePendingTarget(next, action.targetCardId);
        finishYourPlay(next);
        return next;
      }

      case 'AI_FULL_TURN': {
        if (state.phase !== 'playing' || state.turn !== 'ai' || state.winner) return state;
        const next = cloneState(state);
        let guard = 0;
        while (next.playsLeft > 0 && next.players.ai.hand.length > 0 && guard < 25) {
          guard += 1;
          const chosen = chooseAiCard(next.players.ai.hand, next.players.ai.keepers, next.players.you.keepers, next.players.you.hand, next.activeGoal, next.activeRules);
          if (!chosen) break;
          next.playsLeft -= 1;
          applyCard(next, 'ai', chosen.id);
          if (next.winner) return next;
        }
        enforceHandLimit(next, 'ai');
        beginTurn(next, 'you');
        passIfStuck(next, 'you', 'ai', 0);
        return next;
      }

      case 'CONTINUE_STAGE':
        if (state.stageOutcome !== 'cleared') return state;
        return continueStage(state, action.nextNodeId);

      case 'RETRY_STAGE':
        if (state.stageOutcome !== 'hp-lost') return state;
        return retryStage(state);

      case 'GO_TO_HANGAR':
        return { phase: 'hangar', meta: window.VW.storage.loadMeta() };

      case 'BACK_TO_MENU':
        return { phase: 'menu', meta: window.VW.storage.loadMeta() };

      case 'UNLOCK_CARD':
        if (state.phase !== 'hangar') return state;
        return unlockCard(state, action.cardId);

      default:
        return state;
    }
  }

  window.VW.engine = {
    createMenuState,
    reduce,
    getUnlockedPool,
    stealableKeepers,
  };
})();
