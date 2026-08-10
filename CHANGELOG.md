# Changelog

All notable changes to Lunar Blocks are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-08-10

### Added
- **Table of Contents** block (`lunar-blocks/toc`) — dynamic block that builds an automatic, nested table of contents from the headings in an article (including Accordion Item titles), with direct jump-to-section links. `Heading_Injector` injects stable `id` attributes into the original headings and Accordion Item titles so the generated links actually work, gated to only run on pages that contain a Table of Contents block. `Heading_Anchors` and `Accordion_Item_Title` are supporting shared services used by both the builder and the injector.
- **Table** block (`src/table/`) — a single block (no child blocks) with three render presets: Standard (plain table), Style 1 — Field List (a two-column stacked layout on mobile, label left / value right), and Style 2 — Catalog Card (a responsive card grid, on any screen width). A contextual toolbar handles row/column actions (insert before/after, delete, change column type, toggle a row as a section divider), image-type columns use the native media library, and an empty-state form creates a starting grid. A frontend enhancement adds sort (scoped within each divider-separated group of rows, skipped for the card layout) and search (working across both render paths), with `aria-sort` kept in sync on sortable headers for assistive tech.

### Known Issues
- The Table of Contents box doesn't show a consistent visual distinction from the page background on at least one staging environment, despite the underlying code and CSS token being verified correct on the server. Being investigated further during a dedicated refactor pass once every block is built.

## [1.1.0] - 2026-08-09

### Added
- **Accordion** block family (`src/accordion/`) — parent/child pair (Accordion, Accordion Item) rendering sections that collapse on mobile and stay flat/always-open on desktop (≥768px). Introduces `view.js` (via `viewScript`), the first Lunar Blocks block with frontend-only interactive JS, which sets the native `<details>` `open` attribute based on screen width — a pure-CSS approach isn't reliable here since browsers lock the open/closed state of `<details>` for accessibility consistency.
- **Tabs** block family (`src/tabs/`) — parent/child pair (Tabs, Tab Item) rendering a set of parallel content sections switched via a horizontal tab menu. Ships with a plain, fully-readable no-JS fallback (all panels stacked, labels as plain text) and a `view.js` progressive enhancement that builds a WAI-ARIA APG-compliant tab widget (`role="tablist"`/`"tab"`/`"tabpanel"`, roving `tabindex`, click and Left/Right/Home/End keyboard navigation) at runtime. Unlike earlier blocks, its color/font-family token fallbacks were neutralized from the initial implementation rather than needing a later fix pass, and its InnerBlocks content wrapper does not force a fixed `font-size` onto nested content. A redundant `:focus-visible` outline on the tab control was intentionally omitted, since the active tab's underline already conveys focus/selection state without extra visual noise across host themes.
- **Steps** block family (`src/steps/`) — parent/child pair (Steps, Step) rendering a numbered sequence of instructions. Simplest architecture in this group: numbering and the connecting line between steps are pure CSS counters, with no `view.js`, `viewScript`, or `render.php` involved at all. Its number badge introduces a new accent-token usage — `--color-accent` as a solid `background-color` fill rather than a text/border/icon color — falling back to a neutral solid gray instead of `currentColor`, since a background fill needs a predictable, high-contrast value rather than one that inherits from surrounding text color.

### Fixed
- Neutralized color and font-family fallback values (`var(--token, fallback)`) in Accordion's styles — border and accent colors now fall back to `currentColor`, heading/text color and font-family fall back to `inherit`, instead of Lunar's own brand hex/serif values. This lets the block blend into whichever theme is active when Lunar Theme isn't installed, with zero effect on its appearance once Lunar Theme defines the real tokens.
- Applied the same fallback neutralization retroactively to **Callout** and **Definition List**, plus two additional cases not covered by the original pass: surface/background colors now fall back to `transparent` instead of Lunar's cream brand tint, and Callout's per-variant accent colors (Info, Tips, Warning, Important) now fall back to distinguishable WordPress core notice colors instead of Lunar's brand hex, keeping the four variants visually distinct without imposing brand identity on host themes.
- Removed a hardcoded `font-size` on Accordion's InnerBlocks content wrapper (`.lunar-accordion-item__content`) that was overriding the font size of nested paragraph/list content regardless of the active theme.
- Removed the hardcoded `font-size`/`font-weight` on Accordion's item title (`.lunar-accordion-item__title`) so it inherits typography from its semantic heading tag and the active theme's heading styles, instead of a fixed Lunar-specific size that could end up visually smaller than the surrounding content.
- Removed a redundant `:focus-visible` outline on Tabs' tab control (`.lunar-tabs__tab`), found during cross-theme testing to add visual noise without conveying any information beyond what the existing active-state underline already provides.

## [1.0.0] - 2026-08-06

### Added
- Plugin skeleton: main plugin file (`lunar-blocks.php`) with standard header metadata, a PHP-version environment check, a root-level `Lunar\` namespace autoloader, and a `plugins_loaded` bootstrap.
- `lunar-blocks` block-inserter category registration (`includes/Blocks/class-categories.php`), ported from the pre-split LunarCore implementation.
- Build tooling via `@wordpress/scripts` (`package.json`), with `build`, `start`, and `plugin-zip` scripts and an explicit `files` field for packaging.
- Global Settings foundation: per-block enable/disable.
  - `includes/Blocks/class-registry.php` — discovers built blocks by recursively scanning `build/` for `block.json`, resolves parent/child relationships from each block's own `"parent"` declaration, and registers only currently-active top-level (and their child) blocks. Disabled blocks are not registered at all: removed from the inserter, and their CSS/JS are never enqueued.
  - `includes/Blocks/class-settings.php` — registers the top-level "Lunar Blocks" admin menu and the `lunar-blocks/v1/blocks` REST endpoint (GET to list blocks/state, POST to save which are enabled) backing the settings screen.
  - `src/admin/` — React admin app (`@wordpress/components`, `@wordpress/api-fetch`) rendering the block toggle list at the "Lunar Blocks" admin page.
  - `webpack.config.js` — extends the default `@wordpress/scripts` config to add the `admin/index` entry alongside automatic block discovery.
  - New option `lunar_blocks_disabled_blocks`, cleaned up on uninstall (`uninstall.php`).
- Repository hygiene: `.gitignore`, `.editorconfig`, `phpcs.xml` (WordPress-Extra ruleset), `LICENSE.md`, `languages/.gitkeep`.
- **Callout** block (`src/callout/`) — inline highlighted note with four variants (Info, Tips, Warning, Important) and rich-text content.
- **Definition List** block family (`src/definition-list/`) — parent/child pair (Definition List, Definition Item) rendering paired terms and definitions as semantic `<dl>`/`<dt>`/`<dd>`.
- **Version/Patch Tag** RichText Format (`src/version-tag/`) — inline badge (Added, Changed, Removed) insertable from the text-selection toolbar. `includes/Blocks/class-formats.php` handles its editor script and editor+frontend style enqueueing, since Formats don't use the block-registration asset pipeline.
- Manual `version-tag/index` entry in `webpack.config.js`, alongside the existing `admin/index` entry, since Formats have no `block.json` for automatic discovery.

### Changed
- `lunar-blocks.php` bootstrap now also initializes `Registry` and `Settings`.
- Added the missing `Requires at least: 6.5` header field.
- `lunar-blocks.php` bootstrap now also initializes `Formats`.