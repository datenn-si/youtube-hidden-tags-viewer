# YouTube Hidden Tags Viewer

[![CI](https://github.com/datenn-si/youtube-hidden-tags-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/datenn-si/youtube-hidden-tags-viewer/actions/workflows/ci.yml)
[![Release](https://github.com/datenn-si/youtube-hidden-tags-viewer/actions/workflows/release.yml/badge.svg)](https://github.com/datenn-si/youtube-hidden-tags-viewer/actions/workflows/release.yml)

[ **English** | [日本語](README.ja.md) ]

A userscript that displays the hidden tags set on a YouTube video below the description.

## Features

- Lists the tags set on a video as chips below the description. The list is its own row, and its width matches the description. On a live watch page, where the description and the chat teaser sit side by side, the list spans both and sits under that row
- Clicking a chip searches YouTube for that tag
- A "Copy all" button copies the tag list, comma-separated
- Follows both YouTube's dark and light themes
- Handles SPA navigation without a page reload, including arriving at a video from the home page or search results (the script loads on all YouTube pages and only activates on watch pages)
- No runtime dependencies, and it does not contact other sites. If the page does not already expose the video's tags, it reads the watch page on the same origin
- The UI language follows the YouTube page language (Japanese gets Japanese, everything else gets English)
- Works on the mobile site (m.youtube.com) too; open the description sheet to see the tags inside it

## Installation

Prerequisite: a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) installed in your browser.

1. Open the latest script:
   <https://github.com/datenn-si/youtube-hidden-tags-viewer/releases/latest/download/youtube-hidden-tags-viewer.user.js>
2. Confirm the installation in your userscript manager

After installation, the manager remembers this URL as the update source, so new releases are picked up automatically (`@downloadURL` / `@updateURL` point to the same URL).

Older versions are available on the [Releases](https://github.com/datenn-si/youtube-hidden-tags-viewer/releases) page.

## Usage

### PC

Just open a YouTube watch page (`youtube.com/watch`). If the video has tags, they appear below the description, in a row of the same width. On a live watch page the row spans the description and the chat teaser and sits underneath them. Videos without tags show nothing.

### Mobile

Just open the mobile version of the YouTube video page (`m.youtube.com/watch`). If the video has tags, they appear below the description when you open the details view. Videos without tags show nothing.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup and how to contribute.

## Security

See [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## License

[MIT](LICENSE)
