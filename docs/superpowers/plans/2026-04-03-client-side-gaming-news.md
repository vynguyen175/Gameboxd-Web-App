# Client-Side Gaming News Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken backend `/news` endpoint with client-side RSS feed fetching from major gaming outlets.

**Architecture:** New `newsService.js` fetches RSS XML from IGN, GameSpot, PC Gamer, and Kotaku via a CORS proxy, parses with browser-native `DOMParser`, normalizes articles into the existing `{ title, summary, url, imageUrl, source, publishedAt }` shape. NewsPage swaps its data source and gains per-source badge colors and a refresh button.

**Tech Stack:** React, styled-components, axios (existing), DOMParser (browser-native), api.allorigins.win (CORS proxy)

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/services/newsService.js` | RSS fetching, XML parsing, article normalization |
| Modify | `src/components/NewsPage.js` | Swap data source, add source colors, add refresh button |
| Modify | `src/services/api.js` | Remove unused `getNews` function |

---

### Task 1: Create `newsService.js` — RSS fetching and parsing

**Files:**
- Create: `src/services/newsService.js`

- [ ] **Step 1: Create the news service with feed config and fetch logic**

```js
import axios from 'axios';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const FEEDS = [
  { name: 'IGN', url: 'https://feeds.feedburner.com/ign/all' },
  { name: 'GameSpot', url: 'https://www.gamespot.com/feeds/mashup/' },
  { name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/' },
  { name: 'Kotaku', url: 'https://kotaku.com/rss' },
];

function stripHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

function extractImage(item) {
  const mediaContent = item.getElementsByTagName('media:content')[0]
    || item.getElementsByTagName('media:thumbnail')[0];
  if (mediaContent) {
    const url = mediaContent.getAttribute('url');
    if (url) return url;
  }

  const enclosure = item.getElementsByTagName('enclosure')[0];
  if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
    return enclosure.getAttribute('url');
  }

  const description = item.getElementsByTagName('description')[0]?.textContent || '';
  const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) return imgMatch[1];

  return null;
}

function parseFeed(xml, sourceName) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) return [];

  const items = doc.querySelectorAll('item');
  const articles = [];

  items.forEach((item) => {
    const title = item.getElementsByTagName('title')[0]?.textContent?.trim();
    const link = item.getElementsByTagName('link')[0]?.textContent?.trim();
    const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent?.trim();
    const descriptionRaw = item.getElementsByTagName('description')[0]?.textContent || '';
    const summary = stripHtml(descriptionRaw).slice(0, 300);
    const imageUrl = extractImage(item);

    if (title && link) {
      articles.push({
        title,
        summary,
        url: link,
        imageUrl,
        source: sourceName,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  });

  return articles;
}

async function fetchFeed(feed) {
  const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(feed.url)}`, {
    timeout: 10000,
  });
  return parseFeed(response.data, feed.name);
}

export async function fetchGamingNews() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const articles = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return articles;
}
```

- [ ] **Step 2: Verify the file was created correctly**

Run: `node -e "try { require('./src/services/newsService.js') } catch(e) { console.log('Syntax check — expected module error is fine:', e.code) }"`

Expected: No syntax errors (module/import error is expected since this is ESM in a CRA project)

- [ ] **Step 3: Commit**

```bash
git add src/services/newsService.js
git commit -m "feat: add newsService for client-side RSS feed fetching"
```

---

### Task 2: Update NewsPage to use newsService

**Files:**
- Modify: `src/components/NewsPage.js`

- [ ] **Step 1: Replace the import — swap `getNews` for `fetchGamingNews`**

Change line 3 from:
```js
import { getNews } from '../services/api';
```
to:
```js
import { fetchGamingNews } from '../services/newsService';
```

- [ ] **Step 2: Add source color map and styled RefreshButton after the existing `ErrorMessage` styled component (after line 150)**

```js
const SOURCE_COLORS = {
  IGN: { bg: 'rgba(191, 0, 0, 0.15)', text: '#FF4444' },
  GameSpot: { bg: 'rgba(255, 170, 0, 0.15)', text: '#FFAA00' },
  'PC Gamer': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA' },
  Kotaku: { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7' },
};

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const HeaderLeft = styled.div``;

const RefreshButton = styled.button`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

- [ ] **Step 3: Update the SourceBadge to accept dynamic colors**

Replace the existing `SourceBadge` styled component (lines 119-126) with:

```js
const SourceBadge = styled.span`
  background: ${props => props.$bg || 'rgba(168, 85, 247, 0.15)'};
  color: ${props => props.$color || 'var(--neon-purple)'};
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
`;
```

- [ ] **Step 4: Update the NewsPage function component**

Replace the entire `function NewsPage()` block (lines 167-228) with:

```js
function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGamingNews();
      setArticles(data);
    } catch (err) {
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <PageContainer>
      <HeaderRow>
        <HeaderLeft>
          <PageTitle>Gaming News</PageTitle>
          <PageSubtitle style={{ marginBottom: 0 }}>Latest news from the gaming world</PageSubtitle>
        </HeaderLeft>
        <RefreshButton onClick={loadNews} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </RefreshButton>
      </HeaderRow>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner text="Loading news" />
      ) : articles.length === 0 ? (
        <EmptyState>
          <EmptyTitle>No news articles yet</EmptyTitle>
          <p>Check back later for the latest gaming news.</p>
        </EmptyState>
      ) : (
        <ArticleGrid>
          {articles.map((article, i) => {
            const colors = SOURCE_COLORS[article.source] || {};
            return (
              <ArticleCard
                key={article.url + i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                $delay={`${i * 0.05}s`}
              >
                <ArticleImage $src={article.imageUrl} />
                <ArticleContent>
                  <div>
                    <ArticleTitle>{article.title}</ArticleTitle>
                    <ArticleSummary>{article.summary}</ArticleSummary>
                  </div>
                  <ArticleMeta>
                    <SourceBadge $bg={colors.bg} $color={colors.text}>
                      {article.source}
                    </SourceBadge>
                    <span>{timeAgo(article.publishedAt)}</span>
                  </ArticleMeta>
                </ArticleContent>
              </ArticleCard>
            );
          })}
        </ArticleGrid>
      )}
    </PageContainer>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/NewsPage.js
git commit -m "feat: wire NewsPage to client-side RSS feeds with source colors and refresh"
```

---

### Task 3: Remove unused `getNews` from api.js

**Files:**
- Modify: `src/services/api.js:502-507`

- [ ] **Step 1: Remove the `getNews` function**

Delete lines 502-507 (the news section comment and function):

```js
// ─── News ──────────────────────────────────────────────────────────────────

export const getNews = async () => {
  const response = await api.get('/news');
  return response.data;
};
```

- [ ] **Step 2: Verify no other files import `getNews`**

Run: `grep -r "getNews" src/ --include="*.js"`

Expected: No results (NewsPage now imports from newsService instead)

- [ ] **Step 3: Commit**

```bash
git add src/services/api.js
git commit -m "chore: remove unused getNews backend API call"
```

---

### Task 4: Build verification

- [ ] **Step 1: Run the build**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: If build fails, fix any issues and re-run**

- [ ] **Step 3: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: resolve build errors from news feature"
```
