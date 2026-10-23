# htmx

htmx is a dependency-free browser library (~5.4k lines, one file) that lets HTML attributes
(`hx-get`, `hx-swap`, `hx-trigger`, ...) issue AJAX requests and swap the response into the DOM.
This checkout is htmx **2.x** (`package.json` version 2.0.x). The repo also holds the htmx.org website.

## Map

```
src/htmx.js        THE library. An IIFE: `var htmx = (function() { ... })()`. Edit this.
src/htmx.esm.d.ts  hand-maintained types; src/htmx.test.ts is a type smoke test for it
test/attributes/   one mocha file per attribute (hx-swap.js, hx-confirm.js, ...)
test/core/         behavior that isn't one attribute (ajax, events, api, internals, regressions)
test/util/util.js  test helpers: make(), makeServer(), byId(), clearWorkArea(), getWorkArea()
test/index.html    browser-mode runner; lists every test file by hand
test/manual/       hand-run HTML pages, not part of any automated run
www/content/       the htmx.org docs (Zola markdown); attributes/hx-*.md, docs.md, reference.md
```

`src/htmx.js` is sectioned by `//= ===` banners (Utilities, Node processing, History Support,
Input Value Processing, Ajax, Extensions API, Initialization). The public API object at the top is
declared with `null` placeholders and assigned near line 300 (`htmx.process = processNode`).
Keep that two-step pattern when adding an API: direct assignment breaks the generated `.d.ts`.

## Commands (Node 20+; `npm ci` first)

- `npm test`: lint + `types-check` + full Chromium suite (~1.5 min). Run before calling work done.
- `npx web-test-runner --browsers chromium --playwright test/attributes/hx-confirm.js`: one file, ~1 s.
  (`npm test <file>` also works but runs lint and tsc first.)
- `npm run lint` / `npm run format` (eslint `--fix`). There is no prettier.
- `npm run types-check`: `tsc --checkJs` over `src/htmx.js`; JSDoc types in the source are enforced.
- `npm run test:all`: Chromium + Firefox + WebKit, what CI's `test:ci` runs. Use for cross-browser changes.

No CHROME_PATH needed: the test scripts run `playwright install` themselves.

## Conventions

- Style is eslint `standard` with overrides: no semicolons, single quotes, 2 spaces,
  **`function()` with no space before the paren**, `.slice`/`.substring` never `.substr`.
- Source uses named `function` declarations with JSDoc (`@param`, `@returns`, `@type`); no classes,
  few arrow functions. Match that; `types-check` will fail on untyped or mistyped code.
- Tests are mocha + chai `should` + sinon's fake server, synchronous:
  ```js
  beforeEach(function() { this.server = makeServer(); clearWorkArea() })
  afterEach(function() { this.server.restore(); clearWorkArea() })
  it('swaps the response', function() {
    this.server.respondWith('GET', '/test', 'Clicked!')
    var btn = make('<button hx-get="/test">Click Me!</button>')
    btn.click()
    this.server.respond()
    btn.innerHTML.should.equal('Clicked!')
  })
  ```
  Use `make()` (it attaches to `#work-area` and calls `htmx.process`); don't build DOM by hand.
  Test internals with `htmx._('functionName')(...)`, as `test/core/internals.js` does.
- A **new test file** must also get a `<script src="...">` line in `test/index.html`
  (web-test-runner globs the folders, the browser runner does not; `core/class-cleanup.js` is already missing).
- A **new config option** goes in the `config:` object in `src/htmx.js` with JSDoc, and in the config tables
  in both `www/content/docs.md` and `www/content/reference.md`.
- A new or changed attribute gets docs in `www/content/attributes/hx-<name>.md`.

## Guardrails

- **Don't edit `dist/`.** It is built by `npm run dist` from `src/htmx.js` at release time, and PRs must not
  include it. Don't run `npm run dist` either: it rewrites every tracked file in `dist/`.
- **Don't run `npm run www`.** It overwrites the copies in `www/static/src/`, `www/static/test/` and
  `www/themes/htmx-theme/static/js/htmx.js`. Never edit those copies; edit `src/` and `test/`.
- `dist/ext/` is deprecated (see `_WARNING_DEPRECATED_FILES_.txt`); extensions live in
  bigskysoftware/htmx-extensions. Don't add or fix extensions here.
- `test/lib/_hyperscript.js` and `www/static/node_modules/` are vendored. Leave them alone.
- `editors/jetbrains/htmx.web-types.json` is generated from `www/content/attributes/` by `npm run web-types-generate`.
- Upstream takes code PRs against `dev` and docs-only (`www/`) PRs against `master`. The `four`/`four-dev`
  branches are htmx 4, a different codebase: don't port changes between them and this one.
- Don't leave `it.only` in a test file; lint warns on it.
