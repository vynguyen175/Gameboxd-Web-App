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
