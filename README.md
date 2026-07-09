# Chrono Chronicles Overhaul

Static rebuild of the deployed Chrono Chronicles experience at:

https://16bit-historical-journey-rebuild.vercel.app/

The original source project was not present in this workspace, so this overhaul is built as a standalone HTML/CSS/JS app under `/home/yaghiashraf/codex/chrono-chronicles-overhaul`.

## Run locally

```sh
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

## Notes

- The opening screen and app chrome credit `Wadih Absi`.
- The app keeps the 75-event timeline extracted from the live bundle.
- Historical PNG assets were copied into `assets/history/` for local rendering.
- Generated concept references are saved under `references/`.

## Narration & effects

- `narration.js` holds a hand-written documentary-style script per event; it is
  both the on-stage summary and the narration text.
- `assets/narration/*.mp3` are pre-generated with edge-tts
  (`en-US-AndrewNeural`, rate -12%, pitch -6Hz) for a deep, warm narrator
  voice. Regenerate after editing scripts:
  `pip install edge-tts` then run a loop over the scripts with those settings.
- If an MP3 fails to load, the app falls back to browser `speechSynthesis`
  with a deep-male voice preference.
- `effects.js` is a canvas scene engine with ~19 layer primitives (particles,
  glow, beams, waves, aurora, ticker, helix, network, bursts, ...).
  `scenes.js` composes them into a unique, topical animation for each of the
  75 events (e.g. aurora for `vikings`, scrolling helix for `dna`, tribute
  beams for `sept_11`). Disabled under `prefers-reduced-motion`.
- `ambience.js` synthesizes a low ambient soundscape per event with Web Audio
  (wind, ocean, fire crackle, thunder, bells, machinery, static, sonar...) —
  no audio files. It fades between events, ducks under narration, starts only
  after a user gesture, and can be muted with the topbar Sound toggle
  (persisted in localStorage).
