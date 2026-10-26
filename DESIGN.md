---
name: CyberTech team utilities
description: The hub is an independent record label's catalogue, and every utility is a numbered release. Each product page is its own world, inside one shared shell.
colors:
  ink: "#121110"
  ink-soft: "#3b3936"
  board-base: "#94928d"
  signal: "#f84c0a"
typography:
  catalogue-number:
    fontFamily: "'Hub Display', sans-serif"
    fontSize: "calc(254 * var(--u))"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  masthead:
    fontFamily: "'Hub Display', sans-serif"
    fontSize: "calc(72 * var(--u))"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Hub Display', sans-serif"
    fontSize: "calc(56 * var(--u))"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  nav:
    fontFamily: "'Hub Display', sans-serif"
    fontSize: "max(calc(19 * var(--u)), 13px)"
    fontWeight: 400
    letterSpacing: "0.14em"
  body:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "max(calc(21 * var(--u)), 15px)"
    fontWeight: 400
    lineHeight: 1.2
  pressing:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "max(calc(18 * var(--u)), 13px)"
    fontWeight: 400
    fontFeature: "'tnum' 1"
  label-caps:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "max(calc(20 * var(--u)), 12px)"
    fontWeight: 400
    letterSpacing: "0.06em"
  fact:
    fontFamily: "'Fira Sans Extra Condensed', sans-serif"
    fontSize: "max(calc(17.5 * var(--u)), 12px)"
    fontWeight: 500
    lineHeight: 1.12
  promise:
    fontFamily: "'Fira Sans Extra Condensed', sans-serif"
    fontSize: "max(calc(22 * var(--u)), 15px)"
    fontWeight: 500
    lineHeight: 1.15
spacing:
  unit: "calc(100vw / 1536)"
  gutter: "calc(34 * var(--u))"
  rule: "calc(3 * var(--u))"
  hairline: "calc(1.5 * var(--u))"
  band-gap: "calc(32 * var(--u))"
  number-column: "calc(434 * var(--u))"
  emboss-column: "calc(226 * var(--u))"
components:
  band:
    backgroundColor: "{colors.board-base}"
    textColor: "{colors.ink}"
    padding: "calc(10 * var(--u)) 0 calc(9 * var(--u))"
  band-newest:
    textColor: "{colors.signal}"
  sticker:
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    padding: "calc(24 * var(--u)) calc(34 * var(--u)) calc(18 * var(--u))"
  pressing-row:
    textColor: "{colors.ink}"
    typography: "{typography.pressing}"
    padding: "calc(3 * var(--u)) 0"
  topbar-nav:
    textColor: "{colors.ink}"
    typography: "{typography.nav}"
  footer:
    textColor: "{colors.ink}"
    typography: "{typography.fact}"
    padding: "calc(14 * var(--u)) 0 calc(20 * var(--u))"
---

# Design System: CyberTech team utilities

> **Scope.** This site has one **shared shell contract** and a **separate visual world per page**. This file records the shell contract (it binds every page) and the **hub world** (`/`, `/en/`, and the 404 page). The product worlds (Ochre, Lidless, Subus) each get their own `src/worlds/<id>/DESIGN.md`: Ochre is recorded in [`src/worlds/ochre/DESIGN.md`](src/worlds/ochre/DESIGN.md) (sidecar `src/worlds/ochre/design.json`). Lidless is recorded in [`src/worlds/lidless/DESIGN.md`](src/worlds/lidless/DESIGN.md) (sidecar `src/worlds/lidless/design.json`); Subus follows later. **Never apply the hub world's ground, faces, catalogue numbers, ink grain, or signal orange to a product page.** Hub tokens are declared only under `:root[data-world='hub']`.

## Overview

**Creative North Star: "The Label Catalogue"**

CyberTech team is presented as a small independent record label, and the hub is its catalogue. Each utility is a numbered release (CT 01, CT 02, CT 03) printed on grey sleeve-board with visible fibre. The page is one stack of full-width bands separated by heavy black rules. A giant catalogue number fills about a third of each band, followed by the app icon blind-embossed into the board, then the release name, one line of copy, a typewriter-mono pressing row (version, date, macOS, licence), four facts, and an arrow at the far right. The whole band is the link. The design deliberately avoids the category default of a hero headline over a row of equal app cards.

The page is dense and printed. Everything is ink on board. Depth comes from raster plates (the board fibre, the embossed icons, the silver-foil mark, the sticker), never from UI chrome. Colour is almost absent: one near-black ink, one softer ink for dividers, the board, and fluorescent orange reserved for the newest release.

There are only two motions: the release lifts out of the board on hover or focus, and one sticker is slapped down on load.

**Key Characteristics:**
- Grey fibre sleeve-board ground (tiled raster, 1024u) and no flat panels.
- Ultra-condensed black display (Anton, plus Oswald 700 for Cyrillic) for catalogue numbers, names, and the masthead.
- JetBrains Mono for copy and pressing data. Fira Sans Extra Condensed 500 for facts and footer.
- Ink-grain mask on display ink, so the board fibre shows through the print.
- Heavy 3u black rules between bands, and 1.5u soft-ink hairlines inside them.
- Fluorescent orange marks only the newest released product.
- Product icons appear as embossed plates and are never shown as flat app icons.
- The desktop layout scales on one unit, `--u = 100vw / 1536`. Below 64rem the layout switches to stacked mobile bands.

## Colors

The palette is ink on grey board. Black does the work, and one fluorescent signal names what is new.

### Primary
- **Fluorescent Signal Orange** (`signal`): fills the newest release's catalogue number and arrow, the text-selection highlight, and (as a raster) the "new release" sticker. Only one band per page carries it. The newest band is the released product with the latest `publishedAt` (`newestReleaseId`).

### Neutral
- **Press Ink** (`ink`): all type, the heavy band rules, the topbar rule, the outlined numbers of unreleased and 404 bands, and the footer divider. It measures about 6:1 against the board.
- **Soft Ink** (`ink-soft`): hairlines only. These are the pressing-row top and bottom rules and the dividers between facts and between promises. It measures about 3.7:1 against the board and is never used for text.
- **Sleeve Board** (`board-base`): the ground colour under `board-texture.webp`. The texture was colour-matched to this neutral (median 148,146,141).

### Named Rules
**The One Signal Rule.** Orange marks only the newest released product: its number, its arrow, and its sticker. No other element, band, or state uses it as a fill or as text.

**The Shell Mirror Rule.** The hub declares `--shell-ink` as `ink`, `--shell-ground` as `board-base`, `--shell-accent` as `signal`, and `--shell-font` as JetBrains Mono. The shell reads only these four values.

## Typography

**Display Font:** Hub Display. This is one family split by unicode-range: Anton 400 for Latin and Oswald 700 for Cyrillic, with Oswald at `size-adjust: 105.2%` so its capitals match Anton's cap height (measured 250 vs 263 at 300px). Fallback: sans-serif.
**Body / Data Font:** JetBrains Mono 400/500 (fallback ui-monospace, monospace).
**Facts Font:** Fira Sans Extra Condensed 500 (fallback sans-serif).

**Character:** A condensed poster grotesk sets the catalogue numbers and names, and a typewriter mono sets the pressing data, like a sleeve's back cover. The extra-condensed grotesk fits short facts into a four-column grid.

### Hierarchy
- **Catalogue number** (400, 254u, line-height 0.96, -0.04em, word-spacing -0.08em, no wrap): CT NN, one per band. Rendered in ink, in signal orange when newest, and as a 3u ink outline (transparent fill) when unreleased. The 404 code reuses this size with a 4u outline.
- **Masthead** (400, 72u, line-height 1, -0.035em): "CyberTech team". It is the `h1` on the hub and a `p` on the 404 page.
- **Headline** (400, 56u, line-height 1, -0.02em): release names, the promises title, and the 404 titles.
- **Nav** (400, max(19u, 13px), +0.14em, uppercase): topbar links and the language switch.
- **Body** (mono 400, max(21u, 15px), line-height 1.2, max 30ch): the one-line release copy. The 404 copy uses 1.3 line-height and max 34ch.
- **Pressing** (mono 400, max(18u, 13px), tabular numerals): version, date, macOS, licence.
- **Label caps** (mono 400, max(20u, 12px), +0.06em, uppercase): masthead tagline. The footer credit uses the same voice at max(14u, 11px), +0.18em.
- **Fact** (Fira Sans Extra Condensed 500, max(17.5u, 12px), line-height 1.12): per-band facts. **Promise** (same face, max(22u, 15px), line-height 1.15): the promises strip. The footer links use the same face at 20u.

### Named Rules
**The One Voice Per Heading Rule.** Display type is always Hub Display, never a system face. Russian headings must stay in the same voice, through the Oswald Cyrillic face and its size-adjust.

**The Pressing Data Rule.** Version, date, OS floor, and licence are set in mono with tabular numerals, between two soft-ink hairlines. They are never set in the display or facts face.

## Layout

**Unit.** At desktop width everything is sized in `--u = calc(100vw / 1536)`, so the composition scales as one plate. A few text sizes have px floors (`max(...)`) to stay legible at small desktop widths. Page gutter: 34u. Band rule: 3u.

**Desktop band** (≥64rem): a grid with columns 434u (number), 226u (emboss), and 1fr (text), with a 32u column gap and items aligned to the start. The arrow is absolutely positioned at the band's right edge (96 × 84u, top 52u). Inside the text column the order is: name row (name, optional sticker, arrow), then the line, the pressing row (36u gaps), and a four-column facts grid with soft-ink dividers.

**Promises strip:** the same 434u first column holds the title, and the four promises sit in a four-column grid. It appears once, below the catalogue.

**404:** a band with columns 380u, 1.3fr, and 1fr: outlined "404", then the Russian text (the only `h1`), then the English text. The full catalogue follows below.

**Mobile** (`max-width: 63.99rem`): `--u` becomes `100vw / 820`, the gutter becomes 16px, and the rule becomes 3px. The topbar stacks and the nav wraps, with the dot separators hidden. Each band becomes a two-row grid: number and emboss on the first row, text on the second. The arrow flows inline at the end of the name row. Facts and promises reflow to two columns. Display sizes switch to clamps (number `clamp(88px, 27vw, 210px)`, name `clamp(34px, 10vw, 56px)`, masthead `clamp(34px, 9vw, 52px)`).

### Named Rules
**The Band Is The Link Rule.** Each release band is one link. The name's anchor stretches over the whole band (`::after`, inset 0). Hover and focus are styled on the band (`:has()`) and not on individual parts.

## Elevation & Depth

The page is flat print on board. Depth is carried by raster plates, which hold their own light: the fibre tile, the embossed icon plates (their edges masked into the board with a 9% linear fade on all four sides), the silver-foil mark, and the paper sticker. Ink is grained by `ink-mask.webp`, applied as a mask on `.ink` elements (catalogue numbers, release names, the promises title, and the 404 code and titles), so the board shows through the print.

### Shadow Vocabulary
- **Lift** (`filter: drop-shadow(0 10u 12u rgb(0 0 0 / 0.28))`): appears only on the emboss plate while its band is hovered or focused.
- **Sticker rest** (`filter: drop-shadow(0 2u 3u rgb(0 0 0 / 0.22))`): the sticker sitting on the board.
- **Sticker slap start** (`drop-shadow(0 16u 18u rgb(0 0 0 / 0.3))`): the first keyframe of the load slap only.

### Named Rules
**The Flat-Board Rule.** Surfaces never get boxes, cards, or box-shadows. A shadow appears only when an object physically leaves the board (a lifted plate or a sticker), and it is always soft and blurred, never a hard offset.

## Shapes

There is no border-radius anywhere in CSS. The silhouette is set by rules: heavy 3u ink rules under the topbar, under every band, and under the promises strip, and 1.5u soft-ink hairlines inside bands. The arrow is drawn in CSS: a 7u shaft and a 54u chevron rotated 45°. The rounded squares of the icons belong to the embossed plates, not to CSS. The sticker is a torn-paper raster (`sticker.png`), rotated -3°.

## Components

### Release band (signature)
- **Structure:** catalogue number, emboss plate (226u, 8u padding, edge-masked), then name, line, pressing row, facts, and arrow.
- **States:** the default band is in ink. The **newest** band shows its number and arrow in signal orange and carries the sticker. An **unreleased** band shows its number as a 3u ink outline, and its pressing row reads "coming soon" with no version or date.
- **Hover / focus (`:has(.band-link:hover, .band-link:focus-visible)`):** the emboss plate rises 6u and gains the Lift shadow, and the arrow advances 12u right. Both use `0.45s cubic-bezier(0.16, 1, 0.3, 1)` on transform and filter.
- **Data-driven:** a new product in the data adds a band. Each product requires `assets/plates/icon-<id>.png` plus an import line in `src/worlds/hub/emboss.ts`, and the validator checks both.

### New-release sticker
- **Style:** Hub Display at 36u, ink text, uppercase, letter-spacing 0, on the `sticker.png` paper plate, rotated -3°, with the Sticker rest shadow.
- **Motion:** one `sticker-slap` on load (0.5s, same ease, 0.3s delay), starting at rotate(-7deg) scale(1.18). It is the page's only load animation.

### Pressing row
- Mono with tabular numerals and 36u gaps, 3u vertical padding, and soft-ink hairlines above and below (1.5u; 1px on mobile).

### Facts and promises
- Each item is a 16×16 single-weight line icon (inline SVG paths, `fill: none`, `stroke: currentColor`, stroke-width 1.6 with square linecaps) plus a condensed label. Fact icons are 30u and promise icons 44u (24px and 28px on mobile). Neighbouring items are separated by a 1.5u soft-ink left border.

### Masthead (hub world, topbar lead slot)
- The silver-foil mark (`foil-mark.png`, 146u, with negative vertical margins so it overhangs the rule), the "CyberTech team" title, and the uppercase mono tagline. The whole group links to the hub.

### Navigation (topbar links slot)
- Utilities, GitHub, and email, followed by the shell's LangSwitch. Items are uppercase Hub Display with +0.14em tracking, separated by middle dots (hidden on mobile). Links have no underline at rest and are underlined on hover. The current language is underlined (2u thickness, 0.18em offset).

### Footer
- In the hub world: Fira Sans Extra Condensed at 20u. The links (GitHub and email) carry 32u icons and are divided by a 2u ink rule with 34u spacing. The credit and year are mono uppercase with +0.18em tracking.

### Shell contract (binds every world, hub and product)
The shell (`src/layouts/Shell.astro`, `src/components/shell/*`) has no colours or fonts of its own.
- **World variables:** each world declares exactly `--shell-ink`, `--shell-ground`, `--shell-accent`, and `--shell-font`, only inside rules scoped to `:root[data-world="<id>"]`. The validator (`src/lib/validate.ts`) enforces this. All world CSS can end up in every page's bundle, so every world-level global style must be scoped the same way. `<html data-world>` is the product id, or `hub` for the hub and 404 pages.
- **TopBar:** a `lead` slot on the left (the world's masthead on the hub, `HubLink` back to the hub on product pages) and a `links` slot on the right, followed by LangSwitch. The 404 page has no LangSwitch.
- **LangSwitch:** "RU / EN". The current language is plain text with `aria-current`, the other is a link to the same page with `hreflang`. It uses no JavaScript.
- **Footer:** GitHub and email on the left, credit and the current UTC year on the right.
- **Download block:** on a product page with a released version, exactly one `[data-download]` element. It contains the release URL link and the version. Unreleased products show no `.dmg` link.
- **Exactly one `h1` per page.** No inline `<script>` without `src` (CSP `script-src 'self'`).

## Do's and Don'ts

### Do:
- **Do** size hub elements in `--u` multiples (1/1536 of the viewport on desktop, 1/820 below 64rem), with px floors on text that must stay legible.
- **Do** give exactly one band the signal orange: the newest released product.
- **Do** add a product to the hub with its data entry and an embossed plate `icon-<id>.png` registered in `emboss.ts`.
- **Do** mask display ink with `ink-mask.webp` (class `ink`) so the board fibre shows through.
- **Do** keep pressing data in mono with tabular numerals between soft-ink hairlines.
- **Do** keep keyboard focus visible against the board at 3:1 or better. Press Ink meets this.
- **Do** guard every hub motion with `prefers-reduced-motion: reduce` (no transitions, no sticker animation).
- **Do** scope every world's tokens and global styles under `:root[data-world="<id>"]` and declare all four `--shell-*` variables.
- **Do** give every shipped raster its provenance (embedded, or a `.json` sidecar beside it).

### Don't:
- **Don't** apply the hub world (board, Hub Display, catalogue numbers, ink mask, signal orange) to product pages. They follow their own `src/worlds/<id>/DESIGN.md`.
- **Don't** use signal orange for states, links, backgrounds, or decoration.
- **Don't** put releases in cards, rounded boxes, or box-shadows. Bands are separated by rules on bare board.
- **Don't** show product icons as flat app icons on the hub. They are embossed plates.
- **Don't** use hard offset shadows. Only soft drop-shadows on objects that leave the board.
- **Don't** add load animations beyond the one sticker slap.
- **Don't** set display type in a system face, or let Cyrillic headings fall back to a different voice.
- **Don't** repeat the promises inside each band. The per-band facts are product-specific, and the promises appear once, in their own strip.

### Recorded deviations from the approved comp
- The Latin display face Anton is wider than the comp's extra-compressed lettering. No measured Latin plus Cyrillic face came closer, and the font-match pass misread the textured comp.
- Per-band product facts and a single promises strip replace the comp's repeated promises.
- The comp's invented "Est." line and slogan were not built.
