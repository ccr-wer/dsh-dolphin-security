# ORCA LINK (虎鲸链路)

English | [中文](README.zh.md)

ORCA LINK — a light sci-fi anime skin for the DSH web GUI, shipped as a pure
asset directory inside the skin-center package. Ported with the permission of
the upstream author ([Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale))
under the same license; attribution chain and usage terms follow the
[NOTICE](NOTICE) / [LICENSE](LICENSE) files in this directory.

## What it is

- **Pure assets**: `skin.json` (v2 manifest) + `skin.css` (token remap) +
  `patches.css` (component patches) + `hooks.mjs` (trusted escape hatch,
  same-review-and-release contract) + `assets/` (scene artwork, status
  character atlas) + `preview/` (light/dark screenshots). No package.json,
  no build step; the skin-center package is the only loader.
- **Scenes**: the light/dark hero and active scenes crossfade on a
  `body[data-orca-scene]` marker the hooks controller projects from the
  conversation phase (hero / settling / active). Artwork URLs are written by
  the hooks through body-level CSS variables so they resolve against the
  skin asset base (the loader inlines served CSS, where relative URLs would
  break).
- **Status character**: an 8x10 atlas actor in the sidebar art stage whose
  pose row follows the link state (standby / syncing / working / approval /
  input / review / complete / fault / offline / ready), with per-status
  frame pacing, one-shot sequences and centroid alignment compensation.
- **Signal chip, pricing light, headline typewriter, composer motion and
  drag-to-collapse, icon redraw, terminal width locks, window-resume
  tooltip suppression, settings/cordis overlay attributes and rail-search
  completion**: all ported from the upstream v1 plugin; everything is
  presentation-only (no services, no model requests) and retracts cleanly.
- **v2 contract note**: the upstream customization panel (character /
  background / pricing toggles and the SFW visibility schedule) has no v2
  settings surface, so every feature ships on. The CSS anchors for the
  hidden states are kept for a future settings surface.

## License

The skin is a derivative work of the upstream ORCA LINK skin and of the
whale-girl character by 上善 (original design). It is released under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
(attribution — non-commercial — share alike); the full attribution chain is
in [NOTICE](NOTICE). Commercial use is not permitted.
