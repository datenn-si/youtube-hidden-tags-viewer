# AGENTS.md

Instructions for coding agents working in this repository.

When a repository's documentation and its existing code disagree, follow the conventions used in the existing code, and in your final reply point out each inconsistency you found between the documentation and the code.

## What this is

YouTube Hidden Tags Viewer is a userscript. On a YouTube watch page it shows the video's hidden tags (`videoDetails.keywords`) as chips below the description. A chip opens a YouTube search for that tag. "Copy all" copies the tags, comma-separated, to the clipboard.

Vite and `vite-plugin-monkey` build it. The shipped file is `dist/youtube-hidden-tags.user.js`. That directory is gitignored; CI and the release workflow produce it.

`README.md` is the user-facing spec. `CONTRIBUTING.md` is the setup and review bar. `SECURITY.md` is the threat model. Each of those has a `.ja.md` twin that must describe the same thing.

## Commands

Requirements: Node.js >= 22.13 and pnpm 12.18.0 (`packageManager` in `package.json`). With Corepack (`corepack enable`), that pnpm version is selected automatically.

- `pnpm install`
- `pnpm dev` — dev userscript with HMR. Install the opened `*.proxy.user.js` in a userscript manager.
- `pnpm build` — writes `dist/youtube-hidden-tags.user.js`
- `pnpm exec tsc --noEmit`
- `pnpm lint` / `pnpm lint:fix` — oxlint
- `pnpm fmt` / `pnpm fmt:check` — oxfmt, single quotes (`.oxfmtrc.json`)

A finished change passes `pnpm lint`, `pnpm fmt:check`, `pnpm exec tsc --noEmit`, and `pnpm build`. CI on `main` and pull requests runs those after `pnpm install --frozen-lockfile`. There is no test suite.

## Layout

- `src/main.ts` — detection, tag data, rendering, SPA handling
- `src/i18n.ts` — UI strings. The locale is chosen once, when the module loads.
- `vite.config.ts` — userscript metadata. `@version` is read from `package.json`.
- `.github/workflows/ci.yml`, `.github/workflows/release.yml`

## Product behavior

The userscript matches `https://www.youtube.com/*` and `https://m.youtube.com/*` at `document-idle`, so it is already loaded when the viewer opens a video from home or search. It renders only when `location.pathname` is `/watch`. Every other path removes the box.

A video whose tag list is empty shows nothing. The empty state is the absence of the box.

Desktop (`www.youtube.com`): the box is its own full-width row under the description. On a live watch page the description and the chat teaser share one line; the box stays below that line and does not sit between them.

Mobile (`m.youtube.com`): the same box appears inside the description sheet, under the description. The copy control is plain text there (no pill, no hover fill).

Each chip is a link to `/results?search_query=<tag>` on the current host.

Copy writes `tags.join(', ')` with `navigator.clipboard.writeText`, and only after the button click. The label switches to the success or failure string for 1.5 seconds, then returns to "Copy all".

UI language follows `document.documentElement.lang`, then `navigator.language`. An exact locale key wins; otherwise the primary subtag (`ja` from `ja-JP`); otherwise English. Japanese YouTube gets Japanese. Every other language gets English. Detection does not run again on later navigations.

Themes follow YouTube. Desktop uses the `dark` attribute on `<html>`. The mobile site does not set that attribute, so theme is inferred from the description text color: light text means a dark theme. The color values were measured from the desktop site. Keep the flat description-box background. The desktop copy button matches YouTube's tonal XS button (the "パネルを開く" control): height 24px, padding `0 10px`, radius 12px, 12px/500 text, no gradient. Dark background is `rgba(255, 255, 255, 0.1)` and hover is `rgba(255, 255, 255, 0.2)`. Light background is `rgba(0, 0, 0, 0.05)` and hover is `rgba(0, 0, 0, 0.1)`. Text color is the box foreground. On mobile the copy control stays plain text.

## Where tags come from

A payload is `{ id: videoId, tags: string[] }` from `videoDetails.keywords`. Entries are stringified, trimmed, and dropped when empty.

Use the first source whose `id` equals the `v` query parameter:

1. Data captured from `yt-navigate-finish` and `yt-page-data-updated` (`detail`, `detail.playerResponse`, or `detail.response.playerResponse`).
2. `unsafeWindow.ytInitialPlayerResponse`.
3. `playerData` on `ytd-watch-flexy`.
4. A same-origin `GET /watch?v=<id>` with `credentials: 'omit'`, reading the embedded `"keywords"` array from the HTML. Start it only when no in-page source matches the current video id and more than 1.5 seconds have passed since that id appeared. At most one fetch per video id.

A matching source with an empty keyword list ends the attempt. Do not fall through to the fetch in that case.

`<meta name="keywords">` holds generic site-wide keywords. It is never this video's tags.

During SPA navigation the URL changes before player data, and the data swap may not mutate the DOM. Retry rendering until the data matches the URL: 20 attempts, 300 ms apart. Also listen for `yt-navigate-start` (clear the box), `popstate`, a `MutationObserver` on `document.body` and on `document.head` (`content` attributes), and a 500 ms signature watchdog. Ignore mutations that originate inside `#yht-root`.

## Where the box goes

Insert after the first anchor that exists, in this order:

1. `ytd-watch-metadata #description`
2. `#primary-inner #description`
3. `#description.ytd-text-inline-expander`
4. `ytm-expandable-video-description-body-renderer`
5. `ytm-video-description-header-renderer`

When the anchor is inside `#bottom-row`, append the box as that row's last child. `#bottom-row` is `display: flex; flex-flow: row wrap`, and on a live page `#description` and `#teaser-carousel` share the first line. The box is a column flex item with `flex-shrink: 0`, so it stays on its own line. `#bottom-row` has a negative `margin-right` (measured, currently `-12px`) so the description's gap does not shrink the cards. A basis of `100%` follows that extra width and the box sticks out past the cards. Use `flex: 0 0 calc(100% - Npx)` where `N` is that negative margin, and set `width` and `max-width` to the same value. The box's right edge then lines up with the cards and with `ytd-watch-metadata`. Otherwise insert the box directly after the anchor and leave width at `100%`.

The root id is `yht-root`. The style element id is `yht-style`. When the video id, the tag list, and the position under the anchor are already correct, skip rebuilding the DOM and only re-apply theme and placement.

## Rules for code changes

- Runtime code stays dependency-free. `vite-plugin-monkey/dist/client` (`unsafeWindow`) is the userscript sandbox bridge and stays. Anything else added for the build goes in `devDependencies`.
- Build DOM with `createElement` and `textContent`. Page-provided strings, especially tags, stay out of `innerHTML`, `insertAdjacentHTML`, and similar sinks.
- The only network call is the same-origin watch-page fallback above. Leave out third-party requests, analytics, and any storage of personal data. The copy button touches the clipboard only on click.
- Comments stay rare. Add one only for a constraint the code itself cannot show, and write it in English. Keep the existing comments accurate when the constraint changes.
- TypeScript is `strict`, target ES2022. Stay with the current shape: small functions in `src/main.ts`, no new framework, no new runtime package.
- A new UI language is one entry in `locales` in `src/i18n.ts` (a full tag such as `zh-CN` is valid) plus the same locale on `name` and `description` in `vite.config.ts`.
- `package.json` `version` is the only version. `vite.config.ts` copies it into `@version`. `@downloadURL` and `@updateURL` both point at `https://github.com/datenn-si/youtube-hidden-tags-viewer/releases/latest/download/youtube-hidden-tags.user.js`. Leave version bumps, tags, and releases alone unless a maintainer asked.
- Leave `dist/` unedited. It is a build output.
- Match oxfmt: single quotes, and the style of the surrounding code.
- User-facing docs are bilingual. Change `README.md` together with `README.ja.md`, and do the same for `CONTRIBUTING`, `SECURITY`, and `CODE_OF_CONDUCT`.
- Vulnerabilities go to a private GitHub advisory (`SECURITY.md`). Only the latest release is supported.

## Release (maintainers only)

1. Bump `version` in `package.json`.
2. Commit and push to `main`.
3. Push a matching tag, for example `v1.1.0`.
4. `.github/workflows/release.yml` checks that the tag equals the `package.json` version, then lints, checks format, typechecks, builds, and publishes `dist/youtube-hidden-tags.user.js` on the GitHub Release (`gh release create` with generated notes).

A tag that disagrees with `package.json` fails the workflow.
