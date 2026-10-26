---
version: 1
slug: "src-worlds-ochre-world-astro"
primary_target: "src/worlds/ochre/World.astro"
related_targets: ["src/pages/ochre"]
---

# Ochre product page (/ochre/, /en/ochre/)

Scope: the Ochre product page in its own world, inside the shared shell. Visitor mode: Persuade.

Audience and job: Mac owners (ru/en), from developers to everyday owners, arriving from GitHub, the hub or a shared link. Job: see what Ochre shows, trust it is light, native and private, and download the signed DMG. Proof: the die map demonstrated (synthetic, labelled demo data, M5 Pro: 6 Super + 12 Performance cores, 20 GPU cores), real app renders (`src/assets/products/ochre/`: hero, tab-*.jpg, menubar), measured idle cost (about 0.5% of one core, 14 MB, M5 Pro), release data from `releases.json`. Facts from `../ochre` develop: README ru/en, CHANGELOG, DESIGN.md. Constraints: colour means heat only (amber → ember → red), mustard only for the primary action; no Apple logo; no invented claims or copy; refresh rates as the README states (1, 2 or 5 s; temperatures every 15 s with the panel closed, 2 s open); app UI is Russian for now (README note); no JS required for content; `data-download` contract.

World: the app's own departure board (split-flap), rebuilt from scratch; the old `../ochre/site/` is a content source only.

Approved comp: `.impeccable/mocks/decision/ochre/station-hall.png` (surface round, composition 2 "Station hall").

Memorable moment: the station board at the top of the page flips the chip's cores with load, heat-coloured, while the rows below read like departures.

## Direction contract

THESIS: Ochre's page is a station hall under its departure board: the board above shows the visitor's chip at work, the departures below are what Ochre shows. It refuses the split hero over a row of feature cards.

OWN-WORLD: graphite ground and board housings, matte split-flap tiles with a hairline split, warm off-white condensed flap lettering, a mono for station rows; mustard only for the download; amber, ember, red only where a core or reading runs hot.

STORY: the visitor sees the die map flip, recognises their own chip, reads the departures (tabs and what each shows), trusts the lightness and privacy line, downloads.

FIRST VIEWPORT: a board housing across the top: app icon, OCHRE, the line, one sentence, the mustard download with version, size, macOS floor and licence beside it; to its right the live die map pane (Super, Performance, GPU rows, CPU temperature flaps, "demo data" label). Below, the departures heading and rows Overview, CPU, Memory, Network, Disk, each with a pictogram, flap-lettered name, what it shows, refresh rate. Then the lightness, native, private strip.

FORM: station hall, position 2 of my ordered seven (dealt; chosen by the user); seed: 3aa91fbd15ce7bd9.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
