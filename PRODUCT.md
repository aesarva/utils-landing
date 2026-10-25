# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7, static build (decided with the user, spec `docs/superpowers/specs/2026-10-24-utils-landing-design.md`). Routes: `/` and `/en/` (hub), `/<id>/` and `/en/<id>/` (product pages). Each product page is its own visual world in `src/worlds/<id>/`; the hub world lives in `src/worlds/hub/`. A thin shared shell (`src/layouts/Shell.astro`, `src/components/shell/*`: language switch, link back to the hub, footer) carries no colours or fonts of its own and takes `--shell-ink`, `--shell-ground`, `--shell-accent`, `--shell-font` from the world, declared under `:root[data-world="<id>"]`. The download block carries `data-download` and renders version, size and requirements from `src/data/releases.json`, which the build refreshes from GitHub Releases. Deployed to `https://utils.cyber-tech.online` from the `develop` branch. No JavaScript is required for any content or navigation; CSP allows only same-origin scripts, no inline scripts.

## Users

Mac owners, Russian- and English-speaking, who arrive from a product's GitHub page, a link shared by a friend, or search. Most come for one specific app; some are browsing what else the team makes. Their job on the site: understand in seconds what an app does for them, trust that it is safe to install, and download it. Technical depth varies from developers to everyday owners; the first impression must work for both.

## Product Purpose

The site presents the macOS menu-bar utilities made by CyberTech team: a hub listing every product and a page per product. Success: a visitor reaches the right app, understands what it does, and downloads the current signed DMG; the hub makes the other apps discoverable. New products are added as data plus a world, without redesigning the hub.

## Positioning

A small team of indie developers making native Mac utilities for themselves and releasing them. Promises the hub may make on behalf of every product (true for all current products, and a condition for future ones):

- free and open source (Ochre — MIT; Lidless and Subus — GPL-3.0);
- local and private: no accounts, no analytics; the network is touched only for update checks (and, for Subus, Central Bank of Russia exchange rates);
- native (SwiftUI/AppKit, no Electron), living in the macOS menu bar;
- signed with Developer ID, notarized by Apple, self-updating via Sparkle.

Each product keeps its own identity: Ochre — a departure board for the Mac's chip; Lidless — a broadcast studio with an ON AIR sign; Subus — a transit line map of upcoming charges.

## Operating Context

Visitors read on desktop Macs (the download target) and on phones (often from a shared link, to download later). Two languages with a switcher on every page; Russian is the default at `/`, English at `/en/`. Downloads go straight to GitHub Releases assets. Facts about each product come from its own repository (`../ochre`, `../lidless`, `../subus`, `develop` branch): README ru/en, CHANGELOG, PRODUCT.md, DESIGN.md and real screenshots in `docs/images`.

## Capabilities and Constraints

- Products today: Ochre (system monitor, macOS 26+), Lidless (keep-awake incl. closed lid, macOS 14+), Subus (subscription tracker, macOS 14+); all universal (Apple Silicon and Intel). More will be added.
- Version, download URL, size and release date are data, never hard-coded in copy; a product without a published release shows «Скоро» / «Coming soon».
- Contact: email aesarva@pm.me and GitHub (https://github.com/aesarva). No forms, newsletter, donations or other channels.
- No cookies, analytics or third-party requests from the site; fonts and images are self-hosted.

## Brand Commitments

- Name: **CyberTech team**. No logo or mark exists yet; the user asked for one to be created (generated with Codex gpt-image) as part of the hub world.
- Product names, icons and visual worlds belong to the products (see each product's DESIGN.md); the hub must not restyle them into one look.

## Evidence on Hand

- Real app screenshots and icons per product, synced into `src/assets/products/<id>/` from the product repositories.
- Ochre's measured idle cost: about 0.5% of one core and 14 MB of memory (M5 Pro, per its README).
- Lidless's closed-lid hardware checklist passed on a real MacBook for 0.3.0 (per its PRODUCT.md).
- Public signed releases on GitHub for all three products.
- Absent, must not be fabricated: testimonials, press, user or download counts, ratings, benchmarks against other apps, company history, team photos, pricing.

## Product Principles

1. Get the visitor to the right app and its download fast; everything else is secondary.
2. Trust is earned with facts that are true for every product: free, open source, private, native, signed and notarized.
3. Each product speaks in its own world; the hub frames them without flattening them.
4. Honest data: versions and availability come from real releases; nothing is invented.
5. Built to grow: a new product is data plus a world, not a redesign.

## Accessibility & Inclusion

WCAG 2.2 AA: semantic structure (one h1 per page), keyboard navigation, visible focus, sufficient contrast, `prefers-reduced-motion` respected, correct `lang` on bilingual content, all content readable without JavaScript.
