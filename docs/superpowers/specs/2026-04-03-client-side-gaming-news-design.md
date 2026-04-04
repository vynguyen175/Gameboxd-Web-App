# Client-Side Gaming News via RSS Feeds

**Date:** 2026-04-03
**Status:** Approved

## Problem
The NewsPage calls `GET /news` on the backend, but that endpoint doesn't exist. Users see "Failed to load news."

## Solution
Fetch RSS feeds from major gaming outlets directly in the browser, parse XML with DOMParser, and display articles in the existing NewsPage UI.

## Sources
| Outlet | RSS URL |
|--------|---------|
| IGN | `https://feeds.feedburner.com/ign/all` |
| GameSpot | `https://www.gamespot.com/feeds/mashup/` |
| PC Gamer | `https://www.pcgamer.com/rss/` |
| Kotaku | `https://kotaku.com/rss` |

## Architecture

### New file: `src/services/newsService.js`
- Uses a CORS proxy (`api.allorigins.win`) to fetch RSS XML from each source
- Parses XML with browser-native `DOMParser`
- Extracts: title, description/summary, link, pubDate, image (from `media:content`, `enclosure`, or `media:thumbnail`)
- Normalizes into `{ title, summary, url, imageUrl, source, publishedAt }` matching existing NewsPage expectations
- Fetches all feeds concurrently with `Promise.allSettled` — if one feed fails, others still show
- Merges all articles, sorts by `publishedAt` descending

### Modified: `src/components/NewsPage.js`
- Replace `getNews()` import with new `fetchGamingNews()` from newsService
- Add per-source color coding for source badges
- Add refresh button

### Modified: `src/services/api.js`
- Remove unused `getNews` function

## Error Handling
- Individual feed failure: skip silently, show articles from working feeds
- All feeds fail: show error message (existing ErrorMessage component)
- Empty results: show existing EmptyState

## No New Dependencies
- `DOMParser` — built into all browsers
- `axios` — already in project
