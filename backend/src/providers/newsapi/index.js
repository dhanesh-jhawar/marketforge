import { NewsProvider } from '../base/interfaces.js';
import { createNewsArticle } from '@marketforge/shared/types';
import { httpJson } from '../../utils/index.js';

/** NewsAPI.org adapter (fallback). Docs: https://newsapi.org/docs */
export function normalizeNewsApiArticle(a) {
  return createNewsArticle({
    title: a.title, summary: a.description, content: a.content, url: a.url, imageUrl: a.urlToImage,
    sourceName: a.source?.name, provider: 'newsapi', publishedAt: a.publishedAt,
  });
}

export class NewsApiProvider extends NewsProvider {
  constructor(cfg) { super('newsapi', cfg); }
  isConfigured() { return Boolean(this.cfg.apiKey); }
  async getLatest({ query, limit = 20, from, language = 'en' } = {}) {
    const headers = { 'X-Api-Key': this.cfg.apiKey };
    let url;
    if (query) {
      const p = new URLSearchParams({ q: query, language, sortBy: 'publishedAt', pageSize: String(Math.min(limit, 100)) });
      if (from) p.set('from', from.toISOString());
      url = `${this.cfg.baseUrl}/everything?${p}`;
    } else {
      url = `${this.cfg.baseUrl}/top-headlines?${new URLSearchParams({ country: 'in', category: 'business', pageSize: String(Math.min(limit, 100)) })}`;
    }
    const b = await httpJson(url, { headers });
    return (b.articles ?? []).filter((a) => a.title && a.title !== '[Removed]').map(normalizeNewsApiArticle);
  }
}
