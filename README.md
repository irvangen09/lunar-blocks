# Lunar Blocks

[![CI](https://github.com/irvangen09/lunar-blocks/actions/workflows/ci.yml/badge.svg)](https://github.com/irvangen09/lunar-blocks/actions/workflows/ci.yml)
[![License: GPL v2 or later](https://img.shields.io/badge/license-GPL--2.0--or--later-blue.svg)](LICENSE)

Lightweight Gutenberg blocks for documentation, wiki, and knowledge base websites.

Lunar Blocks is made to blend into your site. Fonts come from your theme, colors are derived from your theme's text color, and there is no separate dark mode to maintain. Block styles and scripts are loaded only on pages that use the block.

## Blocks

| Block | What it does |
| --- | --- |
| **Accordion** | Sections that visitors open and close. Items start collapsed and can be set to start open on wide screens, and a link to an item opens it. |
| **Callout** | A note, tip, warning, or important point, with an icon and an editable label for each variant. |
| **Gallery** | Images in a grid of two to four columns, with optional captions and a viewer with keyboard navigation. |
| **Infobox** | The key facts about one subject in a single box: an optional image beside a table of labels and values. |
| **Info List** | A compact list of labels and values, with optional Requirements sections that hold checklist-style items. |
| **Table** | Rows of information as a table or as cards, in five styles, with search, sorting, dividers, and a checklist for list-style cards. |
| **Tabs** | Content panels that visitors switch between with a row of tabs. Without JavaScript, all panels are shown in order. |
| **TOC** | A table of contents built from the headings of the post (H2 to H6), nested by level. |

## Requirements

- WordPress 6.9 or later
- PHP 8.0 or later

## Installation

1. Download the latest `lunar-blocks.zip` from the [Releases](https://github.com/irvangen09/lunar-blocks/releases) page.
2. In WordPress, go to **Plugins → Add New Plugin → Upload Plugin**, choose the zip file, and install it.
3. Activate the plugin.
4. Go to **Settings → Lunar Blocks** to choose which blocks are available and to adjust colors.

The blocks appear in the block inserter under the **Lunar Blocks** category.

## Settings

- **Blocks:** turn individual blocks on or off. A disabled block is not registered and loads no CSS or JavaScript. Turning off a block also turns off the blocks that belong to it.
- **Appearance:** optionally set Primary, Surface, and Border colors. Colors you leave empty follow your theme. Please check that the colors you choose have enough contrast with your theme.

## Compatibility

Lunar Blocks works with block themes and classic themes. It does not add global styles outside its own blocks.

Known limit:

- The TOC lists the headings written in the post itself. Headings that come from synced patterns or from dynamic blocks are not included.

## Development

You need Node.js (`^22.22.2`, `^24.15.0`, or `>=26`) with npm 11. PHP linting also needs PHP 8.0 or later and Composer.

```bash
git clone https://github.com/irvangen09/lunar-blocks.git
cd lunar-blocks
npm ci
npm run build
composer install   # only needed for PHP linting
```

Copy or symlink the folder into `wp-content/plugins/` of a local WordPress site and activate it. The plugin reads the compiled blocks from `build/`, so run `npm run build` (or `npm start` to rebuild on every change) after cloning and after every change to `src/`.

| Command | Purpose |
| --- | --- |
| `npm run build` | Compile the blocks and the settings page into `build/`. |
| `npm start` | Rebuild on every change. |
| `npm run lint:js` | Lint JavaScript. |
| `npm run lint:css` | Lint Sass. |
| `npm test` | Run the unit tests. |
| `composer lint:php` | Check PHP against the WordPress Coding Standards. |
| `npm run plugin-zip` | Build and create the release zip. |

### Structure

```text
lunar-blocks.php   Plugin header and bootstrap
includes/         PHP classes (PSR-4 namespace LunarBlocks\)
src/              Block sources (one folder per block), shared code, settings page
assets/css/       Design tokens (--lunar-* custom properties)
build/            Compiled output (generated, not committed)
languages/        Translation files
tests/            Unit tests
```

## Contributing

Bug reports, ideas, and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first, and note that this project follows a [Code of Conduct](CODE_OF_CONDUCT.md). To report a security problem, see [SECURITY.md](SECURITY.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

Lunar Blocks is free software, released under the [GNU General Public License v2.0 or later](LICENSE).
