=== Lunar Blocks ===
Tags: blocks, gutenberg, documentation, wiki, knowledge base
Requires at least: 6.9
Tested up to: 7.1
Requires PHP: 8.0
Stable tag: 2.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Lightweight Gutenberg blocks for documentation, wiki, and knowledge base websites that adapt to any theme.

== Description ==

Lunar Blocks is a collection of Gutenberg blocks made for documentation, wiki, and knowledge base websites.

It is designed to blend into your site. Typography and colors come from your theme, and there is no separate dark mode to maintain. Block styles and scripts are loaded only on pages that use the block.

**Blocks**

* **Accordion** groups content into sections that visitors can open and close. Items start collapsed and can be set to start open on wide screens, and a link to an item opens it automatically.
* **Callout** highlights a note, tip, warning, or important point. Each variant has its own icon and an editable label.
* **Gallery** shows a set of images in a grid of two to four columns, each with an optional caption. Visitors click an image to view it larger, then move between the images of that gallery with buttons or the arrow keys. Small screens always show two columns. Each image has its own alternative text field.
* **Infobox** shows the key facts about one subject, such as a character, an item, or a place, in a single box: an optional image beside a table of labels and values, under a title. Each row can have an icon. On narrow screens the image moves above the table.
* **Info List** shows a compact list of labels and values for a page, such as the details of an event, with optional Requirements sections that hold checklist-style items. Each row can have an icon, and each requirement has a marker that defaults to a checkmark. The count of requirements is added for you and can be turned off.
* **Table** shows rows of information as a table or as cards, in five styles. Visitors can search every table, and click a column heading to sort it. Rows can be grouped under dividers, and image columns keep the width you set. Two styles are made for lists such as recipes, with a checklist that visitors can tick and the browser remembers.
* **Tabs** organizes content into panels that visitors switch between with a row of tabs. Tabs work with the keyboard, and a link to a tab, or to content inside it, opens that tab automatically. Without JavaScript, all panels are shown one after another.
* **TOC** adds a table of contents built from the headings of the post (H2 to H6), nested by level. It appears once the post has at least two headings, starts closed and can be opened with a click, and highlights the section being read. Headings get readable links such as `#Planting_Guide`, and a link to a heading inside an Accordion item or a tab opens it automatically.

**Settings**

* Turn individual blocks on or off. A disabled block is not registered and loads no CSS or JavaScript.
* Optionally set three colors: Primary, Surface, and Border. Colors you leave empty follow your theme.

== Installation ==

1. Upload the `lunar-blocks` folder to the `/wp-content/plugins/` directory, or install the plugin from the Plugins screen.
2. Activate the plugin through the Plugins screen.
3. Go to Settings > Lunar Blocks to choose which blocks are available and to adjust colors.

== Frequently Asked Questions ==

= Will it match my theme? =

Yes. Fonts and text colors are inherited from your theme, and the default accent, surface, and border colors are derived from your theme's text color.

= Can I turn off blocks I do not use? =

Yes. Open Settings > Lunar Blocks > Blocks and switch off any block. Turning off a block also turns off the blocks that belong to it.

= Can I change the colors? =

Yes. Open Settings > Lunar Blocks > Appearance to set Primary, Surface, and Border. Please make sure the colors you choose have enough contrast with your theme. The tick of the Table checklist stays green.

== Changelog ==

= 2.0.0 =

* Moon Blocks is now Lunar Blocks. The plugin folder is `lunar-blocks` and the main file is `lunar-blocks.php`. No block was added or removed.
* Breaking: everything that carried the old name was renamed, so the content you saved with Moon Blocks does not show up in Lunar Blocks until it is migrated. This covers block names (`moon-blocks/...` is now `lunar-blocks/...`), CSS classes (`moon-...` is now `lunar-...`), the Appearance settings, and the translation files.
* To upgrade from Moon Blocks: back up your site, move your content and settings over, then deactivate and delete Moon Blocks.

= 1.1.0 =

* Accordion: a new Accordion starts with every item collapsed, also on wide screens, because an Accordion is meant to hide long content. To open the items on wide screens, turn on "Open items on desktop" in the block settings; it applies to every item in the Accordion.
* Accordions that are already saved keep opening on wide screens. They are updated the first time they are opened in the editor, and look and behave as before.

= 1.0.0 =

* Table: every style can now be sorted, not only Default and Preset 1. Preset 2, Preset 3, and Preset 4 get a list to choose the column and a button to reverse the order, right under the search box. Preset 1 keeps its header buttons on wide screens and this list on small screens.
* Table: the "Sortable" setting is shown for every style.
* Indonesian (id_ID) translation, for the settings page, the block editor, and the front end.
* Table: a new table starts with search and sorting turned off, because they are meant for tables with many rows. Turn them on in the block settings. Tables that are already saved keep their settings.
* Table Preset 1 (small screens), Preset 2, Preset 3, Preset 4, and Info List: a label is now centered vertically against its value, so it stays level with the value whether the value is one line or several.
* Table Preset 2, Preset 3, and Preset 4 saved before this version are updated the first time they are opened in the editor. They look and behave as before, and do not get sorting until you turn on "Sortable".
* Table: sorting a column of amounts now goes by the number. Before, "100 G" came after "1.000 G" because only the digits were compared, a dot between thousands was not understood, and a minus sign was ignored.
* TOC: a post with a table of contents no longer fails to load on hosting where the PHP mbstring extension is missing.

= 0.9.2 =

* Gallery, Infobox, and Table images now load at the size they are shown, so pages download less data, most of all on phones.
* The settings page asks for confirmation before you leave it with unsaved changes.
* Table Preset 3 and Preset 4: a ticked card now has a struck-through name, muted text, and a faded image instead of fading the whole card, so the text stays easy to read.
* The shared color and spacing styles are now loaded together with the page, which saves one request.
* Callout: the icon is drawn by the stylesheet, so it is no longer lost when a site filters the post content. Screen readers announce the type of the callout.
* TOC: no table of contents is built for a post the visitor cannot read, such as a password-protected post.
* Table: image data left in a cell after changing a column type is treated as an empty cell instead of text.
* Table Preset 3 and Preset 4: the checkbox is added when the page loads, and content saved with an older checkbox does not get a second one.
* Block styles are reloaded after an update instead of coming from the browser cache.
* Block icons in the editor inserter are outlined as intended instead of filled.
* Callout and Table Preset 1: the accent bar and spacing follow the reading direction in right-to-left languages.
* Gallery: the image viewer stays readable in high contrast modes, and image links without alternative text get a name for screen readers.
* Table: keyboard focus skips the hidden header sort buttons on small screens, and a table that scrolls sideways can be focused and scrolled with the keyboard.
* Tabs and Accordion: the page no longer jumps when the blocks finish loading, and an item without a title gets a name for screen readers.
* The plugin now loads on pre-release versions of WordPress, such as 6.9-RC1.
* Deleting the plugin also removes the saved Table of Contents data.

= 0.9.1 =

* Gallery: the image viewer closes with the Escape key in themes that block it.
* Spacing and column widths keep their size in themes that set a small base font size, such as 10px, instead of shrinking.
* Table Preset 3 and Preset 4: a checkmark drawn by the theme no longer shows next to the checkbox tick, and a card label no longer breaks inside a word.
* Table Preset 3 and Preset 4: an image column that is not the first column shows as a labeled field instead of the text "[object Object]". A table saved this way before this version shows a recovery prompt in the editor and needs to be saved again.

= 0.9.0 =

* Added the Table block. Build the table in the editor, choose how many columns and rows to start with, add or remove rows and columns, turn a row into a divider, and set each column to text, number, or image.
* Five styles: Default, Preset 1, Preset 2, Preset 3, and Preset 4. Default is a plain table that scrolls sideways when it is too wide. Preset 1 has a flat header, and on small screens each row becomes a card. Preset 2 shows cards in a grid with their rows lined up, with an optional note beside the title and an optional highlighted line at the bottom. Preset 3 and Preset 4 show one card per row with a checkbox, and Preset 3 adds badges.
* Every table has a search box above it. Rows that do not match are hidden, and a divider is hidden when nothing under it matches. Search and sorting can be turned off for a table.
* Default and Preset 1 can be sorted by clicking a column heading: first ascending, then descending, then back to the original order. Sorting stays inside each group between dividers, and image columns are not sorted. On small screens, Preset 1 has a list to choose the column and a button to reverse the order.
* Image columns show at the width set in "Image width" for the column, in every style, and keep the proportions of the picture. On a narrow screen an image only shrinks when its cell is narrower than that width.
* The checkbox of Preset 3 and Preset 4 is saved in the visitor's browser, and a ticked card is dimmed. Each table uses its own saved ticks, and clearing the browser data clears them.
* Default and Preset 1 can align each column to the left, center, or right.
* Empty or "N/A" values in Preset 2 are shown as a dash, so the cards keep their rows lined up.

= 0.8.0 =

* Added the TOC block: a table of contents built from the headings of the post, from H2 to H6, nested by level. Add it once to a post or a template.
* The table of contents appears only when the post has at least two headings. With fewer, nothing is shown, even if the block was added.
* Headings get readable links based on their text, such as `#Planting_Guide`. Letters from any language are kept, repeated headings get `_2`, `_3`, and a link you set yourself with HTML Anchor is never changed.
* Accordion item titles that are headings are listed too, and a link to one opens the item. A link to a heading inside a tab opens that tab. Headings inside an Infobox are left out.
* The box starts closed and opens with the plus and minus button. It follows the width and fonts of your theme, and the section being read is highlighted while you scroll.

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
* Added a "Lunar Blocks" category to the block inserter.

= 0.1.0 =

* Initial foundation: the Lunar Blocks settings screen with per-block switches and optional Primary, Surface, and Border colors.
