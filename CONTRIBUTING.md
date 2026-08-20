# Contributing to Lunar Blocks

Thanks for your interest in contributing! This document covers how to report
issues, propose changes, and get a development environment running.

By participating in this project, you're expected to uphold the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting Bugs

Please use the [GitHub issue tracker](https://github.com/irvangen09/lunar-blocks/issues).
A good bug report includes:

* WordPress version, PHP version, and active theme.
* Steps to reproduce the issue.
* What you expected to happen vs. what actually happened.
* A screenshot or screen recording, if the issue is visual.

If you believe you've found a **security vulnerability**, please do not open a
public issue — see [SECURITY.md](SECURITY.md) for how to report it privately.

## Suggesting Features

Feature suggestions are welcome via the issue tracker. Since Lunar Blocks is
intentionally scoped as a generic, standalone documentation-block plugin,
please explain the use case (not just the feature itself) so it can be
weighed against that scope.

## Development Setup

```bash
git clone https://github.com/irvangen09/lunar-blocks.git
cd lunar-blocks
npm install
npm run build
```

| Command | What it does |
|---|---|
| `npm run start` | Builds in watch mode for development. |
| `npm run build` | Production build. |
| `npm run lint:js` | Lints JavaScript source. |
| `npm run lint:css` | Lints SCSS source. |
| `npm run plugin-zip` | Builds and packages a distributable `lunar-blocks.zip`. |

Requirements: WordPress 6.5+, PHP 8.0+, Node.js (see `package.json` engines
field for the exact version used in development).

PHP is checked against the ruleset in `phpcs.xml` (WordPress-Extra). If you
have PHP_CodeSniffer installed locally, run it against that ruleset before
submitting a PHP change.

## Coding Standards

* **PHP** — WordPress Coding Standards, PHP 8+, namespaced under `Lunar\Blocks\`
  (or `Lunar\Services\` for logic shared by more than one consumer).
* **JavaScript** — ES modules, standard Gutenberg Block API patterns. Avoid
  adding a new external dependency if WordPress already provides an
  equivalent.
* **CSS** — class names prefixed `.lunar-`, no `!important`. Colors and fonts
  use `var(--token, fallback)`, and the fallback must be a neutral,
  theme-agnostic value (e.g. `currentColor`, `inherit`, or a generic gray) —
  never a brand-specific color. This keeps every block usable on any theme,
  not just the ones built for the wider Lunar ecosystem.
* **Comments** — English, kept to a minimum, explaining *why* something is
  done only when it isn't obvious from the code itself.

## Block Structure

If you're adding to or modifying a block:

* Each block lives in its own folder under `src/`.
* Parent/child block families nest the child inside the parent's folder
  (e.g. `src/accordion/item/`), not as a separate sibling folder.
* A block family is registered from a single combined `index.js` in the
  parent's folder — not one `index.js` per child block.
* Rich-text content attributes use the `rich-text` attribute source, not
  `html`.

## Pull Requests

1. Fork the repository and create a branch from `main`.
2. Keep pull requests focused on a single fix or feature — smaller PRs are
   easier to review and merge.
3. Run `npm run build`, `npm run lint:js`, and `npm run lint:css` before
   opening the PR, and make sure there are no new errors.
4. Write commit messages following
   [Conventional Commits](https://www.conventionalcommits.org/) (e.g.
   `fix(accordion): ...`, `feat(table): ...`, `docs: ...`).
5. Describe what the change does and why in the PR description. Link any
   related issue.

## License

By contributing, you agree that your contributions will be licensed under the
same license as the project: **GPL-2.0-or-later** (see [LICENSE.md](LICENSE.md)).
