import { unsafeWindow } from 'vite-plugin-monkey/dist/client';
import { t } from './i18n';

const ROOT_ID = 'yht-root';
const STYLE_ID = 'yht-style';

let lastKey = '';
let scheduled = false;
let seenVideoId = '';
let retryFor = '';
let retryCount = 0;
let lastSignature = '';

type TagData = { id: string; tags: string[] };

let navData: TagData | null = null;
let fetchedData: TagData | null = null;
let fetchFor = '';
let navAt = 0;

function cleanTags(keywords: unknown): string[] {
  if (!Array.isArray(keywords)) return [];
  return keywords
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean);
}

function dataFromPlayerResponse(pr: any): TagData | null {
  const vd = pr?.videoDetails;
  if (!vd?.videoId) return null;
  return { id: String(vd.videoId), tags: cleanTags(vd.keywords) };
}

function windowData(): TagData | null {
  try {
    return dataFromPlayerResponse((unsafeWindow as any)?.ytInitialPlayerResponse);
  } catch {
    return null;
  }
}

function flexyData(): TagData | null {
  try {
    const flexy = document.querySelector('ytd-watch-flexy') as any;
    return dataFromPlayerResponse(flexy?.playerData);
  } catch {
    return null;
  }
}

// Navigation events carry the incoming page's data; dig the player
// response out of whatever shape the detail object has.
function captureNavData(event: Event): void {
  const detail: any = (event as CustomEvent).detail ?? {};
  const found =
    dataFromPlayerResponse(detail) ??
    dataFromPlayerResponse(detail?.playerResponse) ??
    dataFromPlayerResponse(detail?.response?.playerResponse);
  if (found) navData = found;
}

// Last resort: if no in-page data source ever matches the current video
// (some environments never swap ytInitialPlayerResponse on SPA
// navigation), fetch the watch page itself and read its embedded data.
async function fetchTagData(videoId: string): Promise<void> {
  if (fetchFor === videoId) return;
  fetchFor = videoId;
  try {
    const res = await fetch(`/watch?v=${encodeURIComponent(videoId)}`, { credentials: 'omit' });
    if (!res.ok) return;
    const html = await res.text();
    const m =
      html.match(/"keywords":(\[[^\]]*\]),"channelId"/) ?? html.match(/"keywords":(\[[^\]]*\])/);
    if (!m) return;
    fetchedData = { id: videoId, tags: cleanTags(JSON.parse(m[1])) };
    schedule();
  } catch {}
}

function currentVideoId(): string {
  return new URLSearchParams(location.search).get('v') ?? '';
}

function playerVideoId(): string {
  try {
    return (unsafeWindow as any)?.ytInitialPlayerResponse?.videoDetails?.videoId ?? '';
  } catch {
    return '';
  }
}

// During SPA navigation the URL changes before the page data does, and
// the data swap itself produces no DOM mutation to observe. Retry for a
// few seconds so rendering waits until the data matches the URL.
function scheduleRetry(videoId: string): void {
  if (retryFor !== videoId) {
    retryFor = videoId;
    retryCount = 0;
  }
  if (retryCount >= 20) return;
  retryCount++;
  setTimeout(schedule, 300);
}

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  // YouTube sets the `dark` attribute on <html> in dark theme.
  // Color values below were measured from the rendered desktop site.
  // The description box is flat. The copy button matches the tonal XS
  // button used for "パネルを開く" (flat 10% layer, 24px pill, 12px text).
  style.textContent = `
    #${ROOT_ID}, #${ROOT_ID} * { box-sizing: border-box; }
    #${ROOT_ID} {
      --yht-bg: #f2f2f2;
      --yht-fg: #0f0f0f;
      --yht-chip-bg: #e6e6e6;
      --yht-chip-bg-hover: #dbdbdb;
      --yht-btn-bg: rgba(0, 0, 0, 0.05);
      --yht-btn-bg-hover: rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      margin-top: 12px;
      padding: 12px;
      border-radius: 12px;
      background-color: var(--yht-bg);
      color: var(--yht-fg);
      font-family: Roboto, Arial, sans-serif;
      font-size: 14px;
      line-height: 20px;
    }
    [dark] #${ROOT_ID}, #${ROOT_ID}[data-theme='dark'] {
      --yht-bg: #272727;
      --yht-fg: #f1f1f1;
      --yht-chip-bg: #3d3d3d;
      --yht-chip-bg-hover: #4d4d4d;
      --yht-btn-bg: rgba(255, 255, 255, 0.1);
      --yht-btn-bg-hover: rgba(255, 255, 255, 0.2);
    }
    #${ROOT_ID} .yht-head {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 500; margin-bottom: 8px;
    }
    #${ROOT_ID} .yht-count { opacity: .6; font-weight: 400; }
    #${ROOT_ID} .yht-copy {
      margin-left: auto; border: 0; cursor: pointer;
      height: 24px; padding: 0 10px; border-radius: 12px;
      display: inline-flex; align-items: center;
      font-size: 12px; font-weight: 500; line-height: 24px;
      background: var(--yht-btn-bg);
      color: var(--yht-fg);
    }
    #${ROOT_ID} .yht-copy:hover { background: var(--yht-btn-bg-hover); }
    #${ROOT_ID}[data-site='mobile'] .yht-copy {
      height: auto; padding: 0; border-radius: 0;
      background: none; font-size: 14px; line-height: 20px; font-weight: 500;
    }
    #${ROOT_ID}[data-site='mobile'] .yht-copy:hover { background: none; }
    #${ROOT_ID} .yht-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    #${ROOT_ID} .yht-chip {
      height: 32px; padding: 0 12px; border-radius: 999px;
      display: inline-flex; align-items: center;
      font-size: 14px; text-decoration: none; cursor: pointer;
      background: var(--yht-chip-bg);
      color: var(--yht-fg);
    }
    #${ROOT_ID} .yht-chip:hover { background: var(--yht-chip-bg-hover); }
  `;
  document.head.appendChild(style);
}

function buildRoot(tags: string[]): HTMLDivElement {
  const root = document.createElement('div');
  root.id = ROOT_ID;
  if (location.hostname === 'm.youtube.com') root.dataset.site = 'mobile';

  const head = document.createElement('div');
  head.className = 'yht-head';

  const title = document.createElement('span');
  title.textContent = `🏷️ ${t.tags}`;

  const count = document.createElement('span');
  count.className = 'yht-count';
  count.textContent = `(${tags.length})`;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'yht-copy';
  copyBtn.type = 'button';
  copyBtn.textContent = t.copyAll;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(tags.join(', '));
      copyBtn.textContent = t.copied;
    } catch {
      copyBtn.textContent = t.copyFailed;
    }
    setTimeout(() => {
      copyBtn.textContent = t.copyAll;
    }, 1500);
  });

  head.append(title, count, copyBtn);

  const chips = document.createElement('div');
  chips.className = 'yht-chips';
  for (const tag of tags) {
    const chip = document.createElement('a');
    chip.className = 'yht-chip';
    chip.textContent = tag;
    chip.href = `/results?search_query=${encodeURIComponent(tag)}`;
    chips.appendChild(chip);
  }

  root.append(head, chips);
  return root;
}

function removeRoot(): void {
  document.getElementById(ROOT_ID)?.remove();
}

// The mobile site does not mark dark theme with a [dark] attribute the
// way the desktop site does, so detect it from the description's own
// text color instead: light text means a dark theme.
function applyTheme(root: HTMLElement, anchor: Element): void {
  const parts = getComputedStyle(anchor).color.match(/[\d.]+/g);
  if (!parts) return;
  const [r, g, b] = parts.map(Number);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  root.dataset.theme = luminance > 128 ? 'dark' : 'light';
}

// #bottom-row is a wrapping row and widens itself with a negative margin-right.
// A 100% basis follows that extra width and sticks out past the cards.
function placeRoot(root: HTMLElement, anchor: Element): void {
  const row = anchor.closest('#bottom-row');
  if (row) {
    if (root.parentElement !== row || row.lastElementChild !== root) row.appendChild(root);
  } else if (anchor.nextElementSibling !== root) {
    anchor.insertAdjacentElement('afterend', root);
  }
  const parent = root.parentElement;
  const cs = parent ? getComputedStyle(parent) : null;
  const wrappingRow =
    !!cs &&
    (cs.display === 'flex' || cs.display === 'inline-flex') &&
    cs.flexDirection.startsWith('row') &&
    cs.flexWrap.startsWith('wrap');
  if (!wrappingRow) {
    root.style.flex = '';
    root.style.width = '';
    root.style.maxWidth = '';
    return;
  }
  const pull = -(parseFloat(cs.marginRight) || 0);
  const basis = pull > 0 ? `calc(100% - ${pull}px)` : '100%';
  root.style.flex = `0 0 ${basis}`;
  root.style.width = basis;
  root.style.maxWidth = basis;
}

function tryRender(): void {
  if (location.pathname !== '/watch') {
    removeRoot();
    lastKey = '';
    return;
  }

  const videoId = currentVideoId();
  if (!videoId) return;

  if (videoId !== seenVideoId) {
    seenVideoId = videoId;
    lastKey = '';
    retryFor = '';
    retryCount = 0;
    navAt = Date.now();
    removeRoot();
  }

  const anchor =
    document.querySelector('ytd-watch-metadata #description') ??
    document.querySelector('#primary-inner #description') ??
    document.querySelector('#description.ytd-text-inline-expander') ??
    document.querySelector('ytm-expandable-video-description-body-renderer') ??
    document.querySelector('ytm-video-description-header-renderer');
  if (!anchor) return;

  // Note: <meta name="keywords"> is not a valid source here. On the
  // current site it holds generic site-wide keywords, not the video's
  // tags, so it must never be rendered as if it were the video's data.
  const matched = [navData, windowData(), flexyData(), fetchedData].find(
    (d) => d && d.id === videoId,
  );
  if (!matched || matched.tags.length === 0) {
    if (!matched) {
      scheduleRetry(videoId);
      if (Date.now() - navAt > 1500) void fetchTagData(videoId);
    }
    return;
  }
  const tags = matched.tags;
  retryFor = '';
  retryCount = 0;

  const key = `${videoId}|${tags.join('\u0001')}`;
  const existing = document.getElementById(ROOT_ID);
  if (
    key === lastKey &&
    existing &&
    anchor.compareDocumentPosition(existing) & Node.DOCUMENT_POSITION_FOLLOWING
  ) {
    applyTheme(existing, anchor);
    placeRoot(existing, anchor);
    return;
  }

  lastKey = key;
  ensureStyle();

  const root = buildRoot(tags);
  existing?.remove();
  applyTheme(root, anchor);
  placeRoot(root, anchor);
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    tryRender();
  });
}

document.addEventListener('yt-navigate-start', () => {
  lastKey = '';
  removeRoot();
});
document.addEventListener('yt-navigate-finish', (e) => {
  captureNavData(e);
  schedule();
});
document.addEventListener('yt-page-data-updated', (e) => {
  captureNavData(e);
  schedule();
});
window.addEventListener('popstate', schedule);

const observer = new MutationObserver((mutations) => {
  const root = document.getElementById(ROOT_ID);
  for (const m of mutations) {
    if (root && (m.target === root || root.contains(m.target as Node))) continue;
    schedule();
    return;
  }
});
observer.observe(document.body, { childList: true, subtree: true });
observer.observe(document.head, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['content'],
});

// Watchdog: the player data can be swapped in with no DOM mutation and
// no navigation event, so poll a cheap signature of the current data.
setInterval(() => {
  if (location.pathname !== '/watch') return;
  const signature = `${currentVideoId()}|${playerVideoId()}|${navData?.id ?? ''}|${fetchedData?.id ?? ''}`;
  if (signature === lastSignature) return;
  lastSignature = signature;
  retryFor = '';
  retryCount = 0;
  schedule();
}, 500);

schedule();
