import { NewsProvider } from '../base/interfaces.js';
import { createNewsArticle } from '@marketforge/shared/types';
import { httpJson } from '../../utils/index.js';

/** GNews adapter. Docs: https://gnews.io/docs/v4 */
export function normalizeGNewsArticle(a) {
  return createNewsArticle({
    title: a.title, summary: a.description, content: a.content, url: a.url, imageUrl: a.image,
    sourceName: a.source?.name, provider: 'gnews', publishedAt: a.publishedAt,
  });
}

export class GNewsProvider extends NewsProvider {
  constructor(cfg) { super('gnews', cfg); }
  isConfigured() { return Boolean(this.cfg.apiKey); }
  async getLatest({ query, limit = 20, from, language = 'en' } = {}) {
    const p = new URLSearchParams({ lang: language, country: 'in', max: String(Math.min(limit, 100)), apikey: this.cfg.apiKey });
    if (from) p.set('from', from.toISOString());
    let url;
    if (query) { p.set('q', query); url = `${this.cfg.baseUrl}/search?${p}`; }
    else { p.set('category', 'business'); url = `${this.cfg.baseUrl}/top-headlines?${p}`; }
    const b = await httpJson(url);
    return (b.articles ?? []).map(normalizeGNewsArticle);
  }
}
