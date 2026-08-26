# Contributing to Verse Wars

Thanks for your interest in contributing! This is a small, dependency-free project:
plain HTML, CSS, and JavaScript, no build step, no `npm install`.

## Getting started

1. Fork and clone the repository.
2. Open `index.html` directly in a browser, or serve the folder with anything
   static (`npx serve .`, `python3 -m http.server`) if you'd rather not rely on
   `file://`.
3. Create a branch for your change:
   ```bash
   git checkout -b feature/my-change
   ```

There's nothing to install and nothing to build. Edit a file, save, and reload
the browser tab.

## Project structure

```
index.html            entry point: loads the CSS and each script in order
css/style.css          retro dispatch-terminal styling: scanlines, brass/steel palette
js/
  cards.js               card definitions, Crew abilities, and roguelite progression data
  codex.js                  Story, Rules, and Comic content for the menu's Codex
  storage.js                  localStorage wrapper for Scrip + unlocks (safe in-memory fallback)
  engine.js                     game state, stage/run flow, AI opponent
  train.js                        the canvas pixel-art train + its animation wrapper
  sound.js                          synthesized sound effects (no audio files)
  main.js                             renders the DOM from state and wires up clicks
test/run.js            dependency-free regression suite; run with `node test/run.js`
```

Every file attaches what it needs to a shared `VW` global (`window.VW`); there's
no `import`/`export` and no bundler.

## Making changes

- **Cards & progression**: edit `js/cards.js`. Follow the existing card shape
  (`id`, `name`, `type`, `description`/`flavor`, optional `ability`). Add new
  Crew/Vessel/Location/Artifact IDs to `UNLOCKABLE` in the same file if they
  should be gated behind Scrip in the Hangar.
- **Rules/Actions/Goals**: also in `js/cards.js`, alongside the Keeper decks.
- **Game logic**: `js/engine.js` is a plain reducer, `engine.reduce(state, action)`.
  No React, no classes — just functions over a plain state object.
- **Rendering**: `js/main.js` rebuilds `innerHTML` from state on every
  dispatch and uses one delegated click listener for the whole app. New
  interactive elements should get a `data-action` (or `data-card-id` /
  `data-target-id`) attribute rather than their own listener.
- **Styling**: `css/style.css` holds everything, organized by screen/component
  with a section comment above each. Keep new UI within the existing
  brass/steel palette (CSS custom properties at the top of the file).

## Testing checklist

Run `node test/run.js` first: a small, dependency-free regression suite covering
card/goal/stage-map data integrity and the engine reducer, including a batch of
simulated full runs (`PLAY_CARD`/`AI_FULL_TURN`/etc. dispatched directly, no
browser needed) that catch reducer-level regressions like an infinite loop or a
stranded turn. It only exercises `js/cards.js`, `js/storage.js`, `js/engine.js`,
and `js/train.js` — `js/main.js` touches the DOM at load time, so UI changes
still need a manual pass.

Before submitting a PR:

- [ ] `node test/run.js` passes
- [ ] No console errors
- [ ] A full run plays start to finish (win and lose at least one stage)
- [ ] New cards/abilities behave as described and interact sensibly with
      existing Rules
- [ ] Hangar unlocks and Scrip totals persist correctly (check `localStorage`,
      or play twice in the same session)
- [ ] UI looks right on both desktop and a narrow/mobile viewport
- [ ] Achievements still trigger where expected

## Commit messages

Conventional commits are appreciated but not required:
`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `chore:`.

## Pull requests

Push to your fork and open a PR with a clear description of what changed and
why, plus a screenshot for any UI change. Reference related issues if any exist.
