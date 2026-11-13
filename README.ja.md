# YouTube Hidden Tags Viewer

[![CI](https://github.com/datenn-si/youtube-hidden-tags-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/datenn-si/youtube-hidden-tags-viewer/actions/workflows/ci.yml)
[![Release](https://github.com/datenn-si/youtube-hidden-tags-viewer/actions/workflows/release.yml/badge.svg)](https://github.com/datenn-si/youtube-hidden-tags-viewer/actions/workflows/release.yml)

[ [English](README.md) | **日本語** ]

YouTube動画に設定された「隠しタグ」を概要欄の下に表示するユーザースクリプトです。

## 特徴

- 動画に設定されたタグを、概要欄の下にチップ形式で一覧表示します。一覧は独立した行になり、横幅は概要欄に揃います。ライブ配信ページでは概要欄とチャットが横に並ぶので、タグ一覧はその両方の幅で、その下に表示されます
- チップをクリックすると、そのタグでYouTube内検索ができます
- 「すべてコピー」ボタンで、タグ一覧をカンマ区切りでコピーできます
- YouTubeのダークテーマ／ライトテーマの両方に追従します
- SPA遷移でもページを再読み込みせずに表示が切り替わります。トップページや検索結果から動画へ遷移した場合も動作します（スクリプトはYouTube全体で読み込まれ、動画ページでのみ有効になります）
- 実行時の依存ライブラリはありません。他のサイトへの通信は行いません。ページ側にタグが見当たらないときだけ、同じ YouTube の視聴ページを読みにいきます
- 表示言語はYouTubeの表示言語に連動します（日本語なら日本語、それ以外は英語）
- モバイルサイト（m.youtube.com）にも対応します。説明シートを開くと、その中にタグが表示されます

## インストール

前提: [Tampermonkey](https://www.tampermonkey.net/) や [Violentmonkey](https://violentmonkey.github.io/) などのユーザースクリプトマネージャがブラウザに入っていること。

1. 最新版のスクリプトを開きます:
   <https://github.com/datenn-si/youtube-hidden-tags-viewer/releases/latest/download/youtube-hidden-tags.user.js>
2. マネージャのインストール確認画面が表示されるので、インストールします

インストール後は、マネージャがこのURLを更新元として記憶し、新しいリリースが出ると自動更新されます（`@downloadURL` / `@updateURL` も同じURLを指しています）。

過去のバージョンは [Releases](https://github.com/datenn-si/youtube-hidden-tags-viewer/releases) から取得できます。

## 使い方

### PC

YouTubeの動画ページ（`youtube.com/watch`）を開くだけです。タグが設定されている動画では概要欄の下に、概要欄と同じ幅のタグ一覧が表示されます。ライブ配信ページでは、概要欄とチャットを合わせた幅で、その下に表示されます。タグが設定されていない動画では何も表示されません。

### モバイル

YouTubeのモバイル版動画ページ（`m.youtube.com/watch`）を開くだけです。タグが設定されている動画では詳細表示を開くと概要欄の下にタグ一覧が表示されます。タグが設定されていない動画では何も表示されません。

## 開発

開発手順・コントリビュート方法は [CONTRIBUTING.ja.md](CONTRIBUTING.ja.md) を参照してください。

## セキュリティ

脆弱性の報告方法は [SECURITY.ja.md](SECURITY.ja.md) を参照してください。

## ライセンス

[MIT](LICENSE)
