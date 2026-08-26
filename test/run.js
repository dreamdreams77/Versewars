// Verse Wars: regression tests.
//
// Plain Node, zero dependencies, no test framework: run with `node test/run.js`.
// Loads cards.js/storage.js/engine.js/train.js the same way index.html does
// (they all attach to a shared VW object) against a minimal `window` stub,
// then exercises the pure game-logic layer directly, no browser needed.
// main.js is intentionally not loaded here: it touches the DOM at load time
// (getElementById, an immediate render()), so it's outside what a plain-Node
// script can exercise. Everything it calls through to (engine.reduce and the
// data in cards.js) is covered here instead.

global.window = { VW: {} };
global.VW = global.window.VW;

require('../js/cards.js');
require('../js/storage.js');
require('../js/engine.js');
require('../js/train.js');

const VW = window.VW;

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.error('FAIL: ' + msg);
  }
}

function section(name, fn) {
  console.log('--- ' + name + ' ---');
  fn();
}

section('card id integrity', () => {
  const all = [].concat(VW.RULE_CARDS, VW.ACTION_CARDS, VW.GOAL_CARDS, VW.ALL_KEEPER_CARDS);
  const seen = {};
  all.forEach((c) => {
    assert(!seen[c.id], 'duplicate card id: ' + c.id);
    seen[c.id] = true;
  });
  assert(Object.keys(seen).length === all.length, 'every card id is unique (' + all.length + ' cards)');
});

section('goal check / requirement parity', () => {
  VW.GOAL_CARDS.forEach((g) => {
    assert(typeof VW.GOAL_CHECKS[g.checkId] === 'function', 'GOAL_CHECKS has an entry for ' + g.checkId);
    assert(!!VW.GOAL_REQUIREMENTS[g.checkId], 'GOAL_REQUIREMENTS has an entry for ' + g.checkId);
  });
});

section('unlockable roster integrity', () => {
  const allKeeperIds = {};
  VW.ALL_KEEPER_CARDS.forEach((c) => {
    allKeeperIds[c.id] = true;
  });
  VW.STARTER_UNLOCKED.forEach((id) => assert(allKeeperIds[id], 'STARTER_UNLOCKED references a real card: ' + id));
  VW.UNLOCKABLE.forEach((u) => assert(allKeeperIds[u.id], 'UNLOCKABLE references a real card: ' + u.id));

  const covered = {};
  VW.STARTER_UNLOCKED.forEach((id) => {
    covered[id] = true;
  });
  VW.UNLOCKABLE.forEach((u) => {
    covered[u.id] = true;
  });
  VW.ALL_KEEPER_CARDS.forEach((c) => assert(covered[c.id], 'every keeper is reachable via STARTER_UNLOCKED or UNLOCKABLE: ' + c.id));
});

section('stage map graph integrity', () => {
  const M = VW.STAGE_MAP;
  const ids = Object.keys(M.nodes);

  ids.forEach((id) => {
    const n = M.nodes[id];
    assert(n.id === id, 'node key matches its own id field: ' + id);
    n.next.forEach((nx) => assert(!!M.nodes[nx], id + ' -> ' + nx + ' resolves to a real node'));
  });

  const seen = new Set();
  (function walk(id) {
    seen.add(id);
    M.nodes[id].next.forEach(walk);
  })(M.start);
  ids.forEach((id) => assert(seen.has(id), id + ' is reachable from the start node'));

  const depths = {};
  (function depthOf(id, d) {
    depths[id] = depths[id] ? Math.min(depths[id], d) : d;
    M.nodes[id].next.forEach((nx) => depthOf(nx, d + 1));
  })(M.start, 1);
  ids
    .filter((id) => M.nodes[id].isFinal)
    .forEach((id) => assert(depths[id] === M.totalDepth, id + ' (isFinal) sits at exactly totalDepth'));
});

section('engine: starting a run deals a valid opening stage', () => {
  const state = VW.engine.reduce(VW.engine.createMenuState(), { type: 'START_RUN' });
  assert(state.phase === 'playing', 'phase is playing');
  assert(state.turn === 'you', 'the opening turn is yours');
  assert(state.players.you.hand.length > 0, 'you were dealt a hand');
  assert(state.run.depth === 1, 'run starts at depth 1');
  assert(state.run.hp === VW.STARTING_HP, 'run starts at full HP');
});

section('engine: playing a Keeper moves it from hand to tableau', () => {
  let state = VW.engine.reduce(VW.engine.createMenuState(), { type: 'START_RUN' });
  const keeperCard = state.players.you.hand.find((c) => VW.KEEPER_TYPES.includes(c.type));
  if (!keeperCard) {
    console.log('  (skipped: no Keeper in the opening hand this run)');
    return;
  }
  const before = state.players.you.keepers.length;
  state = VW.engine.reduce(state, { type: 'PLAY_CARD', cardId: keeperCard.id });
  assert(state.players.you.keepers.length === before + 1, 'tableau grew by exactly one');
  assert(!state.players.you.hand.some((c) => c.id === keeperCard.id), 'the played card left the hand');
});

section('engine: unlocking a card in the Hangar spends the right Scrip', () => {
  const entry = VW.UNLOCKABLE[0];
  const meta = Object.assign({}, VW.storage.defaultMeta(), { totalScrip: entry.cost + 5 });
  const before = { phase: 'hangar', meta: meta };
  const after = VW.engine.reduce(before, { type: 'UNLOCK_CARD', cardId: entry.id });
  assert(after.meta.totalScrip === before.meta.totalScrip - entry.cost, 'Scrip was deducted by the unlock cost');
  assert(after.meta.unlockedIds.indexOf(entry.id) !== -1, 'the card is now in unlockedIds');

  const broke = { phase: 'hangar', meta: Object.assign({}, VW.storage.defaultMeta(), { totalScrip: 0 }) };
  const stillBroke = VW.engine.reduce(broke, { type: 'UNLOCK_CARD', cardId: entry.id });
  assert(stillBroke.meta.unlockedIds.indexOf(entry.id) === -1, 'unlocking is refused without enough Scrip');
});

section('engine: simulated full runs never throw, stall, or exceed the step budget', () => {
  const RUNS = 25;
  for (let i = 0; i < RUNS; i++) {
    let state = VW.engine.reduce(VW.engine.createMenuState(), { type: 'START_RUN' });
    let guard = 0;
    let stopped = false;
    while (state.phase === 'playing' && guard < 400 && !stopped) {
      guard++;
      if (state.pendingTarget) {
        const targets = VW.engine.stealableKeepers(state.players.ai.keepers);
        assert(targets.length > 0, 'run ' + i + ': a pending target always has at least one legal choice');
        state = VW.engine.reduce(state, { type: 'CHOOSE_TARGET', targetCardId: targets[0].id });
      } else if (state.stageOutcome === 'cleared') {
        const node = VW.STAGE_MAP.nodes[state.run.nodeId];
        state = VW.engine.reduce(state, { type: 'CONTINUE_STAGE', nextNodeId: node.next[0] });
      } else if (state.stageOutcome === 'hp-lost') {
        state = VW.engine.reduce(state, { type: 'RETRY_STAGE' });
      } else if (state.stageOutcome === 'run-complete' || state.stageOutcome === 'run-over') {
        stopped = true;
      } else if (state.turn === 'you') {
        const card = state.players.you.hand[0];
        if (!card) {
          // The whole card pool can, in principle, be exhausted into
          // hands/tableaus with nobody left to draw or play (an extreme
          // edge case). The one thing the engine guarantees here is that
          // it never leaves a play owed with nothing to play it with.
          assert(state.playsLeft <= 0, 'run ' + i + ': an empty hand on your turn never still owes a play');
          stopped = true;
        } else {
          state = VW.engine.reduce(state, { type: 'PLAY_CARD', cardId: card.id });
        }
      } else {
        state = VW.engine.reduce(state, { type: 'AI_FULL_TURN' });
      }
    }
    assert(guard < 400, 'run ' + i + ' finished within the step budget (no infinite loop)');
  }
});

console.log('\n' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail > 0 ? 1 : 0);
