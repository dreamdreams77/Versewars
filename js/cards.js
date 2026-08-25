// Verse Wars: card & progression data
//
// An original space-western setting: the Hyperrail, a network of ancient
// maglev lines connecting star systems. Independent crews run modified
// bullet trains up and down the line, staying a few cars ahead of the
// Combine (the central authority) and whatever waits past the Last Junction.
//
// No build step here. This file just attaches everything to a shared
// `VW` (Verse Wars) global so the other plain <script> tags can use it.

window.VW = window.VW || {};

(function () {
  const CARD_TYPES = {
    CREW: 'crew',
    VESSEL: 'vessel',
    LOCATION: 'location',
    ARTIFACT: 'artifact',
    RULE: 'rule',
    ACTION: 'action',
    GOAL: 'goal',
  };

  // Keepers are cards that stay in front of a player once played, and are
  // what Goal cards check against.
  const KEEPER_TYPES = [CARD_TYPES.CREW, CARD_TYPES.VESSEL, CARD_TYPES.LOCATION, CARD_TYPES.ARTIFACT];

  // Which Keeper categories are gated behind meta-progression unlocks.
  const UNLOCKABLE_TYPES = KEEPER_TYPES;

  const TYPE_META = {
    [CARD_TYPES.CREW]: { label: 'Crew', accent: '#c99a4b' },
    [CARD_TYPES.VESSEL]: { label: 'Vessel', accent: '#5b7a99' },
    [CARD_TYPES.LOCATION]: { label: 'Location', accent: '#4f9d6e' },
    [CARD_TYPES.ARTIFACT]: { label: 'Artifact', accent: '#8b6a9e' },
    [CARD_TYPES.RULE]: { label: 'Rule', accent: '#7d8797' },
    [CARD_TYPES.ACTION]: { label: 'Action', accent: '#d1453d' },
    [CARD_TYPES.GOAL]: { label: 'Goal', accent: '#e8b84b' },
  };

  // Ability types a Keeper card can carry. Each is a small, generic hook the
  // engine checks at a specific moment, rather than one-off bespoke code
  // per card:
  //   HAND_LIMIT_BONUS / DRAW_BONUS / PLAY_BONUS: passive, while in a
  //     player's tableau, adds `value` to that stat for that player.
  //   SCRIP_ON_WIN: when this player wins a stage, +`value` bonus Scrip.
  //   SHIELD_KEEPER: once per stage attempt, protects this player's next
  //     Keeper that would otherwise be discarded by an Action.
  //   ON_PLAY_DRAW: the moment this card is played, draw `value` cards.
  //   HP_SHIELD: once per RUN, prevents the HP loss from losing a
  //     stage (the stage is still retried, you just don't spend the HP).
  //   STEAL_IMMUNE: this specific card can never be taken by an
  //     opponent's Boarding Party.
  //   RIVAL_HAND_DEBUFF: the rival's starting hand at every stage is
  //     `value` smaller (never below a small floor).
  //   HEAL_ON_WIN: when this player wins a stage, restore `value` HP
  //     (capped at the run's starting HP).
  const ABILITY = {
    HAND_LIMIT_BONUS: 'HAND_LIMIT_BONUS',
    DRAW_BONUS: 'DRAW_BONUS',
    PLAY_BONUS: 'PLAY_BONUS',
    SCRIP_ON_WIN: 'SCRIP_ON_WIN',
    SHIELD_KEEPER: 'SHIELD_KEEPER',
    ON_PLAY_DRAW: 'ON_PLAY_DRAW',
    HP_SHIELD: 'HP_SHIELD',
    STEAL_IMMUNE: 'STEAL_IMMUNE',
    RIVAL_HAND_DEBUFF: 'RIVAL_HAND_DEBUFF',
    HEAL_ON_WIN: 'HEAL_ON_WIN',
  };

  const ABILITY_TEXT = {
    HAND_LIMIT_BONUS: (v) => 'Passive: +' + v + ' hand limit while in your tableau.',
    DRAW_BONUS: (v) => 'Passive: +' + v + ' card drawn each of your turns.',
    PLAY_BONUS: (v) => 'Passive: +' + v + ' play each of your turns.',
    SCRIP_ON_WIN: (v) => 'Passive: +' + v + ' bonus Scrip when you win a stage.',
    SHIELD_KEEPER: () => 'Passive: protects one Keeper from the next forced discard, once per stage.',
    ON_PLAY_DRAW: (v) => 'On play: draw ' + v + ' card' + (v === 1 ? '' : 's') + ' immediately.',
    HP_SHIELD: () => 'Passive: prevents HP loss from your next lost stage, once per run.',
    STEAL_IMMUNE: () => "Passive: can't be taken by the rival's Boarding Party.",
    RIVAL_HAND_DEBUFF: (v) => 'Passive: rival starts each stage with ' + v + ' fewer cards.',
    HEAL_ON_WIN: (v) => 'Passive: +' + v + ' HP when you win a stage.',
  };

  function card(def) {
    return Object.assign({}, def);
  }

  const CREW_CARDS = [
    card({
      id: 'crew-kade',
      type: CARD_TYPES.CREW,
      name: 'Capt. Rhys Kade',
      flavor: 'Runs the train like family. Because it is.',
      ability: { type: ABILITY.SCRIP_ON_WIN, value: 2 },
    }),
    card({
      id: 'crew-vance',
      type: CARD_TYPES.CREW,
      name: 'Toli Vance',
      flavor: 'Can coax another hundred miles out of a dying engine.',
      ability: { type: ABILITY.DRAW_BONUS, value: 1 },
    }),
    card({
      id: 'crew-renn',
      type: CARD_TYPES.CREW,
      name: 'Dr. Sable Renn',
      flavor: 'Stitches up crew and secrets in equal measure.',
      ability: { type: ABILITY.SHIELD_KEEPER, value: 1 },
    }),
    card({
      id: 'crew-orlan',
      type: CARD_TYPES.CREW,
      name: 'Bex Orlan',
      flavor: 'Steady hands. Faster trigger.',
      ability: { type: ABILITY.PLAY_BONUS, value: 1 },
    }),
    card({
      id: 'crew-quon',
      type: CARD_TYPES.CREW,
      name: 'Iris Quon',
      flavor: 'Knows every bend in the Hyperrail by heart.',
      ability: { type: ABILITY.HAND_LIMIT_BONUS, value: 1 },
    }),
    card({
      id: 'crew-bub',
      type: CARD_TYPES.CREW,
      name: 'Bub',
      flavor: 'Forgets where the train\u2019s parked. Never forgets a punchline, a save point, or which glowing orb goes in which slot. Three chapters into something with a talking skull or a cursed pirate, and will not be rushed.',
      ability: { type: ABILITY.ON_PLAY_DRAW, value: 1 },
    }),
  ];

  const VESSEL_CARDS = [
    card({
      id: 'vessel-comet',
      type: CARD_TYPES.VESSEL,
      name: 'The Midnight Comet',
      flavor: 'Home. Held together by luck and Toli.',
      ability: { type: ABILITY.SCRIP_ON_WIN, value: 1 },
    }),
    card({
      id: 'vessel-cargo',
      type: CARD_TYPES.VESSEL,
      name: 'Cargo Hold Car',
      flavor: 'Whatever fits, ships. No questions asked.',
      ability: { type: ABILITY.HAND_LIMIT_BONUS, value: 1 },
    }),
    card({
      id: 'vessel-ironclad',
      type: CARD_TYPES.VESSEL,
      name: 'Ironclad Engine Car',
      flavor: 'Twice the speed. Half the subtlety.',
      ability: { type: ABILITY.HP_SHIELD, value: 1 },
    }),
    card({
      id: 'vessel-stealth',
      type: CARD_TYPES.VESSEL,
      name: 'Stealth Plating Car',
      flavor: "The Combine can't ping what it can't see.",
      ability: { type: ABILITY.STEAL_IMMUNE, value: 1 },
    }),
    card({
      id: 'vessel-djcool',
      type: CARD_TYPES.VESSEL,
      name: 'DJ Cool',
      flavor: 'Turned the aft car into a sound booth somewhere past Nine Rivers. Some crews on the line still call it the Fairy, the way it slips off long-range scan.',
      ability: { type: ABILITY.RIVAL_HAND_DEBUFF, value: 1 },
    }),
  ];

  const LOCATION_CARDS = [
    card({
      id: 'loc-dustfall',
      type: CARD_TYPES.LOCATION,
      name: 'Dustfall Station',
      flavor: 'Where the rail meets the desert, and the law gets thin.',
      ability: { type: ABILITY.SCRIP_ON_WIN, value: 1 },
    }),
    card({
      id: 'loc-glass',
      type: CARD_TYPES.LOCATION,
      name: 'The Glass Concourse',
      flavor: 'A station built entirely from salvaged viewports.',
      ability: { type: ABILITY.DRAW_BONUS, value: 1 },
    }),
    card({
      id: 'loc-ninerivers',
      type: CARD_TYPES.LOCATION,
      name: 'Nine Rivers Yard',
      flavor: 'Nine rail lines. One very confused signal tower.',
      ability: { type: ABILITY.PLAY_BONUS, value: 1 },
    }),
    card({
      id: 'loc-lastjunction',
      type: CARD_TYPES.LOCATION,
      name: 'The Last Junction',
      flavor: 'Past here, the maps just say good luck.',
      ability: { type: ABILITY.HAND_LIMIT_BONUS, value: 2 },
    }),
    card({
      id: 'loc-sakura',
      type: CARD_TYPES.LOCATION,
      name: 'Sakura Junction',
      flavor: "Neon signs, steam off the noodle stalls, and a bar that pours a proper gin and tonic. Nobody's ever in a hurry to leave.",
      ability: { type: ABILITY.HEAL_ON_WIN, value: 1 },
    }),
  ];

  const ARTIFACT_CARDS = [
    card({
      id: 'art-sundial',
      type: CARD_TYPES.ARTIFACT,
      name: 'The Sundial Core',
      flavor: 'Older than the rail. Warmer than it should be.',
      ability: { type: ABILITY.DRAW_BONUS, value: 1 },
    }),
    card({
      id: 'art-manifest',
      type: CARD_TYPES.ARTIFACT,
      name: 'A Forgotten Manifest',
      flavor: 'Lists cargo that was never officially shipped.',
      ability: { type: ABILITY.SHIELD_KEEPER, value: 1 },
    }),
    card({
      id: 'art-signal',
      type: CARD_TYPES.ARTIFACT,
      name: 'The Quiet Signal',
      flavor: 'Broadcasts nothing. Everyone still listens.',
      ability: { type: ABILITY.SCRIP_ON_WIN, value: 3 },
    }),
    card({
      id: 'art-savepoint',
      type: CARD_TYPES.ARTIFACT,
      name: 'The Last Save Point',
      flavor: "Doesn't do anything. Everyone still stops here before the next stretch, just in case.",
      ability: { type: ABILITY.HP_SHIELD, value: 1 },
    }),
  ];

  const RULE_CARDS = [
    card({ id: 'rule-tight', type: CARD_TYPES.RULE, name: 'Tight Quarters', effect: 'HAND_LIMIT', value: 3, description: 'Hand limit is 3 cards.' }),
    card({ id: 'rule-open', type: CARD_TYPES.RULE, name: 'Open Rails', effect: 'HAND_LIMIT', value: null, description: 'No hand limit.' }),
    card({ id: 'rule-seams', type: CARD_TYPES.RULE, name: 'Bursting Seams', effect: 'HAND_LIMIT', value: 5, description: 'Hand limit is 5 cards.' }),
    card({ id: 'rule-throttle', type: CARD_TYPES.RULE, name: 'Full Throttle', effect: 'PLAY_LIMIT', value: 2, description: 'Play 2 cards per turn.' }),
    card({ id: 'rule-singlefile', type: CARD_TYPES.RULE, name: 'Single File', effect: 'PLAY_LIMIT', value: 1, description: 'Play only 1 card per turn.' }),
    card({ id: 'rule-doubletime', type: CARD_TYPES.RULE, name: 'Double Time', effect: 'PLAY_LIMIT', value: 3, description: 'Play 3 cards per turn.' }),
    card({ id: 'rule-reserves', type: CARD_TYPES.RULE, name: 'Deep Reserves', effect: 'DRAW_COUNT', value: 3, description: 'Draw 3 cards per turn.' }),
    card({ id: 'rule-luck', type: CARD_TYPES.RULE, name: "Runner's Luck", effect: 'DRAW_COUNT', value: 2, description: 'Draw 2 cards per turn.' }),
    card({ id: 'rule-overdrive', type: CARD_TYPES.RULE, name: 'Overdrive', effect: 'DRAW_COUNT', value: 4, description: 'Draw 4 cards per turn.' }),
  ];

  const ACTION_CARDS = [
    card({ id: 'action-boarding', type: CARD_TYPES.ACTION, name: 'Boarding Party', effect: 'STEAL_KEEPER', description: 'Choose a Keeper to take from your rival.', flavor: 'Trash talk optional. Recommended.' }),
    card({ id: 'action-burn', type: CARD_TYPES.ACTION, name: 'Full Burn', effect: 'EXTRA_TURN', description: 'Gain one extra play this turn.' }),
    card({ id: 'action-static', type: CARD_TYPES.ACTION, name: 'Static Storm', effect: 'ALL_DISCARD_KEEPER', description: 'Everyone discards a random Keeper.' }),
    card({ id: 'action-fresh', type: CARD_TYPES.ACTION, name: 'Fresh Manifest', effect: 'REDRAW_HAND', description: 'Discard your hand, then draw 5 new cards.' }),
    card({ id: 'action-swap', type: CARD_TYPES.ACTION, name: 'Swap Rails', effect: 'TRADE_KEEPER', description: 'Choose a rival Keeper to swap for one of yours.' }),
    card({ id: 'action-sabotage', type: CARD_TYPES.ACTION, name: 'Sabotage', effect: 'DISCARD_RULE', description: 'Discard one active Rule at random.' }),
    card({ id: 'action-reroute', type: CARD_TYPES.ACTION, name: 'Reroute', effect: 'DISCARD_GOAL', description: 'Discard the active Goal.' }),
    card({ id: 'action-doubledown', type: CARD_TYPES.ACTION, name: 'Double Down', effect: 'DRAW_TWO', description: 'Draw 2 cards immediately.' }),
    card({ id: 'action-signaljam', type: CARD_TYPES.ACTION, name: 'Signal Jam', effect: 'DISCARD_RIVAL_HAND', description: "Rival discards a random card from hand." }),
  ];

  const GOAL_CARDS = [
    card({ id: 'goal-fullcrew', type: CARD_TYPES.GOAL, name: 'Full Crew', checkId: 'full_crew', description: 'Control 2 Crew + 1 Vessel to win.' }),
    card({ id: 'goal-frontierking', type: CARD_TYPES.GOAL, name: 'Frontier King', checkId: 'frontier_king', description: 'Control 2 Locations to win.' }),
    card({ id: 'goal-collector', type: CARD_TYPES.GOAL, name: 'Collector', checkId: 'collector', description: 'Control 1 Artifact + 1 Crew + 1 Vessel to win.' }),
    card({ id: 'goal-longrun', type: CARD_TYPES.GOAL, name: 'The Long Run', checkId: 'long_run', description: 'Control 3 Vessels to win.' }),
    card({ id: 'goal-ghostwire', type: CARD_TYPES.GOAL, name: 'Ghost in the Wire', checkId: 'ghost_wire', description: 'Control 1 Artifact + 2 Locations to win.' }),
    card({ id: 'goal-salvage', type: CARD_TYPES.GOAL, name: 'Salvage Run', checkId: 'salvage_run', description: 'Control 2 Vessels + 1 Artifact to win.' }),
    card({ id: 'goal-fullhouse', type: CARD_TYPES.GOAL, name: 'Full House', checkId: 'full_house', description: 'Control 1 Crew + 1 Vessel + 1 Location + 1 Artifact to win.' }),
  ];

  function countByType(keepers, type) {
    return keepers.filter((k) => k.type === type).length;
  }

  const GOAL_CHECKS = {
    full_crew: (k) => countByType(k, CARD_TYPES.CREW) >= 2 && countByType(k, CARD_TYPES.VESSEL) >= 1,
    frontier_king: (k) => countByType(k, CARD_TYPES.LOCATION) >= 2,
    collector: (k) => countByType(k, CARD_TYPES.ARTIFACT) >= 1 && countByType(k, CARD_TYPES.CREW) >= 1 && countByType(k, CARD_TYPES.VESSEL) >= 1,
    long_run: (k) => countByType(k, CARD_TYPES.VESSEL) >= 3,
    ghost_wire: (k) => countByType(k, CARD_TYPES.ARTIFACT) >= 1 && countByType(k, CARD_TYPES.LOCATION) >= 2,
    salvage_run: (k) => countByType(k, CARD_TYPES.VESSEL) >= 2 && countByType(k, CARD_TYPES.ARTIFACT) >= 1,
    full_house: (k) =>
      countByType(k, CARD_TYPES.CREW) >= 1 &&
      countByType(k, CARD_TYPES.VESSEL) >= 1 &&
      countByType(k, CARD_TYPES.LOCATION) >= 1 &&
      countByType(k, CARD_TYPES.ARTIFACT) >= 1,
  };

  // Shown on the run-complete overlay: a short, random "coming home" beat,
  // followed in the UI by a separate, quieter note. Only ever surfaces when
  // the whole run (all stages) is won, not per-stage.
  const HOMECOMING_LINES = [
    "Somewhere back at the yard, there's a titanium ring waiting, and someone who isn't going anywhere.",
    'Home stretch. Trade the cold rail wind for a cozy jacket and the porch light left on.',
    "You made it. Someone's already got the gin and tonic poured, ice cracking in the glass.",
    "Run complete. There's a hot cup waiting, and someone glad you're back.",
    "Someone's waiting up, already laughing about the lobster thing.",
  ];

  // Shown instead of a random HOMECOMING_LINE when the run is completed
  // with Bub, DJ Cool, and Sakura Junction all in the tableau at once.
  const SECRET_HOMECOMING_LINE =
    "Every seat's full for this one \u2014 Bub's got the save-point joke loaded again, DJ Cool's aux cord is not up for debate, and Sakura Junction still owes you that gin and tonic. Whatever's past the Last Junction can wait one more night. The whole crew made it home.";

  const ACHIEVEMENTS = [
    { id: 'first-run', name: 'First Run', description: 'Complete a full run, start to finish.' },
    { id: 'clean-sweep', name: 'Clean Sweep', description: 'Complete a run without losing a single stage.' },
    { id: 'whole-crew', name: 'The Whole Crew', description: 'Trigger the secret ending.' },
    { id: 'high-roller', name: 'High Roller', description: 'Win 5 stages on the harder side of a junction, across all runs.' },
    { id: 'fully-loaded', name: 'Fully Loaded', description: 'Unlock every Crew, Vessel, Location, and Artifact in the Hangar.' },
    { id: 'full-house', name: 'Full House', description: 'Win a stage with the Full House goal.' },
  ];

  // --- Roguelite progression ---------------------------------------------

  const ALL_KEEPER_CARDS = [].concat(CREW_CARDS, VESSEL_CARDS, LOCATION_CARDS, ARTIFACT_CARDS);

  function findCard(id) {
    return ALL_KEEPER_CARDS.find((c) => c.id === id) || null;
  }

  // What a brand-new save starts with unlocked. Everything else in
  // UNLOCKABLE is bought with Scrip between runs, from the Hangar.
  const STARTER_UNLOCKED = ['crew-kade', 'crew-vance', 'vessel-comet', 'vessel-cargo', 'loc-dustfall', 'loc-glass', 'art-sundial'];

  const UNLOCKABLE = [
    { id: 'crew-bub', cost: 10 },
    { id: 'vessel-djcool', cost: 12 },
    { id: 'loc-sakura', cost: 12 },
    { id: 'crew-renn', cost: 15 },
    { id: 'crew-orlan', cost: 15 },
    { id: 'vessel-ironclad', cost: 15 },
    { id: 'loc-ninerivers', cost: 15 },
    { id: 'art-manifest', cost: 15 },
    { id: 'vessel-stealth', cost: 18 },
    { id: 'art-signal', cost: 18 },
    { id: 'art-savepoint', cost: 16 },
    { id: 'crew-quon', cost: 20 },
    { id: 'loc-lastjunction', cost: 20 },
  ];

  const BASE_SCRIP_PER_STAGE = 5;
  const STARTING_HP = 4;

  // Eight stages, each themed on a stop along the line. Only stage 0 starts
  // the player with a truly empty tableau (every later stage inherits
  // whatever was carried forward from the last win), so it gets a small
  // playerHeadStart to compensate, otherwise it plays far harder than the
  // stages after it, rather than easier.
  //
  // The map branches instead of running in a straight line: Dustfall is
  // always first and the Last Junction is always last, but the six stops
  // between them are arranged as three paired choices. Each pair shares a
  // difficulty tier (headstart/drawBonus), and the "harder" side of each
  // pair asks for one more card in the rival's hand in exchange for bonus
  // Scrip. Both sides of a pair lead to the same next pair, so the map
  // stays a fixed 5 stages deep no matter which path is taken, while still
  // giving 8 distinct routes through a run (2 x 2 x 2).
  const STAGE_MAP = {
    start: 'dustfall',
    totalDepth: 5,
    nodes: {
      dustfall: { id: 'dustfall', name: 'Dustfall Station', rivalHand: 2, rivalDrawBonus: 0, rivalHeadStart: 0, playerHeadStart: 1, harder: false, scripBonus: 0, next: ['glass', 'ninerivers'], isFinal: false },
      glass: { id: 'glass', name: 'The Glass Concourse', rivalHand: 4, rivalDrawBonus: 0, rivalHeadStart: 1, playerHeadStart: 0, harder: true, scripBonus: 2, next: ['sakura', 'rustbelt'], isFinal: false },
      ninerivers: { id: 'ninerivers', name: 'Nine Rivers Yard', rivalHand: 3, rivalDrawBonus: 0, rivalHeadStart: 1, playerHeadStart: 0, harder: false, scripBonus: 0, next: ['sakura', 'rustbelt'], isFinal: false },
      sakura: { id: 'sakura', name: 'Sakura Junction', rivalHand: 5, rivalDrawBonus: 0, rivalHeadStart: 2, playerHeadStart: 0, harder: true, scripBonus: 2, next: ['hollowpoint', 'staticfringe'], isFinal: false },
      rustbelt: { id: 'rustbelt', name: 'The Rustbelt Span', rivalHand: 4, rivalDrawBonus: 0, rivalHeadStart: 2, playerHeadStart: 0, harder: false, scripBonus: 0, next: ['hollowpoint', 'staticfringe'], isFinal: false },
      hollowpoint: { id: 'hollowpoint', name: 'Hollowpoint Crossing', rivalHand: 6, rivalDrawBonus: 1, rivalHeadStart: 3, playerHeadStart: 0, harder: true, scripBonus: 2, next: ['lastjunction'], isFinal: false },
      staticfringe: { id: 'staticfringe', name: 'The Static Fringe', rivalHand: 5, rivalDrawBonus: 1, rivalHeadStart: 3, playerHeadStart: 0, harder: false, scripBonus: 0, next: ['lastjunction'], isFinal: false },
      lastjunction: { id: 'lastjunction', name: 'The Last Junction', rivalHand: 6, rivalDrawBonus: 1, rivalHeadStart: 4, playerHeadStart: 0, harder: false, scripBonus: 0, next: [], isFinal: true },
    },
  };

  VW.CARD_TYPES = CARD_TYPES;
  VW.KEEPER_TYPES = KEEPER_TYPES;
  VW.UNLOCKABLE_TYPES = UNLOCKABLE_TYPES;
  VW.TYPE_META = TYPE_META;
  VW.ABILITY = ABILITY;
  VW.ABILITY_TEXT = ABILITY_TEXT;
  VW.CREW_CARDS = CREW_CARDS;
  VW.VESSEL_CARDS = VESSEL_CARDS;
  VW.LOCATION_CARDS = LOCATION_CARDS;
  VW.ARTIFACT_CARDS = ARTIFACT_CARDS;
  VW.RULE_CARDS = RULE_CARDS;
  VW.ACTION_CARDS = ACTION_CARDS;
  VW.GOAL_CARDS = GOAL_CARDS;
  VW.GOAL_CHECKS = GOAL_CHECKS;
  VW.HOMECOMING_LINES = HOMECOMING_LINES;
  VW.SECRET_HOMECOMING_LINE = SECRET_HOMECOMING_LINE;
  VW.ACHIEVEMENTS = ACHIEVEMENTS;
  VW.countByType = countByType;
  VW.ALL_KEEPER_CARDS = ALL_KEEPER_CARDS;
  VW.findCard = findCard;
  VW.STARTER_UNLOCKED = STARTER_UNLOCKED;
  VW.UNLOCKABLE = UNLOCKABLE;
  VW.BASE_SCRIP_PER_STAGE = BASE_SCRIP_PER_STAGE;
  VW.STARTING_HP = STARTING_HP;
  VW.STAGE_MAP = STAGE_MAP;
})();
