# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static marketing site for AJ's Beer, Wine & Spirits, a liquor store in Carterville, IL. Plain HTML/CSS, no build step, no JavaScript framework, no package manager. Hosted on Netlify, which auto-deploys on every push to `main` (no CI config in this repo — Netlify is configured externally via its own dashboard/GitHub integration).

## Commands

There is no build, lint, or test tooling in this repo — it's hand-authored static HTML/CSS. To preview locally, open any `.html` file directly in a browser, or serve the directory with any static file server (no server-side logic, so anything works: `npx serve`, VS Code Live Server, etc.).

## Architecture

**Multi-page, no templating.** Every page is a standalone `.html` file at the repo root that duplicates the same `<head>`, `<header>` (nav), and `<footer>` markup verbatim. There is no shared partial/include mechanism — when changing the header, nav, or footer, **the edit must be repeated identically across all 7 pages**: `index.html`, `about.html`, `deals.html`, `liquor.html`, `beer.html`, `ready-to-drink.html`, `wine.html`. Category page filenames are flat (not under a `/products/` subdirectory), so all internal links and asset paths (`css/styles.css`, `assets/...`) are relative to the repo root on every page.

**One global stylesheet.** All styles live in `css/styles.css`, organized into commented sections (Header, Nav dropdown, Hero, Category CTAs, Hours & Specials, Deals page, Page header, Placeholder sections, About page, Footer, Responsive) roughly matching page section order. There's no CSS scoping convention beyond descriptive class names — new sections should follow the existing pattern of one comment banner + a handful of classes per section, added near thematically related rules rather than appended at the end.

**Design tokens** are CSS custom properties in `:root` (`--red`, `--ink`, `--off-white`, `--white`, `--font-display` (Archivo), `--font-body` (Inter), `--max-width`). Always reuse these instead of hardcoding colors/fonts. Fonts load from Google Fonts via `<link>` in each page's `<head>`.

**Nav dropdown is CSS-only, no JavaScript anywhere in the site.** The "Products" menu uses a native `<details>`/`<summary>` element (`.nav-dropdown` / `.nav-dropdown-toggle` / `.nav-dropdown-menu`) for open/close, styled differently per breakpoint:
- Desktop (`@media (min-width: 701px)`): floating popover, shown on `:hover` or the native `[open]` state, absolutely positioned and centered under the toggle via `transform: translateX(-50%)`.
- Mobile (`@media (max-width: 700px)`): inline accordion, shown via `display: none/flex` toggled by `[open]`.

These two behaviors are kept in **separate, non-overlapping media queries** deliberately — an earlier bug came from a single global rule setting `transform` on `[open]` that leaked into mobile and visually displaced the menu while leaving it clickable in its original (empty-looking) position. Don't reintroduce shared position/transform rules for `.nav-dropdown-menu` across both breakpoints.

**Mobile nav toggle (hamburger) is also JS-free**, using the checkbox-hack pattern: a hidden `<input type="checkbox" id="nav-toggle">` + `<label for="nav-toggle">` with three `<span>` bars, toggled via `:checked ~` sibling selectors. This markup block must stay identical across all 7 pages' headers.

**Hero image** (`index.html` only): background-image hero with no visible headline (the `<h1>` is present but `.sr-only` for SEO/accessibility) and a single centered CTA anchored to the bottom via flexbox (`align-items: flex-end`) so it sits below the storefront sign in the photo rather than overlapping it. `background-position` is tuned (`35% 35%`) to keep the sign in frame across viewport widths — see the `.hero` rule's `min-height` values (480px desktop / 400px mobile via media query) if adjusting.

**Content patterns already established, reuse rather than inventing new ones:**
- `.page-header` / `.page-header-sub` — the title band used by About, Deals, and all 4 category pages.
- `.placeholder-section` / `.placeholder-inner` — the "coming soon" body used by the 4 category pages, which currently have no real content.
- `.btn` / `.btn-primary` / `.btn-ghost` — the two button styles.
- Deal cards on `deals.html` (`.deal-card`) are each wrapped in HTML comments (`<!-- Deal card N: ... -->` / `<!-- End deal card N -->`) since the site owner edits these regularly with real product data; preserve that comment structure when adding/editing deals.

**Third-party embed**: `deals.html` embeds a Zite (Fillout) email signup form via a snippet the site owner generated externally (`data-zite-id="uqk9ijddp8"` + `server.fillout.com` script). Treat that snippet as opaque/do-not-edit; if its rendered size or behavior needs adjusting, override it with CSS on `.deal-alert-embed` (see the existing `height` override there) rather than modifying the snippet's own attributes.

## Deployment

Pushing to `main` on GitHub (`yogora/ajs-liquorstore-site`) triggers a Netlify deploy automatically. There are no feature branches or PR workflow in use — changes are committed and pushed directly to `main`.
