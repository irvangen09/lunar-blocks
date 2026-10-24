# Changelog

All notable changes to Moon Blocks are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Indonesian (id_ID) translation, for the settings page, the block editor, and the front end.

### Fixed

- TOC: a post with a table of contents no longer fails to load on hosting where the PHP mbstring extension is missing.

## [0.9.2] - 2026-10-23

### Added

- Gallery, Infobox, and Table images now load at the size they are shown, so pages download less data, most of all on phones.
- The settings page asks for confirmation before you leave it with unsaved changes.

### Changed

- Table Preset 3 and Preset 4: a ticked card now has a struck-through name, muted text, and a faded image instead of fading the whole card, so the text stays easy to read.
- The shared color and spacing styles are now loaded together with the page, which saves one request.

### Fixed

- Callout: the icon is drawn by the stylesheet, so it is no longer lost when a site filters the post content. Screen readers announce the type of the callout.
- TOC: no table of contents is built for a post the visitor cannot read, such as a password-protected post.
- Table: image data left in a cell after changing a column type is treated as an empty cell instead of text.
- Table Preset 3 and Preset 4: the checkbox is added when the page loads, and content saved with an older checkbox does not get a second one.
- Block styles are reloaded after an update instead of coming from the browser cache.
- Block icons in the editor inserter are outlined as intended instead of filled.
- Callout and Table Preset 1: the accent bar and spacing follow the reading direction in right-to-left languages.
- Gallery: the image viewer stays readable in high contrast modes, and image links without alternative text get a name for screen readers.
- Table: keyboard focus skips the hidden header sort buttons on small screens, and a table that scrolls sideways can be focused and scrolled with the keyboard.
- Tabs and Accordion: the page no longer jumps when the blocks finish loading, and an item without a title gets a name for screen readers.
- The plugin now loads on pre-release versions of WordPress, such as 6.9-RC1.
- Deleting the plugin also removes the saved Table of Contents data.

## [0.9.1] - 2026-10-18

### Fixed

- Gallery: the image viewer closes with the Escape key in themes that block it.
- Spacing and column widths keep their size in themes that set a small base font size, such as 10px, instead of shrinking.
- Table Preset 3 and Preset 4: a checkmark drawn by the theme no longer shows next to the checkbox tick, and a card label no longer breaks inside a word.
- Table Preset 3 and Preset 4: an image column that is not the first column shows as a labeled field instead of the text "[object Object]". A table saved this way before this version shows a recovery prompt in the editor and needs to be saved again.

## [0.9.0] - 2026-10-17

### Added

- Table block. Build the table in the editor, choose how many columns and rows to start with, add or remove rows and columns, turn a row into a divider, and set each column to text, number, or image.
- Five styles: Default, Preset 1, Preset 2, Preset 3, and Preset 4. Default is a plain table that scrolls sideways when it is too wide. Preset 1 has a flat header, and on small screens each row becomes a card. Preset 2 shows cards in a grid with their rows lined up, with an optional note beside the title and an optional highlighted line at the bottom. Preset 3 and Preset 4 show one card per row with a checkbox, and Preset 3 adds badges.
- Every table has a search box above it. Rows that do not match are hidden, and a divider is hidden when nothing under it matches. Search and sorting can be turned off for a table.
- Default and Preset 1 can be sorted by clicking a column heading: first ascending, then descending, then back to the original order. Sorting stays inside each group between dividers, and image columns are not sorted. On small screens, Preset 1 has a list to choose the column and a button to reverse the order.
- Image columns show at the width set in "Image width" for the column, in every style, and keep the proportions of the picture. On a narrow screen an image only shrinks when its cell is narrower than that width.
- The checkbox of Preset 3 and Preset 4 is saved in the visitor's browser, and a ticked card is dimmed. Each table uses its own saved ticks, and clearing the browser data clears them.
- Default and Preset 1 can align each column to the left, center, or right.
- Empty or "N/A" values in Preset 2 are shown as a dash, so the cards keep their rows lined up.
- A new success color for the Table checklist tick. It stays green and is not part of the color settings.

## [0.8.0] - 2026-10-16

### Added

- TOC block: a table of contents built from the headings of the post, from H2 to H6, nested by level. Add it once to a post or a template.
- The table of contents appears only when the post has at least two headings. With fewer, nothing is shown, even if the block was added.
- Headings get readable links based on their text, such as `#Planting_Guide`. Letters from any language are kept, repeated headings get `_2`, `_3`, and a link set with HTML Anchor is never changed.
- Accordion item titles that are headings are listed too, and a link to one opens the item. A link to a heading inside a tab opens that tab. Headings inside an Infobox are left out.
- The box starts closed and opens with a plus and minus button, follows the width and fonts of the theme, and highlights the section being read while scrolling.

## [0.7.0] - 2026-10-14

### Added

- Gallery block: images in a grid of two to four columns, each with an optional caption. Small screens always show two columns.
- Clicking an image opens it larger, with Previous and Next buttons, the arrow keys, and Escape to close. Each gallery is its own group, and stepping past the last image continues from the first.
- Each image has an Alternative text field in its settings. It applies to the gallery only, not to the Media Library.
- Clicking an image with Ctrl, Cmd, or Shift held, or with the middle button, still opens the image file normally. Without JavaScript, an image opens its file.

## [0.6.0] - 2026-10-13

### Added

- Info List block: a list of labels and values under a colored top line, with optional Requirements sections. Rows can be added in any order and mixed with Requirements sections.
- Each Info List row can have an icon, chosen by its Dashicons name. Row icons are shown on wide screens only.
- A Requirements section has a title and a list of items. Each item has a marker that defaults to a checkmark. You can type another Dashicons name, or leave the field empty for an item without a marker.
- A Requirements section shows how many items it has, such as "2 requirements". The count follows the number of items automatically and can be turned off.

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
