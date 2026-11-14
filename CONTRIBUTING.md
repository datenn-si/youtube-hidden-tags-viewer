# Contributing

[ **English** | [日本語](CONTRIBUTING.ja.md) ]

Thank you for contributing. Please use Issues for bug reports and feature requests, and Pull Requests for changes.

## Prerequisites

- Node.js 22.13 or later (`engines` in `package.json`)
- pnpm (the version is pinned by the `packageManager` field in `package.json`; with Corepack enabled via `corepack enable`, that version is used automatically)

## Setup and development

```sh
pnpm install
pnpm dev      # dev userscript with HMR; install the *.proxy.user.js it opens in your manager
pnpm build    # outputs dist/youtube-hidden-tags-viewer.user.js
pnpm exec tsc --noEmit   # type check
```

Before opening a Pull Request, make sure `pnpm lint`, `pnpm fmt:check`, `pnpm exec tsc --noEmit`, and `pnpm build` pass. CI runs those steps after `pnpm install --frozen-lockfile`.

## Coding guidelines

- No runtime dependencies (build-time devDependencies are fine)
- No comments in principle; if one is truly necessary, write it in English
- Never put page-provided input such as tag strings into `innerHTML`; build DOM with `textContent` and `createElement`

## Adding a language

1. Add one entry to `locales` in `src/i18n.ts`, keyed by its language code (full tags like `zh-CN` also work)
2. Add the same locale to `name` / `description` in `vite.config.ts`

No other changes are needed.

## Releasing (maintainers)

The single source of truth for the version is `version` in `package.json` (`vite.config.ts` reads it into the `@version` metadata).

1. Bump `version` in `package.json`
2. Commit and push to `main`
3. Tag the same version and push the tag (e.g. `git tag v1.1.0 && git push origin v1.1.0`)
4. The Release workflow in GitHub Actions verifies that the tag matches the `package.json` version, then lints, checks formatting, typechecks, builds, and creates a GitHub Release with `dist/youtube-hidden-tags-viewer.user.js` attached

If the tag and the version do not match, the workflow fails.
