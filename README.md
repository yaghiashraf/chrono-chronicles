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
