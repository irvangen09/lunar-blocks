# Changelog

All notable changes to Lunar Blocks are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Changed
- `lunar-blocks.php` bootstrap now also initializes `Registry` and `Settings`.
- Added the missing `Requires at least: 6.5` header field.