# Verse Wars

*A strategic, rules-shifting roguelite card game set across a galaxy-spanning bullet-train network.*

## What is this

Verse Wars is a small deck-driven strategy game in the spirit of Fluxx: the rules of the
game change as you play. You and a rival crew take turns playing cards from your Manifest:
**Keepers** (Crew, Vessels, Locations, Artifacts) build up in front of you, **Rules** change
how everyone plays, **Actions** cause one-off chaos, and **Goals** define, and redefine,
what it actually takes to win.

On top of that Fluxx-style core, a run down the Hyperrail is a small roguelite: five stages
deep, your tableau carrying forward between them. Every Keeper, not just Crew, carries a real
passive ability now, Rules stack instead of replacing each other, and Boarding Party / Swap
Rails let you choose your target instead of picking at random. Lose a stage and you retry it,
but a run only has 4 HP. Win stages and you bank Scrip, spent between runs in the Hangar to
permanently unlock more of the roster. Most stages branch into two paths onward, one of them
tougher for bonus Scrip, so the route through a run changes every time. Six achievements track
milestones across all your runs. A Codex on the main menu, reachable mid-run too, holds the
full Story, a Rules reference, a short comic retelling, and your earned achievements.

Everyone shares the Hyperrail: a network of ancient maglev lines connecting star systems.
Independent crews run modified bullet trains up and down the line, staying a few cars ahead
of **the Combine** (the central authority trying to control the rails) and whatever's waiting
out past **the Last Junction**.

Plain HTML, CSS, and JavaScript: no framework, no build step, no `npm install`. Open
`index.html` in a browser and it runs. The train is a small pixel-art sprite drawn on a
`<canvas>` at load time, and the Codex's comic reuses that exact sprite, drawn with the same
low-resolution, flat-color, no-curves technique throughout, rather than smooth vector shapes.
The sound effects are synthesized in-browser, and progress is saved to `localStorage` (with a
safe in-memory fallback if that's ever unavailable).

## How to play

- On your turn you draw, then play cards up to your current play limit (1 by default).
- **Keepers** (Crew / Vessel / Location / Artifact) stay in front of you and count toward Goals.
- **Rule** cards replace the active rule and change hand size, draw count, or plays per turn.
- **Action** cards resolve immediately, then go to the discard pile.
- **Goal** cards replace the active goal. The instant any player's Keepers match the active
  Goal, they win the stage, even mid-opponent's-turn.

### The run

- A run is five stages deep. Dustfall Station always starts it and the Last Junction always
  ends it; the eight stops between them branch across 10 named stages. At every junction
  you'll choose between two named stages before continuing, so no two runs take quite the
  same line. The very first choice genuinely forks the route rather than just reskinning it:
  Dustfall Station → **The Glass Concourse** → (**Sakura Junction** or **The Rustbelt Span**),
  or Dustfall Station → **Nine Rivers Yard** → (**The Cinderline** or **Cold Harbor Yard**).
  Both of those second branches then reconverge on the same next pair, (**Hollowpoint
  Crossing** or **The Static Fringe**) → **The Last Junction**.
- One side of each choice runs a tougher rival (+1 starting hand) in exchange for bonus Scrip
  on the win. The game marks which is which before you pick. The run always stays five stages
  deep regardless of the path taken, across 8 distinct routes.
- Win a stage and your tableau carries forward into the next one, growing stronger as you go.
- Lose a stage and you lose 1 HP, then retry that same stage fresh. A run starts with 4 HP:
  run out, and it's over (though every stage you already cleared banked its Scrip for good).
- Clear the Last Junction for a full run complete.

### Crew abilities

Every Crew card now carries a passive or triggered ability, visible right on the card:

| Crew | Ability |
| --- | --- |
| Capt. Rhys Kade | +2 bonus Scrip when you win a stage |
| Toli Vance | +1 card drawn each of your turns |
| Dr. Sable Renn | Shields one Keeper from the next forced discard, once per stage |
| Bex Orlan | +1 play each of your turns |
| Iris Quon | +1 hand limit while in your tableau |
| Bub | Draw 1 extra card the moment they're played |

### The Hangar

Scrip banked from cleared stages carries over between runs. Visit the Hangar from the main
menu to spend it unlocking more Crew, Vessels, Locations, and Artifacts for every future run:
a fresh save starts with a small roster and grows from there.

This is a simplified version of the Fluxx-style formula, with a full roguelite layer over it,
including branching routes, stacking Rules, and player-chosen targets. See **Roadmap ideas**
below for what's still worth adding.

## Run it locally

There's nothing to install. Either:

- Double-click `index.html`, or
- Serve the folder with anything static, e.g. `npx serve .` or `python3 -m http.server`,
  if you'd rather not rely on the `file://` protocol.

## Deploy to GitHub Pages

No build step means no Actions workflow required:

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.
4. Save. GitHub will publish it at `https://<username>.github.io/<repo-name>/` within a
   minute or two.

## Project structure

```
index.html            entry point: loads the CSS and each script in order
css/style.css           retro dispatch-terminal styling: scanlines, brass/steel palette
js/
  cards.js               card definitions, Crew abilities, and roguelite progression data
  codex.js                 Story, Rules, and Comic content for the menu's Codex
  storage.js                 localStorage wrapper for Scrip + unlocks (safe in-memory fallback)
  engine.js                    game state, stage/run flow, AI opponent
  train.js                       the canvas pixel-art train + its animation wrapper
  sound.js                         synthesized sound effects (no audio files)
  main.js                            renders the DOM from state and wires up clicks
```

There's no bundler and no `import`/`export`. Every file attaches what it needs to a shared
`VW` global (`window.VW`), and `index.html` loads them in dependency order with plain
`<script>` tags. That also means it works straight off `file://` with no server required.

## Roadmap ideas

- Card art beyond the train sprite and the Codex comic
- Online multiplayer (would need a small backend or a service like Firebase/PartyKit)

Already done: the AI scores every playable card against the current board (ability
strength, Goal proximity, best available steal target) instead of picking by a fixed
type order; the Rule/Action/Goal pool has grown to 56 cards, including two new Action
effects (duplicate a Keeper, reset every active Rule) and five new Goal combinations;
and the map's first branch now genuinely forks the route (Glass Concourse and Nine
Rivers Yard each lead to their own distinct next pair) instead of both sides
reconverging immediately, spanning 10 named stages across 8 distinct routes.

## A note

For Bub: who will absolutely still finish that insult-sword-fighting bit unprompted at a
party, who's owed me a rematch on at least four different board games, and who'd fly to Japan
tomorrow for a bowl of pho and a proper gin and tonic. You forget where you put your keys.
You have never once forgotten a punchline.

You asked for bullet trains. You got a whole rail line, a rival crew, and eight ways to lose
spectacularly. There's a save point with your name on it somewhere down the track.

Thank you. Always and forever.

## License

MIT. See [LICENSE](LICENSE).
