import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

const { name, version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { name: string; version: string };

const fileName = `${name}.user.js`;

const downloadURL = `https://github.com/datenn-si/youtube-hidden-tags-viewer/releases/latest/download/${fileName}`;

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: {
          '': 'YouTube Hidden Tags Viewer',
          en: 'YouTube Hidden Tags Viewer',
          ja: 'YouTube 隠しタグビューア',
        },
        description: {
          '': 'Display the hidden tags set on a YouTube video below the description.',
          en: 'Display the hidden tags set on a YouTube video below the description.',
          ja: 'YouTube動画に設定された隠しタグを概要欄の下に表示します。',
        },
        namespace: 'si.datenn.userscripts.youtubeHiddenTagsViewer',
        author: 'Datenshi',
        license: 'MIT',
        version,
        icon: 'https://www.youtube.com/favicon.ico',
        match: ['https://www.youtube.com/*', 'https://m.youtube.com/*'],
        'run-at': 'document-idle',
        downloadURL,
        updateURL: downloadURL,
      },
      build: {
        fileName,
      },
    }),
  ],
});
