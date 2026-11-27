# Anveshya labs

Each folder here is one lab. A lab makes no network requests and bundles
everything it needs.

| File | What it holds |
|---|---|
| `<slug>/content.js` | The lab's words: experiment names, presets (with their values) and lessons. Edit freely. |
| `<slug>/physics.js` | The formulas, as plain functions. Tested in `tests/`. |
| `<slug>/experiments.js(x)` | Each experiment's controls, outputs and legend. |
| `<slug>/scenes.jsx` | The 3D pictures. |
| `<slug>/index.js` | Joins them with `defineLab`. |
| `registry.js` | The list of labs shown on Explore and Learn. |
| `shell/` | The shared screen: tabs, 3D view, side panel, welcome pop-up, shortcuts. |
| `embed/` | Entry for `lab-embed.html`. |

The lesson pages at `/learn/labs/<slug>` read the same `content.js`.

## Tests

```
npm test
```

Checks every formula against known values, and that each lesson is complete,
labelled and has valid equations.

## Adding an experiment

1. Add its formulas to `physics.js` and a test for them.
2. Add its words to `content.js` under a new id: `name`, `summary`, `presets`
   and `learn` (`plain`, `see`, `equations`, `variables`, `assumptions`,
   `meaning`, `limits`, `try`, `ask`).
3. Add `{ id, params, outputs, Scene, note }` with the same id to the
   experiments file. See `shell/defineLab.js` for the other options.

## Links

`/labs/<slug>?experiment=<id>` opens a lab on one experiment.

## Embedding in the app

```
npm run build:labs        # writes dist-embed/lab-embed.html (one file, about 2.6 MB)
```

Open it as `lab-embed.html?lab=<slug>&theme=dark|light` (optionally
`&experiment=<id>`). The page sends JSON text to
`window.ReactNativeWebView.postMessage` (or to `window.parent`):

```json
{ "source": "anveshya-lab", "type": "ready", "lab": "wormhole" }
{ "source": "anveshya-lab", "type": "close", "lab": "wormhole" }
```

The website also serves the same page at `/lab-embed.html`.
