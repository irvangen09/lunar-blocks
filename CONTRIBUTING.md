# Contributing to Moon Blocks

Thank you for taking the time to help. Bug reports, ideas, translations, and pull requests are all welcome.

By taking part, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security problem, please do not open a public issue; follow [SECURITY.md](SECURITY.md) instead.

## Reporting a bug

Open an [issue](https://github.com/irvangen09/moon-blocks/issues) and include:

- What you expected, and what happened instead.
- The steps to reproduce it, ideally starting from a new post with a single block.
- Your versions of Moon Blocks, WordPress, and PHP, and the theme you use.
- A screenshot or a short screen recording for visual problems.
- Any message from the browser console or from `debug.log`.

If a block shows "This block contains unexpected or invalid content", please include the block's HTML, which you can copy from the **Code editor** view of the post.

## Suggesting a change

Open an issue before you start on anything larger than a small fix, so the idea can be discussed first. Moon Blocks is deliberately small: it targets documentation, wiki, and knowledge base sites, so a new feature is accepted when it serves that purpose and works in any theme.

## Setting up

You need Node.js (`^22.22.2`, `^24.15.0`, or `>=26`) with npm 11, and PHP 8.0 or later with Composer for PHP linting. See the [README](README.md#development) for the setup steps and the list of commands.

Use a local WordPress 6.9 or later site, with the plugin folder placed in `wp-content/plugins/`. The plugin loads the compiled blocks from `build/`, so run `npm run build` (or `npm start`) after every change to `src/`.

## Before you open a pull request

Run all of these and make sure they pass:

```bash
npm run lint:js
npm run lint:css
npm test
composer lint:php
npm run build
```

The same checks run on every pull request.

Then check your change in the editor and on the front end, with at least one block theme and one classic theme if you can. For anything interactive, try it with the keyboard only, and with a screen reader if you have one.

## Guidelines

**Code**

- PHP follows the WordPress Coding Standards (`phpcs.xml`). JavaScript and Sass follow the `@wordpress/scripts` lint rules. Files end with a single line break and use LF line endings (see `.editorconfig`).
- Code comments are in English, short, and explain only what is not obvious from the code.
- Every user-facing string goes through `__()`, `_n()`, or a related function with the text domain `moon-blocks`.
- The plugin has no Composer packages at runtime. Composer is used for development tools only.

**Design**

- Use the design tokens from `assets/css/tokens.css` (`--moon-*`) instead of fixed colors, radii, and spacing. Lengths outside the spacing scale are written as `calc(var(--moon-unit) * N)`, and font sizes use `em`.
- Do not hard-code colors and do not add a dark mode. Blocks inherit fonts and text color from the theme.
- Show a keyboard focus ring only for keyboard users, with the shared `focus-ring` mixin in `src/shared/_focus.scss`.
- Blocks must stay readable without JavaScript where that is possible, and must work with the keyboard and with assistive technology.

**Saved content**

The markup a block saves, its attribute names and defaults, and the Table preset names are part of the content stored in people's posts. After version 1.0.0, changing any of them needs a `deprecated.js` entry so that existing posts keep working. The serialization tests in `tests/` record the saved markup of each block; a change to a snapshot must be deliberate and explained in the pull request.

**Commits and pull requests**

- Write commit messages in the style `type(scope): short summary` in lowercase, for example `fix(table): keep the header sticky on scroll`. Types in use are `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, and `chore`.
- Keep a pull request to one topic, and describe what changed and how you checked it.
- For a change users can notice, add a line to the `[Unreleased]` section of [CHANGELOG.md](CHANGELOG.md), written for site owners rather than developers. Do not change version numbers; maintainers do that when a release is prepared.

## Translations

Translations are bundled in the `languages/` folder. To improve a translation or add a language, open an issue or a pull request with the `.po` file for your language.

## License

By contributing, you agree that your contribution is licensed under the [GNU General Public License v2.0 or later](LICENSE), the same as the plugin.
