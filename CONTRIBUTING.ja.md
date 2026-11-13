# Contributing

[ [English](CONTRIBUTING.md) | **日本語** ]

コントリビュートありがとうございます。バグ報告・機能要望は Issue、変更は Pull Request でお願いします。

## 前提

- Node.js 22.13 以上（`package.json` の `engines`）
- pnpm（バージョンは `package.json` の `packageManager` フィールドで固定されています。Corepack を使う場合は `corepack enable` で自動的にそのバージョンが使われます）

## セットアップと開発

```sh
pnpm install
pnpm dev      # 開発用ユーザースクリプト（HMR対応）。開かれた *.proxy.user.js をマネージャにインストールする
pnpm build    # dist/youtube-hidden-tags.user.js を生成
pnpm exec tsc --noEmit   # 型チェック
```

Pull Request を出す前に、`pnpm lint`、`pnpm fmt:check`、`pnpm exec tsc --noEmit`、`pnpm build` が通ることを確認してください。CI は `pnpm install --frozen-lockfile` のあと、同じ手順を実行します。

## コーディング方針

- 実行時に外部ライブラリへ依存しないこと（ビルド時の devDependencies は可）
- コメントは原則として書かない。どうしても必要な場合のみ、英語で書く
- タグ文字列のようなページ側の入力を `innerHTML` に入れない。`textContent` と `createElement` で組み立てる

## 言語の追加

1. `src/i18n.ts` の `locales` に、言語コードをキーとして1エントリ追加する（`zh-CN` のような完全なタグも可）
2. `vite.config.ts` の `name` / `description` に同じロケールを追加する

他の変更は不要です。

## リリース手順（メンテナ向け）

バージョンの単一の管理場所は `package.json` の `version` です（`vite.config.ts` が読み取ってメタデータの `@version` に使います）。

1. `package.json` の `version` を上げる
2. コミットして `main` にプッシュする
3. 同じバージョンでタグを打ってプッシュする（例: `git tag v1.1.0 && git push origin v1.1.0`）
4. GitHub Actions の Release ワークフローが、タグと `package.json` のバージョン一致を確認した上で、lint、フォーマットチェック、型チェック、ビルドを行い、`dist/youtube-hidden-tags.user.js` を添付した GitHub Release を作成します

タグとバージョンが一致しない場合、ワークフローは失敗します。
