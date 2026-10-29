/**
 * @typedef {Object} NewsArticle  Normalized across GNews / NewsAPI / others.
 * @property {string} id                stable hash of url
 * @property {string} title
 * @property {string|null} summary
 * @property {string|null} content
 * @property {string} url
 * @property {string|null} imageUrl
 * @property {string} sourceName
 * @property {string} provider          gnews | newsapi | mock
 * @property {string} publishedAt       ISO
 * @property {string[]} symbols         tagged NSE symbols
 * @property {string[]} sectors
 * @property {'POSITIVE'|'NEGATIVE'|'NEUTRAL'|null} sentiment  deterministic/keyword based, not AI
 * @property {string|null} category
 */

/** Small, dependency-free stable hash (FNV-1a) for dedupe keys. */
export function hashString(str = '') {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/** @param {Partial<NewsArticle>} a @returns {NewsArticle} */
export function createNewsArticle(a = {}) {
  return {
    id: a.id ?? hashString(a.url ?? a.title ?? String(Math.random())),
    title: a.title ?? '',
    summary: a.summary ?? null,
    content: a.content ?? null,
    url: a.url ?? '',
    imageUrl: a.imageUrl ?? null,
    sourceName: a.sourceName ?? 'Unknown',
    provider: a.provider ?? 'unknown',
    publishedAt: a.publishedAt ?? new Date().toISOString(),
    symbols: a.symbols ?? [],
    sectors: a.sectors ?? [],
    sentiment: a.sentiment ?? null,
    category: a.category ?? null,
  };
}
