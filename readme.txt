=== Moon Blocks ===
Tags: blocks, gutenberg, documentation, wiki, knowledge base
Requires at least: 6.9
Requires PHP: 8.0
Stable tag: 0.7.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Lightweight Gutenberg blocks for documentation, wiki, and knowledge base websites that adapt to any theme.

== Description ==

Moon Blocks is a collection of Gutenberg blocks made for documentation, wiki, and knowledge base websites.

It is designed to blend into your site. Typography and colors come from your theme, and there is no separate dark mode to maintain. Block styles and scripts are loaded only on pages that use the block.

**Blocks**

* **Accordion** groups content into sections that visitors can open and close. Items can start open on wide screens and collapsed on mobile, and a link to an item opens it automatically.
* **Callout** highlights a note, tip, warning, or important point. Each variant has its own icon and an editable label.
* **Gallery** shows a set of images in a grid of two to four columns, each with an optional caption. Visitors click an image to view it larger, then move between the images of that gallery with buttons or the arrow keys. Small screens always show two columns. Each image has its own alternative text field.
* **Infobox** shows the key facts about one subject, such as a character, an item, or a place, in a single box: an optional image beside a table of labels and values, under a title. Each row can have an icon. On narrow screens the image moves above the table.
* **Info List** shows a compact list of labels and values for a page, such as the details of an event, with optional Requirements sections that hold checklist-style items. Each row can have an icon, and each requirement has a marker that defaults to a checkmark. The count of requirements is added for you and can be turned off.
* **Tabs** organizes content into panels that visitors switch between with a row of tabs. Tabs work with the keyboard, and a link to a tab, or to content inside it, opens that tab automatically. Without JavaScript, all panels are shown one after another.

**Settings**

* Turn individual blocks on or off. A disabled block is not registered and loads no CSS or JavaScript.
* Optionally set three colors: Primary, Surface, and Border. Colors you leave empty follow your theme.

== Installation ==

1. Upload the `moon-blocks` folder to the `/wp-content/plugins/` directory, or install the plugin from the Plugins screen.
2. Activate the plugin through the Plugins screen.
3. Go to Settings > Moon Blocks to choose which blocks are available and to adjust colors.

== Frequently Asked Questions ==

= Will it match my theme? =

Yes. Fonts and text colors are inherited from your theme, and the default accent, surface, and border colors are derived from your theme's text color.

= Can I turn off blocks I do not use? =

Yes. Open Settings > Moon Blocks > Blocks and switch off any block. Turning off a block also turns off the blocks that belong to it.

= Can I change the colors? =

Yes. Open Settings > Moon Blocks > Appearance to set Primary, Surface, and Border. Please make sure the colors you choose have enough contrast with your theme.

== Changelog ==

= 0.7.0 =

* Added the Gallery block: images in a grid of two to four columns, each with an optional caption. Small screens always show two columns.
* Clicking an image opens it larger, with Previous and Next buttons, the arrow keys, and Escape to close. Each gallery is its own group, and stepping past the last image continues from the first.
* Each image has an Alternative text field in its settings. It applies to the gallery only, not to the Media Library.
* Clicking an image with Ctrl, Cmd, or Shift held, or with the middle button, still opens the image file normally. Without JavaScript, an image opens its file.

= 0.6.0 =

* Added the Info List block: a list of labels and values under a colored top line, with optional Requirements sections. Rows can be added in any order and mixed with Requirements sections.
* Each Info List row can have an icon, chosen by its Dashicons name. Row icons are shown on wide screens only.
* A Requirements section has a title and a list of items. Each item has a marker that defaults to a checkmark. You can type another Dashicons name, or leave the field empty for an item without a marker.
* A Requirements section shows how many items it has, such as "2 requirements". The count follows the number of items automatically and can be turned off.

= 0.5.0 =

* Added the Infobox block: a single box with an optional image on the left and a table of labels and values on the right, under a title. Without an image, the table uses the full width. The rows share the height of the box, so it never leaves empty space.
* Each Infobox row can have an icon, chosen by its Dashicons name. Icons are shown on wide screens only. On narrow screens the box becomes one column, with the image above the table.
* The Infobox title can be plain text or a heading (H2 to H6). Values can use bold, italic, links, and line breaks.

= 0.4.1 =

* Fixed the selected tab's underline in the Tabs block: it is now fully visible on every screen, and the tab row no longer shows a small scrollbar.
* Fixed an outline box appearing around a tab, a panel, or an Accordion title when it is clicked or tapped. The outline for keyboard navigation is unchanged.

= 0.4.0 =

* Added the Tabs block: a row of tabs that switches between panels of free-form content. Tabs can be selected with the mouse, touch, or the arrow, Home, and End keys.
* Links to a tab, or to content inside it, open that tab automatically, including tabs nested inside other tabs. In browsers that support it, find-in-page also opens the tab that contains the match.

= 0.3.1 =

* Fixed the Callout block extending past the content width in themes that do not use border-box sizing.
* Fixed a white background behind the Callout label field in the editor.

= 0.3.0 =

* Added the Accordion block: sections with an editable title and free-form content. Choose the title's heading level (H2 to H6) or plain text.
* Accordion items can start open on desktop and collapsed on mobile, and visitors can always open and close them. Links to an item, or to content inside it, open the item automatically.

= 0.2.0 =

* Added the Callout block with four variants: Info, Tips, Warning, and Important. Each variant shows its own icon and an editable label.
* Added a "Moon Blocks" category to the block inserter.

= 0.1.0 =

* Initial foundation: the Moon Blocks settings screen with per-block switches and optional Primary, Surface, and Border colors.
