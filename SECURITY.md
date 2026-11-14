# Security Policy

[ **English** | [日本語](#日本語) ]

## English

### Reporting a vulnerability

If you find a vulnerability, please do not open a public Issue. Report it privately through GitHub:

<https://github.com/datenn-si/youtube-hidden-tags-viewer/security/advisories/new>

Please include reproduction steps and the impact. After verification, the fix and release will be made in this repository and published with credit to the reporter.

### Supported versions

Only the latest release is supported. If you find an issue in an older version, please check whether it still reproduces in the latest one.

### Design notes

For reference, this script behaves as follows:

- It is installed for `https://www.youtube.com/*` and `https://m.youtube.com/*`, and it shows tags only on `/watch`
- It does not contact other sites. The only request is a same-origin `GET /watch?v=<id>` with credentials omitted, and only when the page does not already expose that video's tags
- It collects and stores no personal data (the copy feature writes to the clipboard only when you click the button)
- Tag strings are treated as page-provided input and rendered only via `textContent`

## 日本語

[ [English](#english) | **日本語** ]

### 脆弱性の報告

脆弱性を見つけた場合は、公開の Issue には書かず、GitHub の非公開報告機能から報告してください。

<https://github.com/datenn-si/youtube-hidden-tags-viewer/security/advisories/new>

報告には、再現手順と影響範囲を含めてください。確認後、このリポジトリ上で修正とリリースを行い、謝辞とともに公開します。

### サポート対象バージョン

サポート対象は最新のリリースのみです。古いバージョンで見つかった問題は、最新版で再現するかを確認してください。

### 設計上の前提

このスクリプトの動作範囲は以下の通りで、セキュリティ報告の際の参考にしてください。

- インストール対象は `https://www.youtube.com/*` と `https://m.youtube.com/*` で、タグを表示するのは `/watch` だけです
- 他のサイトへの通信は行いません。ページ側にその動画のタグが見当たらないときだけ、資格情報を付けずに同一オリジンの `GET /watch?v=<id>` を行います
- 個人情報の収集・保存は行いません（コピー機能は、ボタンを押したときだけクリップボードへ書き込みます）
- タグ文字列はページ側の入力として扱い、`textContent` 経由でのみ描画します
