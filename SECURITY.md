# Security Policy

[ **English** | [日本語](SECURITY.ja.md) ]

## Reporting a vulnerability

If you find a vulnerability, please do not open a public Issue. Report it privately through GitHub:

<https://github.com/datenn-si/youtube-hidden-tags-viewer/security/advisories/new>

Please include reproduction steps and the impact. After verification, the fix and release will be made in this repository and published with credit to the reporter.

## Supported versions

Only the latest release is supported. If you find an issue in an older version, please check whether it still reproduces in the latest one.

## Design notes

For reference, this script behaves as follows:

- It is installed for `https://www.youtube.com/*` and `https://m.youtube.com/*`, and it shows tags only on `/watch`
- It does not contact other sites. The only request is a same-origin `GET /watch?v=<id>` with credentials omitted, and only when the page does not already expose that video's tags
- It collects and stores no personal data (the copy feature writes to the clipboard only when you click the button)
- Tag strings are treated as page-provided input and rendered only via `textContent`
