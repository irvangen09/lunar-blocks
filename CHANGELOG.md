# Changelog

All notable changes to Moon Blocks are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-10-12

### Added

- Infobox block: a single box with an optional image on the left and a table of labels and values on the right, under a title. Without an image, the table uses the full width. The rows share the height of the box, so it never leaves empty space.
- Each Infobox row can have an icon, chosen by its Dashicons name. Icons are shown on wide screens only. On narrow screens the box becomes one column, with the image above the table.
- The Infobox title can be plain text or a heading (H2 to H6). Values can use bold, italic, links, and line breaks.

## [0.4.1] - 2026-10-10

### Fixed

- The selected tab's underline in the Tabs block is now fully visible on every screen, and the tab row no longer shows a small scrollbar.
- No outline box appears around a tab, a panel, or an Accordion title when it is clicked or tapped. The outline for keyboard navigation is unchanged.

## [0.4.0] - 2026-10-10

### Added

- Tabs block: a row of tabs that switches between panels of free-form content. Tabs can be selected with the mouse, touch, or the arrow, Home, and End keys.
- Links to a tab, or to content inside it, open that tab automatically, including tabs nested inside other tabs. In browsers that support it, find-in-page also opens the tab that contains the match.

## [0.3.1] - 2026-10-08

### Fixed

- Callout no longer extends past the content width in themes that do not use `box-sizing: border-box`.
- The Callout label field no longer shows a white background in the editor.

## [0.3.0] - 2026-10-08

### Added

- Accordion block: sections with an editable title and free-form content. Choose the title's heading level (H2 to H6) or plain text.
- Accordion items can start open on desktop and collapsed on mobile, and visitors can always open and close them. Links to an item, or to content inside it, open the item automatically.

## [0.2.0] - 2026-10-06

### Added

- Callout block with four variants: Info, Tips, Warning, and Important. Each variant shows its own icon and an editable label.
- "Moon Blocks" category in the block inserter.

## [0.1.0] - 2026-10-04

### Added

- Initial foundation: the Moon Blocks settings screen with per-block switches and optional Primary, Surface, and Border colors.
