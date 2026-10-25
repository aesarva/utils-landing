---
name: Ochre (product world)
description: The Ochre product page is a station hall under its departure board. The board above flips the chip's cores with load, and the departures below are what Ochre shows.
colors:
  ground: "#15171a"
  housing: "#1d1f22"
  pane: "#1c1f22"
  flap: "#2c2e32"
  flap-faint: "#24272b"
  row: "#202327"
  ink: "#ece7da"
  ink-dim: "#a9a49a"
  ink-faint: "#8e8b85"
  ink-warm: "#1a1b1d"
  mustard: "#dfac2e"
  heat-amber: "#e3bf5c"
  heat-ember: "#cc8f25"
  heat-hot: "#b4462a"
typography:
  title:
    fontFamily: "'Barlow Semi Condensed', 'Commissioner', sans-serif"
    fontSize: "calc(109 * var(--u))"
    fontWeight: 800
    lineHeight: 1
  tile-numeral:
    fontFamily: "'Barlow Semi Condensed', 'Commissioner', sans-serif"
    fontSize: "calc(31 * var(--u))"
    fontWeight: 600
    fontFeature: "'tnum' 1"
  temperature-numeral:
    fontFamily: "'Barlow Semi Condensed', 'Commissioner', sans-serif"
    fontSize: "calc(76 * var(--u))"
    fontWeight: 700
    fontFeature: "'tnum' 1"
  line:
    fontFamily: "'Commissioner', system-ui, sans-serif"
    fontSize: "calc(27 * var(--u))"
    fontWeight: 500
    lineHeight: "calc(33 * var(--u))"
  body:
    fontFamily: "'Commissioner', system-ui, sans-serif"
    fontSize: "calc(20 * var(--u))"
    fontWeight: 400
    lineHeight: "calc(27 * var(--u))"
  small:
    fontFamily: "'Commissioner', system-ui, sans-serif"
    fontSize: "calc(17 * var(--u))"
    fontWeight: 400
    lineHeight: "calc(24 * var(--u))"
  action:
    fontFamily: "'Commissioner', system-ui, sans-serif"
    fontSize: "calc(22 * var(--u))"
    fontWeight: 700
  station-caps:
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace"
    fontSize: "calc(18.5 * var(--u))"
    fontWeight: 600
    letterSpacing: "0.25em"
  flap-letter:
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace"
    fontSize: "calc(25 * var(--u))"
    fontWeight: 700
    lineHeight: 1
rounded:
  housing: "calc(22 * var(--u))"
  pane: "calc(14 * var(--u))"
  shot: "calc(12 * var(--u))"
  action: "calc(9 * var(--u))"
  row: "calc(8 * var(--u))"
  tile: "calc(5 * var(--u))"
  bar: "calc(4 * var(--u))"
  flap: "calc(3 * var(--u))"
  flap-small: "calc(2 * var(--u))"
spacing:
  unit: "calc(100vw / 1536)"
  unit-mobile: "calc(100vw / 620)"
  page-left: "calc(65 * var(--u))"
  page-right: "calc(62 * var(--u))"
  page-mobile: "16px"
  board-height: "calc(423 * var(--u))"
  hero-column: "calc(560 * var(--u))"
  die-column: "calc(744 * var(--u))"
  row-height: "calc(50 * var(--u))"
  row-name-column: "calc(410 * var(--u))"
  row-gap: "calc(8 * var(--u))"
  section-gap: "calc(84 * var(--u))"
components:
  board-housing:
    backgroundColor: "{colors.housing}"
    rounded: "{rounded.housing}"
    height: "{spacing.board-height}"
    padding: "calc(21 * var(--u)) calc(20 * var(--u)) 0 calc(41 * var(--u))"
  die-pane:
    backgroundColor: "{colors.pane}"
    rounded: "{rounded.pane}"
    height: "calc(377 * var(--u))"
  download:
    backgroundColor: "{colors.mustard}"
    textColor: "{colors.ink-warm}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    width: "calc(328 * var(--u))"
    height: "calc(70 * var(--u))"
  download-hover:
    backgroundColor: "#e8b83c"
  core-tile-cold:
    backgroundColor: "{colors.flap}"
    textColor: "{colors.ink}"
    typography: "{typography.tile-numeral}"
    rounded: "{rounded.tile}"
    size: "calc(75 * var(--u)) x calc(66 * var(--u))"
  core-tile-amber:
    backgroundColor: "{colors.heat-amber}"
    textColor: "{colors.ink-warm}"
  core-tile-hot:
    backgroundColor: "{colors.heat-hot}"
    textColor: "{colors.ink}"
  gpu-bar:
    backgroundColor: "{colors.flap}"
    rounded: "{rounded.bar}"
    height: "calc(27 * var(--u))"
  departure-row:
    backgroundColor: "{colors.row}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    height: "{spacing.row-height}"
  section-head:
    textColor: "{colors.ink}"
    typography: "{typography.station-caps}"
---

# Design System: Ochre (product world)

> **Scope.** This file records the Ochre world only: `/ochre/` (ru) and `/en/ochre/` (en), built from `src/worlds/ochre/` (World.astro, Flaps.astro, board.ts, motion.ts, copy.ts) and `src/content/products/ochre.yaml`. The shared shell contract and the hub world live in the root `DESIGN.md` and still bind this page. Every token here is declared only under `:root[data-world='ochre']`. **Never carry Ochre's graphite, flaps, heat scale or mustard to the hub or to another product world.** The machine sidecar is `src/worlds/ochre/design.json`.

## Overview

**Creative North Star: "The Station Hall"**

The page is a station hall under its departure board. Across the top hangs one board housing. Its left half holds the app icon, OCHRE, the line, one sentence, and the mustard download with its version, size, macOS floor and licence. Its right half is a live die-map pane: an M5 PRO head on flaps, Super and Performance cores as split-flap tiles that flip and heat with load, CPU temperature flaps, and 20 GPU bars. The pane is labelled "Demo data". Below the board, a departures board lists the app's tabs (Overview, CPU, Memory, Network, Disk), each row with a pictogram, a flap-lettered name, what the tab shows, and its refresh rate. A faint mono caption under the rows gives the README cadences: 2 s by default, 1 or 5 s in Settings, temperatures every 15 s with the panel closed and every 2 s while it is open. After that come the lightweight, native and private strip, the real app screenshots, "Also on board", and an install block set in a second housing that carries the second download.

Everything is graphite: matte charcoal housings lit from the top left, darker panes set into them, and flap tiles with a hairline split across the middle. Lettering is warm off-white. Colour on the board means heat and nothing else. The one exception is the download, which is mustard.

**Key Characteristics:**
- Graphite ground (`ground`) with charcoal board housings (22u radius, top-left light falloff) and inset panes.
- Split-flap tiles everywhere data appears. Each tile has a 1px dark split line across its middle.
- Barlow Semi Condensed for the brand name and the numerals on tiles. Commissioner for prose. IBM Plex Mono for every flap letter and every station caption.
- Heat scale ported from the app (amber, then ember, then red). Cold tiles stay graphite.
- Mustard marks the primary action only.
- One unit, `--u = 100vw / 1536` on desktop and `100vw / 620` under 63.99rem, with px overrides for every text and flap size on mobile.
- One motion: the demo board ticks every 2 s and changed tiles flip.

## Colors

The palette is graphite and warm off-white. Board colour is heat, and the download is mustard.

### Primary
- **Download Mustard** (`mustard`): fills both download buttons (`.oc-download`, in the board housing and in the install housing). Its hover lightens to #e8b83c. It is also the shell accent (`--shell-accent`). The build also uses it for interaction state: the focus ring (2u, min 2px, 4u offset) and the text selection highlight (with `ink-warm` text).

### Heat (data colour, never decoration)
- **Heat Amber** (`heat-amber`), **Heat Ember** (`heat-ember`), **Heat Red** (`heat-hot`): the three stops of the app's HeatScale, ported in `board.ts` from `MetricsCore/Presentation/HeatScale.swift`. Below 20% load a tile is cold and shows `flap`. From 20% to 60% it mixes amber to ember, from 60% to 90% ember to red, and at 90% or more it is red. Numerals are `ink-warm` (dark) from 20% up to 83% and `ink` (light) when cold or at 83% and above (`tileInk`). The lit GPU bars take the heat of the overall GPU load, and lit bars on a cold GPU are `ink-dim`.

### Neutral
- **Station Ground** (`ground`): page background and the shell ground.
- **Board Housing** (`housing`): the housing body. It is always painted as the light-falloff gradient `linear-gradient(160deg, #232629 0%, #1d1f22 45%, #191b1e 100%)` (`--housing-light`).
- **Die Pane** (`pane`): the die-map pane set into the housing. Its head band is one step lighter (#24272a), with no rule.
- **Flap** (`flap`): a cold tile, an unlit GPU bar, and a step-number tile. **Faint Flap** (`flap-faint`): the small label flaps.
- **Departure Row** (`row`): the departures rows.
- **Warm Off-White** (`ink`): text, flap letters, pictograms and line icons.
- **Dim Ink** (`ink-dim`): secondary prose, meta, the hub link and the language switch at rest. **Faint Ink** (`ink-faint`): section sub-captions and the footer.
- **Warm Black** (`ink-warm`): text on mustard and on hot-but-not-red tiles.

### Named Rules
**The Colour Is Heat Rule.** On the board and the departures, chromatic colour appears only where a core, a GPU or a reading is under load, and only through `heatColor()`. Labels, rows, pictograms, section heads and the temperature flaps stay graphite and off-white.

**The One Action Rule.** Mustard fills the download and nothing else on the page surface. The focus ring and the selection highlight are the only other places it appears, and both are transient interaction states. The one standing exception is the current language in the topbar (mustard letters with a mustard underline), which the approved comp shows.

**The Shell Mirror Rule.** `--shell-ink` = `ink`, `--shell-ground` = `ground`, `--shell-accent` = `mustard`, and `--shell-font` = Commissioner.

## Typography

**Display Font:** Barlow Semi Condensed 800 and 700 (fallback Commissioner, sans-serif)
**Body Font:** Commissioner 400, 500, 600 and 700 (fallback system-ui, sans-serif)
**Label/Mono Font:** IBM Plex Mono 500, 600 and 700 (fallback ui-monospace, monospace)

All three are self-hosted through @fontsource.

**Character:** A hard semi-condensed grotesk sets the brand name and the board numerals, the way a station board's numbers read. A slab-terminal mono sets every flap letter and station caption, and a warm humanist sans carries the prose. Why these three: Barlow Semi Condensed tied Phudu on the font match, and Phudu is soft and rounded where the comp is a hard grotesk. Commissioner is the nearest ranked text face that has Cyrillic, which matters because Russian is the default language. Public Sans ranked closer but has no Cyrillic. IBM Plex Mono matches the comp's mono by eye and has Cyrillic.

### Hierarchy
- **Title** (Barlow 800, 109u, line-height 1, uppercase, `#f3eade`, soft lift `0 4u 14u rgb(0 0 0 / 0.45)`, cap-trimmed): OCHRE, the page's only `h1`. 62px on mobile.
- **Temperature numeral** (Barlow 700, 76u, tabular): the CPU temperature flaps.
- **Tile numeral** (Barlow 600, 31u Super and 22u Performance, tabular): core loads. The step numbers use Barlow 700 at 30u.
- **Line** (Commissioner 500, 27u/33u, `#d6d0c5`, balanced): the tagline.
- **Body** (Commissioner 400, 20u/27u, `ink-dim`, max 530u): the lede and the install steps. Small prose is 17 to 17.5u on 24 to 25u line height.
- **Action** (Commissioner 700, 22u): the download label.
- **Station caps** (Plex Mono 600, 18.5u, +0.25em, uppercase, `#f0ece4`): section heads. Their right-aligned sub-captions use 17u, +0.13em, `ink-faint`. On mobile they are 15px/+0.18em and 12px.
- **Flap letter** (Plex Mono 500 to 700, sized per flap kind; see Components).

### Named Rules
**The Digits-Only Display Rule.** Barlow Semi Condensed sets only the Latin brand name and numerals. It has no Cyrillic, so any word that can be Russian goes on Plex Mono flaps or in Commissioner.

**The Flap Letter Rule.** Words on the board (chip name, cluster labels, tab names, tab descriptions, refresh units, screenshot and "on board" titles) are set one letter per flap in Plex Mono. Prose is never set on flaps longer than a single short line.

## Layout

**Unit.** On desktop everything is sized in `--u = calc(100vw / 1536)`, so the page scales as one plate of the comp. Under `max-width: 63.99rem`, `--u` becomes `calc(100vw / 620)`, and every text size, flap, tile and control switches to a fixed px value (body 16px, title 62px, flaps per kind) so lettering stays readable on a phone.

**Desktop.** The page is padded 18u top, 62u right and 65u left. The board housing is a two-column grid, 560u for the hero and 744u for the die pane, set with `space-between`. It is 423u tall. Inside the pane, the die map is a grid with a 487u Super column and the temperature column, then full-width Performance and GPU rows. The departures sit 33u below the housing. Each row is 50u tall, split into a 410u name panel and a description panel, with an 8u gap between rows. The facts strip is three columns under a 2u rule. The later sections step down by 84u. The screenshots grid is 2.5fr 1fr 1fr, "Also on board" is four columns divided by 1px hairlines, and the install block is a housing with 1fr and 420u columns.

**Mobile (≤63.99rem).** 16px page padding. The housing stacks: icon and title share a row, the line, lede and a full-width download follow, then the die pane. In the pane, Super is followed by temperature, then Performance in a wrapping six-per-row grid, then GPU. Departure rows become two stacked panels, with the refresh unit pinned at the top right of the name panel. Facts, "on board" and install go to one column, and the screenshots go to two columns with the panel shot spanning both.

## Elevation & Depth

The board is a physical object. Housings are lit from the top left and cast a soft shadow onto the ground. Panes are set into them, and tiles carry a hairline top highlight. All shadows are soft and blurred.

### Shadow Vocabulary
- **Housing** (`inset 0 1px 0 #2b2d30, 0 0 0 1px #121416, 0 18u 40u rgb(0 0 0 / 0.35)`): the board housing. The install housing uses the same light without the drop.
- **Pane inset** (`inset 0 1px 0 #383b3e, inset 0 -1px 0 #101215`): the die pane sits into the housing.
- **Tile** (`inset 0 1px 0 rgb(255 255 255 / 0.08)` plus a 6% white to 8% black vertical gradient): core tiles and step numbers. Bars use 5% and rows use 3%.
- **Action** (`inset 0 1px 0 rgb(255 255 255 / 0.25), 0 6u 18u rgb(0 0 0 / 0.3)`): the download.
- **Screenshot** (`0 0 0 1px #2c2f33, 0 14u 34u rgb(0 0 0 / 0.4)`): the app screenshots.

### Named Rules
**The Lit Housing Rule.** Housings always use the 160° light-falloff gradient, never a flat fill, and they are the only surfaces that drop a shadow onto the ground.

**The Split Line Rule.** Every flap and tile carries a 1px black split at 50% height (45% opacity on tiles, 22% to 40% on letter flaps). Empty flap seams on the rows are drawn as repeating 1u dark lines every 35.5u.

## Shapes

The world uses rounded rectangles, stepped by scale: housings 22u (18px on mobile), the pane 14u, screenshots 12u, the download 9u, rows 8u, tiles 5u, GPU bars 4u, and flaps 3u and 2u. Dividers are 1px hairlines in graphite (#25282b to #2e3134). The facts strip uses a 2u rule over a 1px dark shadow line. The refresh unit is separated by a 2px off-white tick, 30u tall.

## Components

### Board housing (signature)
- The lit housing (`board-housing`) holding the hero and the die pane. The second housing on the page holds the install steps and the second download. That way the second download stands inside the world, not on the bare ground.

### Die map pane (signature)
- **Head:** the chip name on head flaps (M5 PRO) and "Demo data" with an inline info glyph (SVG), on the lighter head band.
- **Core tiles:** six Super tiles (75 × 66u) and twelve Performance tiles (53.6 × 56u), coloured by `heatColor(load)` with numeral ink from `tileInk(load)`. The demo loads are synthetic and labelled as demo.
- **Temperature flaps:** three tiles (56 × 84u) reading the CPU temperature with a degree sign, always graphite.
- **GPU bars:** 20 bars (one per GPU core), lit by `gpuLit(utilization, total)`: lit count = round(utilization × total), at least one when utilization is above zero. All lit bars share one heat colour from the overall load. A percentage label sits at the right.

### Flaps (`Flaps.astro`)
Each word is one flap per character, `aria-hidden`, with the real text in a visually hidden span. There are five kinds:
- **head** (23 × 36u, 3u radius, #34373b, 27u): the chip name.
- **label** (10.4 × 20u, 2u radius, `flap-faint`, #d4cfc4 letters, 16u; narrowed to 8u/13u for temperature): cluster labels, screenshot titles, "on board" titles.
- **name** (20.5 × 34u, 3u radius, #34363a, weight 700, 25u, in a 14% black tray): tab names.
- **desc** (13.2 × 30u, 2u radius, #26292d, #ebe6dc letters, weight 500, 21u): what each tab shows.
- **unit** (13 × 22u, 2u radius, #303236, 17u): the refresh unit.
On mobile each kind switches to fixed px (for example name 16 × 28px at 18px, desc 9.4 × 24px at 14px).

### Departure row
- A name panel (pictogram, then name flaps) and a description panel (desc flaps, then the refresh unit: a refresh line icon and unit flaps after an off-white tick). Rows show the empty-flap seams. Pictograms are inline SVG line icons at 30u, stroke 1.5, round caps. Overview is the one filled grid glyph.

### Download (`download`)
- Mustard, 328 × 70u, 9u radius, an inline download arrow SVG (26u, stroke 2) and the label. The meta beside it is two lines of `ink-dim` at 16u (version and size, then macOS floor and licence). Hover lightens to #e8b83c. Focus is the mustard ring. The first download carries the shell's `data-download`. Unreleased products show "coming soon" in mono caps, with no link.

### Facts strip, screenshots, "Also on board", install steps
- **Facts:** three items with 42u line icons (stroke 1.4), a 20u/600 title and `ink-dim` text, divided by 1px hairlines.
- **Screenshots:** real app renders with 12u radius and the screenshot shadow. Captions are a label flap title and `ink-dim` text.
- **Menubar shot:** `assets/plates/ochre-menubar.png`, the mini die map and temperature cut unchanged from the real light-menu-bar screenshot (provenance in its .json). It sits on a light strip (#e7e2d8) because the capture is of the light menu bar. Show only this configuration, not every segment.
- **Install steps:** numbered on step flaps (46 × 52u, Barlow 700, split line).

### Shell parts in this world
- **Topbar:** "← All utilities" in `ink-dim` with a masked arrow, and RU/EN in Plex Mono 600 at 17.5u with +0.06em.
- **Footer:** `ink-faint` at 15u above a 1px #25282b rule. Hover goes to `ink`.

### Motion contract (`motion.ts`)
- **Tick:** every 2000 ms, which is Ochre's default refresh. On each tick each core tile has a 35% chance of a new load (a random walk with a 7% chance of a spike to 60 to 100). The GPU load drifts ±8, and the temperature has a 30% chance to drift ±2 within 58 to 78 °C.
- **Flip:** a changed tile collapses to `scaleY(0.06)` in 130 ms with `cubic-bezier(0.5, 0, 0.75, 0)`. It swaps its numeral, heat and ink at the midpoint, then reopens in 130 ms with `cubic-bezier(0.25, 1, 0.5, 1)`, for a 260 ms flip that matches the app's FlapTile. GPU bars cross-fade background over 260 ms ease-out.
- **Pause:** no tick runs while the pane is off screen (IntersectionObserver) or the document is hidden.
- **Reduced motion:** with `prefers-reduced-motion: reduce` the script never starts and transitions are none. The board stands at its server-rendered demo state. Without JS it also stands, and all content is server-rendered.

## Do's and Don'ts

### Do:
- **Do** size in `--u` on desktop and switch to px under 63.99rem for every text, flap and control.
- **Do** colour load only through `heatColor()` and `tileInk()` from `board.ts`, and keep cold tiles on `flap`.
- **Do** light a GPU bar count proportional to load (`gpuLit`), with one shared heat colour.
- **Do** put words on the board on Plex Mono flaps with the visually hidden text alongside.
- **Do** label demo data as demo, on the pane and in its hidden caption.
- **Do** paint housings with the 160° light-falloff gradient and inset panes into them.
- **Do** keep the flip at 130 + 130 ms on a 2 s tick, paused off screen and absent under reduced motion.
- **Do** source every raster from the app repo with provenance (`src/assets/products/ochre/SOURCE.json`, `assets/plates/ochre-icon.png.json`).

### Don't:
- **Don't** use heat colours on labels, rows, pictograms, headings or any decoration.
- **Don't** use mustard as a surface, text colour or marker anywhere but the download (focus ring and selection excepted).
- **Don't** set Russian words in Barlow Semi Condensed.
- **Don't** paint a GPU bar by its index or across a multi-colour gradient. All lit bars share the overall load's heat.
- **Don't** invent claims or tab descriptions. Copy comes from the app's README (ru/en) and its tab names.
- **Don't** apply hub materials (board fibre, Hub Display, ink mask, signal orange) here.

### Recorded deviations from the approved comp
- **The real app icon.** The comp's icon was a generator's paraphrase. The page ships the actual Ochre icon, rendered from `ochre/Resources/AppIcon.icon` (the user approved the difference).
- **README-true copy.** The lede, the facts ("No Electron, no helper daemon", "Only a daily update check") and the CPU row ("Every core, cluster by cluster") follow the README, not the comp's paraphrases.
- **Honest GPU bars.** The comp showed a multi-coloured run of bars at a "100%" label with only seven lit. The build lights round(load × 20) bars in the single heat colour of the overall load, matching the app's GPUBars.
