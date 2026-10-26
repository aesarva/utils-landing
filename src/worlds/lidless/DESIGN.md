---
name: Lidless (product world)
description: The Lidless product page is a broadcast studio wall at night. The lit ON AIR sign is the button and the proof, and the closed laptop under it is still on air.
colors:
  on-air: "#e8302b"
  night: "#140c0a"
  ink: "#f4eee6"
  ink-dim: "#b9b0a8"
  ink-faint: "#8a8079"
  byline: "#929291"
  sign-letter: "#fff1d6"
  sign-letter-off: "#5a2a24"
  meter-stop: "#f0a066"
  tape-ink: "#24170f"
  paper: "#f9f6ef"
  paper-ink: "#151414"
  paper-dim: "#6d6a66"
  paper-mid: "#57534e"
  paper-card-top: "#ebe8e2"
  paper-card-bottom: "#dedad3"
  paper-rule: "#d9d5cd"
typography:
  title:
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif"
    fontSize: "calc(100 * var(--u))"
    fontWeight: 760
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif"
    fontSize: "calc(56 * var(--u))"
    fontWeight: 700
    lineHeight: "calc(57 * var(--u))"
    letterSpacing: "-0.02em"
  section-title:
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif"
    fontSize: "calc(44 * var(--u))"
    fontWeight: 760
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  lede:
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif"
    fontSize: "calc(22 * var(--u))"
    fontWeight: 400
    lineHeight: "calc(29 * var(--u))"
  lead:
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif"
    fontSize: "calc(20 * var(--u))"
    fontWeight: 400
    lineHeight: "calc(29 * var(--u))"
  body:
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif"
    fontSize: "calc(18 * var(--u))"
    fontWeight: 400
    lineHeight: "calc(25 * var(--u))"
  small:
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif"
    fontSize: "calc(16 * var(--u))"
    fontWeight: 400
    lineHeight: "calc(23 * var(--u))"
  control:
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif"
    fontSize: "calc(17 * var(--u))"
    fontWeight: 400
  action:
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif"
    fontSize: "calc(22 * var(--u))"
    fontWeight: 600
  sign-word:
    fontFamily: "'Sofia Sans Extra Condensed', 'Roboto Flex Variable', sans-serif"
    fontSize: "calc(142 * var(--u))"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.035em"
  sign-time:
    fontFamily: "'Sofia Sans Extra Condensed', 'Roboto Flex Variable', sans-serif"
    fontSize: "calc(104 * var(--u))"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  tape-hand:
    fontFamily: "'Neucha', cursive"
    fontSize: "calc(32 * var(--u))"
    fontWeight: 400
rounded:
  card: "calc(18 * var(--u))"
  shot: "calc(16 * var(--u))"
  sign-hit: "calc(14 * var(--u))"
  key-row: "calc(12 * var(--u))"
  key: "calc(10 * var(--u))"
  action: "calc(9 * var(--u))"
spacing:
  unit: "calc(100vw / 1536)"
  unit-mobile: "calc(100vw / 620)"
  page-left: "calc(130 * var(--u))"
  page-right: "calc(113 * var(--u))"
  page-mobile: "16px"
  hero-height: "calc(795 * var(--u))"
  console-left: "calc(762 * var(--u))"
  console-width: "calc(690 * var(--u))"
  controls-width: "calc(486 * var(--u))"
  key-height: "calc(50 * var(--u))"
  section-top: "calc(80 * var(--u))"
components:
  on-air-sign:
    textColor: "{colors.sign-letter}"
    typography: "{typography.sign-word}"
    rounded: "{rounded.sign-hit}"
    width: "{spacing.console-width}"
    height: "calc(236 * var(--u))"
  on-air-sign-off:
    textColor: "{colors.sign-letter-off}"
  session-keys:
    backgroundColor: "rgb(20 16 15 / 0.96)"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.key-row}"
    width: "{spacing.controls-width}"
    height: "{spacing.key-height}"
  closed-lid-key:
    backgroundColor: "rgb(30 23 21 / 0.96)"
    textColor: "{colors.ink}"
    rounded: "{rounded.key}"
    width: "calc(332 * var(--u))"
    height: "{spacing.key-height}"
  closed-lid-key-off:
    textColor: "{colors.ink-faint}"
  step-key:
    backgroundColor: "rgb(30 23 21 / 0.96)"
    textColor: "{colors.ink}"
    rounded: "{rounded.key}"
    size: "calc(48 * var(--u))"
  download:
    backgroundColor: "{colors.on-air}"
    textColor: "#ffffff"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    width: "calc(369 * var(--u))"
    height: "calc(59 * var(--u))"
  tape-caption:
    textColor: "{colors.tape-ink}"
    typography: "{typography.tape-hand}"
    height: "calc(48 * var(--u))"
    padding: "0 calc(24 * var(--u))"
  paper-card:
    backgroundColor: "{colors.paper-card-top}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.card}"
  app-shot:
    rounded: "{rounded.shot}"
---

# Design System: Lidless (product world)

> **Scope.** This file records the Lidless world only: `/lidless/` (ru) and `/en/lidless/` (en), built from `src/worlds/lidless/` (World.astro, motion.ts, copy.ts) and `src/content/products/lidless.yaml`, with release data from `src/data/releases.json`. The shared shell contract and the hub world live in the root `DESIGN.md` and still bind this page. Every token here is declared only under `:root[data-world='lidless']`. **Never carry Lidless's night wall, ON AIR sign, studio plates, paper band or on-air red to the hub or to another product world.** The machine sidecar is `src/worlds/lidless/design.json`. The approved comp is `.impeccable/mocks/decision/lidless/model-pick.png`, and the surface contract is `.impeccable/surfaces/src-worlds-lidless-world-astro.md`.

## Overview

**Creative North Star: "The Studio Wall When the Red Light Is On"**

The first screen is a broadcast studio at night: charcoal acoustic foam, dark wood desk, a closed laptop with its cable, headphones and a microphone at the edge. On the wall hangs one red-glass ON AIR sign with a countdown, and the sign is a real button. Press it and the page goes off air; press again and it comes back on and counts. Under it sit the studio controls: the five session keys (15 min, 1 h, 3 h, Until…, ∞), the closed-lid key, the safety line in an engraved groove, and the red download with live version, size, macOS floor and licence. On the left are the icon, LIDLESS, the byline, the headline, one sentence, and two riveted studio meters (battery with its 20% stop line, heat). A strip of masking tape on the desk edge reads "lid closed · still on air" in a marker hand.

Below the studio the page turns to paper: a warm off-white band ("Safe by design" with the three safety items and the laptop-edge photo), then the recovery table and the security model on the same paper. It then returns to the night wall for the real app screenshots, the menu-bar icon states, and the install steps with the second download.

**Key Characteristics:**
- Night wall (`night`) with a full-bleed studio photo plate behind an absolutely placed hero on comp coordinates.
- One red: the sign's lamp, the on-air state, and the download.
- Roboto Flex variable for every text role, narrowed with `wdth` rather than switching faces. Sofia Sans Extra Condensed only on the sign and console numerals. Neucha only on the tape.
- Physical objects are plates (studio, sign housing, meters, tape, laptop edge, icon). Controls, lettering, rules and the off-state glass are code.
- A paper band (`paper`) for the safety and recovery reading, framed by night above and below.
- One unit, `--u = 100vw / 1536` on desktop and `100vw / 620` under 63.99rem, with px overrides on mobile.
- One motion: the demo sign counts each second and lights or dims in 180 ms.

## Colors

The palette is night wall, warm off-white, one broadcast red, and a warm paper for the reading sections.

### Primary
- **On-Air Red** (`on-air`): the sign's glow (two red drop-shadows bloom past the sign plate onto the wall), the download, and the text selection highlight (white text). The download is painted as a vertical gradient from #f33a33 to #d81f1d. Hover brightens it to #ff4a42 over #e3291f. The download shadow is a red bloom (35%). It is also the shell accent (`--shell-accent`).

### Studio (night)
- **Night Wall** (`night`): page ground, the shell ground, the install section and the footer.
- **Warm Off-White** (`ink`): text, line icons, control lettering, and the focus ring.
- **Dim Ink** (`ink-dim`): the lede-level secondary prose on night (safety line, download meta, captions, app lead, small print).
- **Faint Ink** (`ink-faint`): the footer and the closed-lid key when it is off.
- **Byline Grey** (`byline`): "by CyberTech team" under the title only.
- **Sign Letter** (`sign-letter`): ON AIR and the countdown on lit glass, with a warm halo. **Sign Letter Off** (`sign-letter-off`): the same letters on smoked glass, without a halo.
- **Meter Stop** (`meter-stop`): the "20%" label over the battery meter's stop line. It is orange, not red, and is the only code-drawn chromatic text in the hero.
- **Tape Ink** (`tape-ink`): the handwritten caption on the tape.

### Paper
- **Paper** (`paper`): the "Safe by design" and recovery bands. A 1px #e2ded6 rule separates them.
- **Paper Ink** (`paper-ink`): titles, table cells, line icons and the 2u table-head rule on paper.
- **Paper Dim** (`paper-dim`): the safe-by-design body and the table column heads. It was darkened from the comp's lighter grey to clear AA (about 5:1 on `paper`).
- **Paper Mid** (`paper-mid`): the recovery lead and the security-model text.
- **Paper Card** (`paper-card-top` to `paper-card-bottom`): the safety card and the security card, always as this top-to-bottom gradient. The safety items are divided by 1px #c6c2bb, and table rows by `paper-rule`.

### Named Rules
**The One Red Rule.** Code paints red in three places only: the lamp (the sign plate's glow), the on-air state, and the download. The focus ring is `ink`, not red. Plates and real app screenshots keep their own reds (the meters' heat ramp, the app's sign and toggles in the panel renders), because those are the objects' native colours, not page decoration.

**The Paper Band Rule.** Reading that has to be trusted (safety, recovery, security) sits on `paper` with `paper-ink`. Everything that shows the product working sits on `night`. The page goes night, paper, night, and never alternates more than that.

**The Shell Mirror Rule.** `--shell-ink` = `ink`, `--shell-ground` = `night`, `--shell-accent` = `on-air`, and `--shell-font` = Roboto Flex Variable.

## Typography

**Text Font:** Roboto Flex Variable (fallback system-ui, sans-serif), used across `wght` 380 to 760 and `wdth` 78% to 100%.
**Sign Font:** Sofia Sans Extra Condensed 700 (fallback Roboto Flex Variable, sans-serif).
**Hand Font:** Neucha 400 (fallback cursive).

All three are self-hosted through @fontsource and all three carry Cyrillic.

**Character:** One variable grotesk does every reading job and changes its width instead of changing face: full width for the title and headings, narrowed for prose so the long Russian lines fit the comp's measures. The sign is a tall extra-condensed face, like a lightbox's lettering. The tape is a quick marker hand. Why these: the top-ranked sign face (Bebas Neue) has no Cyrillic, and the ru page shows the app's own sign text «В ЭФИРЕ», so Sofia Sans Extra Condensed (ranked second) sets the sign. Roboto Flex was the highest-ranked headline face with Cyrillic and variable width and weight. Inter was refused as display.

### Hierarchy
- **Title** (760, 100u, line-height 1, −0.02em, cap-trimmed): LIDLESS, the page's only `h1`. 48px on mobile.
- **Headline** (700, 56u/57u, −0.02em, balanced): the tagline. 34px/38px on mobile.
- **Section title** (760, 44u, 1.05, −0.025em): `h2` on paper and night. "Safe by design" is the larger 53u variant. 30px and 34px on mobile. The security-model `h3` is 700 at 22u.
- **Lede** (400, 22u/29u, `wdth` 78%): the one sentence under the headline. 17px/24px at 90% on mobile.
- **Lead** (400, 20u/29u, `wdth` 86%): section leads and the safety line on paper. The safe-by-design body is 380 at 92% in `paper-dim`.
- **Body** (400, 18u): the page default and the recovery table (18u/25u).
- **Small** (400, 16u/23u, `wdth` 90%): install meta. Captions are 17u/24u at 86%. The safety line on night is 15.5u at 92%, −0.01em.
- **Control** (17u): session keys, with the active key at 650 and ∞ at 24u. The closed-lid key is 19u.
- **Action** (600, 22u): the download label. 17px on mobile.
- **Sign word** (Sofia 700, 142u, +0.035em) and **sign time** (Sofia 700, 104u, −0.02em), cap-trimmed. In Russian the word is 124u at +0.01em and the time is 96u. On mobile they are 60px and 46px in both languages. Step numbers and the "coming soon" state also use Sofia 700.
- **Tape hand** (Neucha 400, 32u, `tape-ink`): the caption only. 24px on mobile.

### Named Rules
**The Narrow Not Swap Rule.** To fit a measure, reduce Roboto Flex's width (`font-stretch` 78% to 92%), never switch to a second text face. Headings stay at full width.

**The Sign Face Rule.** Sofia Sans Extra Condensed sets the sign and the console's numerals (step keys, "coming soon"), never prose or headings. Neucha sets only the tape.

**The Per-Language Sign Rule.** The sign's lettering is placed per language on the plate's coordinates. EN: the word at (84u, 75u) and the time at (454u, 87u), with the divider at 421u. RU: «В ЭФИРЕ» at (54u, 82u), 124u, and the time at (482u, 92u), 96u, with the divider at 457u. A new language gets its own coordinates rather than a shrunk copy of English.

## Layout

**Unit.** On desktop everything is sized in `--u = calc(100vw / 1536)`, so the page scales as one plate of the comp (1536 × 1024). Under `max-width: 63.99rem`, `--u` becomes `calc(100vw / 620)`, and every text size, key and control switches to a fixed px value (body 16px, title 48px, keys 46px tall) so the page stays legible on a phone.

**Desktop hero.** The hero is 795u tall and overflows hidden. The studio plate covers it (`object-fit: cover`). Every other hero child is absolutely positioned at its comp coordinates: the name block at (133u, 83u) with a 136u icon and a 33u gap; the headline at (137u, 247u), 600u wide; the lede at (138u, 368u), 612u wide; the meters at (190u, 437u), battery 262u and heat 282u with a 20u gap; the console at (762u, 72u), 690u wide, a centred column. Inside the console the keys, the safety line and the download are shifted 8u left, onto the comp's axis at x = 1099. The tape caption is centred at x = 748u, top 713u. The topbar lies over the photo, 55u tall, with a 655u hairline under its left half.

**Mobile hero (≤63.99rem).** The hero becomes one flow with 76px top and 16px side padding: name, headline, lede, then the console (sign, keys, safety line, full-width download), then the meters side by side, then the tape. The studio plate is 760px wide, anchored to the hero's bottom (shifted −47% so the laptop sits centred), with `mask-image: linear-gradient(transparent, #000 40%)`, so the top of the photo dissolves into the night wall and the desk with the closed laptop lands between the meters and the tape. A night gradient overlay (55% to 10%) keeps the text legible. The tape sits 132px below the meters with a −22px bottom margin, on the desk edge.

**Below the hero.** Sections are padded 130u left and 113u right (16px on mobile). The safety band is a grid of text and a 606u card (80u gap), with the card flush to the band's bottom edge. Recovery is text and a 420u security card (90u gap). The app section is three screenshot columns (40u gap), then the menu-bar strip at 536u. A muted copy of the studio plate (22% opacity, 560u tall, masked to transparent) continues the wall behind it. Install is steps and a 400u side column (80u gap). On mobile all grids go to one column, and screenshots stack at a 340px max width.

### Named Rules
**The Comp Coordinates Rule.** On desktop the hero is a plate with children placed at the comp's measured boxes in `--u`. Do not convert it to a flex or grid hero, and keep the console's 8u axis shift.

## Elevation & Depth

Depth comes from light, not from cards lifting off the page. The sign glows onto the wall, the keys are dark glass recessed into it, and the safety line sits in a groove cut into the console.

### Shadow Vocabulary
- **Sign glow** (`drop-shadow(0 0 36u rgb(232 48 43 / 0.45)) drop-shadow(0 30u 50u rgb(232 48 43 / 0.25))`): on the sign plate while on air only. Removed off air.
- **Sign letter halo** (`0 0 12u rgb(255 210 170 / 0.5), 0 0 2u rgb(255 240 220 / 0.7)`): on air only.
- **Key ring** (`inset 0 0 0 1px rgb(244 238 230 / 0.28)`): session keys, the closed-lid key and step keys. Session separators are `inset 1px 0 0` at 22%.
- **Engraved groove** (a 1px #676561 top border with `0 -1px 0 #090301, inset 0 1px 0 #544f4e, inset 0 2px 0 #0a0302`): the rule above the safety line. It reads as a light edge over a dark cut, near black at its edges.
- **Download** (`inset 0 1px 0 rgb(255 255 255 / 0.25), 0 8u 24u rgb(232 48 43 / 0.35)`): a red bloom, not a grey drop.
- **Screenshot** (`0 0 0 1px rgb(244 238 230 / 0.12), 0 20u 50u rgb(0 0 0 / 0.55)`): app renders on night.

### Named Rules
**The Engraved Groove Rule.** Rules inside the studio console are cut, not drawn: a light edge over a dark line, as the comp shows. A flat grey hairline is wrong here. The topbar hairline (16% ink) and the paper rules are plain because they are not on the console.

**The Glow Is State Rule.** Red light on the wall exists only while the sign is on air. Off air, the plate's filter, the letter halo and the red divider all go out.

## Shapes

Soft rectangles, stepped by scale: paper cards 18u (14px on mobile), screenshots 16u (12px), the sign's hit area 14u, the session row 12u, the closed-lid and step keys 10u (8px), and the download 9u. The safety card is rounded only at the top, because it stands on the band's bottom edge. The sign's outline comes from its plate, so it is not drawn in CSS.

## Components

### ON AIR sign (signature)
- A `<button aria-pressed>` over the sign plate (`assets/plates/lidless-sign.png`: housing, rivets and lit textured red glass, without lettering). The word and the countdown are live text in Sofia, placed per language, with a 2u divider (`rgb(255 220 200 / 0.5)`, or `rgb(120 50 40 / 0.4)` off air).
- **Off air:** a smoked layer (`radial-gradient(#2a0907, #120403)` at 94% opacity, inset 9% 4.2% 11%) covers the glass of the same plate. There is no second plate. The letters drop to `sign-letter-off`, and the glow and halo go out.
- A visually hidden hint explains that it is a demo of the app's sign. On mobile it is 124px tall, and the word and time flow side by side with an 18px border-left divider.

### Studio controls
- **Session keys:** one 486 × 50u row on 96% dark glass with the key ring, five columns (1.1, 0.9, 0.9, 1.1, 1.05 fr), labels from the app's strings. The active key is `aria-pressed` and set at weight 650. Demo default: 1 h.
- **Closed-lid key:** 332 × 50u, an inline laptop line icon (30 × 20u, stroke 1.6), `aria-pressed`. Off is `ink-faint`.
- **Safety line:** one line under the engraved groove, `ink-dim`, wrapping in Russian and on mobile.
- **Step keys:** the install numbers reuse the closed-lid key's glass and ring at 48u, with numerals in Sofia.

### Studio meters (plates)
- Battery and heat are riveted meter plates with their LED segments and stop lines drawn in. Only the labels ("Battery", "Heat") and the "20%" stop label are text, positioned by percentage of the plate (the stop label at 36.8% × 36.5%, the labels 11% from the bottom). The heat label is shifted 22u right toward its scale. The meters are `aria-hidden`; the safety line states the same facts in text.

### Download (`download`)
- On-air red gradient, 369 × 59u, 9u radius, an inline download arrow SVG (26u, stroke 2), white label at 600. Below it is one `ink-dim` meta line: version · size · macOS floor · licence, all from `releases.json` and the product YAML. The hero download carries the shell's `data-download`. Unreleased products show "coming soon" in Sofia caps with no link. The second download sits in the install side column.

### Tape caption
- The tape plate stretched behind the caption (min 320u, 48u tall, 24u padding), with Neucha text in `tape-ink`, centred on the desk edge.

### Paper band
- **Safety card:** a paper-card gradient with three items (inline line icons at 32u, stroke 1.8, `paper-ink`; two-line labels at 16u/21u) divided by hairlines. The laptop-edge photo plate sits flush at the bottom.
- **Recovery table:** If/Then columns, a 2u `paper-ink` head rule, `paper-rule` row lines, and the first column at 46% and weight 600.
- **Security card:** the same paper-card gradient at 18u radius with bold `paper-ink` titles over `paper-mid` text.

### App screenshots and menu bar
- Three real panel renders (timer, in Russian on the ru page; indefinite; safety) at 16u radius with the screenshot shadow, captions in `ink-dim`. The menu-bar strip (`menubar-dark.png`) is shown unframed at 536u.

### Shell parts in this world
- **Topbar:** absolute over the studio plate. The hub link "All utilities" is set at 500/17.5u in `ink`; RU/EN at 16u and `wdth` 80%, with the current language bold. Under the left half is a 16% ink hairline.
- **Footer:** `ink-faint` at 15u on `night` above a 10% ink rule. Hover goes to `ink`.

### Motion contract (`motion.ts`)
- **Start state:** server-rendered on air, 1 h selected, the sign reading 59:58. Without JS the sign stays lit at that time.
- **Tick:** every 1000 ms the countdown re-renders from wall time (`m:ss` under an hour, `h:mm:ss` from an hour up).
- **Sessions:** a key restarts the session: 15 min, 1 h, 3 h, Until… (seconds to the next full hour, at least a minute, otherwise plus an hour), or ∞, which counts time on air upward from the press.
- **Sign press:** on air goes off air. Off air goes back on air with the selected session restarted. A countdown reaching zero turns the sign off.
- **Light:** the smoked layer's opacity, letter colour and halo transition over 180 ms ease-out, like a lamp.
- **Pause:** no render while the sign is off screen (IntersectionObserver) or the document is hidden.
- **Reduced motion:** with `prefers-reduced-motion: reduce` the 180 ms transitions are none. The countdown still steps once a second, because it is state, not animation.
- Nothing on the page keeps a Mac awake. The sign is a demonstration only, and its hint says so.

## Do's and Don'ts

### Do:
- **Do** size in `--u` on desktop and switch to px under 63.99rem for every text, key and control.
- **Do** place hero elements at comp coordinates on desktop, and on mobile anchor the studio plate to the hero bottom with a masked top.
- **Do** narrow Roboto Flex with `wdth` to fit a measure.
- **Do** give each language its own sign coordinates and sizes.
- **Do** draw physical objects as plates with provenance and draw lettering, controls, rules and states in code over them.
- **Do** cut console rules as the engraved groove.
- **Do** put trust reading (safety, recovery, security) on the paper band and product proof on the night wall.
- **Do** take version, size, macOS floor and licence from `releases.json` and the product YAML, never from the comp.
- **Do** source every raster with provenance (`src/assets/products/lidless/SOURCE.json`, the plates' embedded `impeccable:prompt` text and `.json` sidecars).

### Don't:
- **Don't** paint red in code anywhere but the lamp, the on-air state and the download (selection excepted).
- **Don't** add a second sign plate for the off state. Smoke the glass of the same plate.
- **Don't** set prose or headings in Sofia Sans Extra Condensed, or anything but the tape in Neucha.
- **Don't** draw a flat hairline where the console's groove belongs.
- **Don't** invent claims. Copy comes from the app's README and README.ru, and sign, session and meter labels come from the app's strings.
- **Don't** apply hub materials (board fibre, Hub Display, ink mask, signal orange) or Ochre's graphite, flaps or mustard here.

### Recorded deviations from the approved comp
- **The real app icon.** The page ships the actual Lidless beacon icon, rendered from `lidless/App/Resources/AppIcon.icon` with ictool (`assets/plates/lidless-icon.png.json`). The app adopted this icon in v0.4.1.
- **Live version data.** The comp printed v0.4.0 · 6.8 MB. The meta line reads `releases.json`, which is currently v0.4.1 at 6.7 MB.
- **README-true copy.** The safe-by-design body ("Quit, crash, force-quit or reboot: normal sleep always comes back.") and the lede follow the README, not the comp's paraphrase ("productive without compromising its health").
- **Darker safe-body grey.** The comp's light grey was darkened to `paper-dim` (about 5:1 on paper). The body is therefore visibly heavier than the comp.
- **The demo sign.** The comp's sign was a picture. The build's sign is a working button with a live countdown, sessions, ∞ and Until…, as in the app.
