# Repository Guidelines

## Project Structure

ドパドリル is a dependency-free browser arithmetic game. `app/index.html` and `app/style.css` define the interface; `app/js/` contains ES modules for gameplay, problem generation, progress, audio, and effects. Fonts and their licenses live in `app/fonts/`. `docs/SPEC.md` describes product behavior, `docs/curriculum.md` describes the skill tree, and `docs/dopakichi.svg` is the character reference. Unit tests live in `tests/`; font tooling lives in `tools/`.

## Development Commands

- `python3 -m http.server 8000 -d app` serves the game at `http://localhost:8000/`. Use HTTP because ES modules do not work reliably via `file://`.
- `node --test tests/*.test.mjs` runs the full test suite with Node.js 20 or newer.
- `node --test tests/app_session.test.mjs` runs one focused test file.
- `bash tools/build_fonts.sh` regenerates subset fonts after adding displayed text. It requires `curl`, `uv`, and network access.

There is no application build step; serve `app/` directly.

## Coding Style & Naming

Follow the surrounding code: use two-space indentation, semicolons, single-quoted JavaScript strings, and ES module imports and exports. Use camelCase for functions and variables, uppercase names for constants, and descriptive lowercase module names such as `session.js`. Keep gameplay logic in the relevant module and update both Japanese and Simplified Chinese user-facing text. Locale resources are in `app/js/locales/`; retain stable IDs and persisted problem data when translating. No repository-wide formatter or linter is configured.

## Testing

Tests use Node's built-in `node:test` and `node:assert/strict`. Name files `tests/app_<module>.test.mjs` and give each test a descriptive behavior-focused name. Add regression tests for changed logic, including edge cases; use seeded randomness where applicable. Run the full suite before submitting. No coverage threshold is configured. For UI changes, also check the affected flow in a browser at phone and desktop sizes.

## Commits & Pull Requests

Recent commits use concise scoped subjects such as `feat(app): ...` and `fix(app): ...`; follow that pattern. In pull requests, explain the behavior changed and why, list validation performed, link relevant issues, and include screenshots or recordings for visible changes.

## Agent Instructions

Do not send optional commentary.
