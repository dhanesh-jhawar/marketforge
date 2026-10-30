import { UnsplashImageProvider } from './unsplash.provider.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('imageProvider');

class ImageProviderService {
  constructor() {
    this.unsplash = new UnsplashImageProvider();
  }

  /**
   * Resolves or enriches an article with a high-fidelity image
   * @param {{ imageUrl?: string, title?: string, headline?: string, summary?: string, symbols?: string[], category?: string, sector?: string }} article
   */
  async resolveImage(article) {
    // 1. Direct article image from provider (e.g. GNews / NewsAPI)
    if (article.imageUrl && article.imageUrl.startsWith('http')) {
      return {
        imageUrl: article.imageUrl,
        imageThumbnailUrl: article.imageThumbnailUrl || article.imageUrl,
        imageProvider: article.imageProvider || 'news-source',
        imageAuthor: article.imageAuthor || null,
        imageAuthorUrl: article.imageAuthorUrl || null,
      };
    }

    const symbol = article.symbols?.[0] || '';
    const headline = article.headline || article.title || '';
    const sector = article.sector || article.category || '';

    try {
      const match = await this.unsplash.searchImage({
        symbol,
        sector,
        headline,
        query: `${symbol} ${sector} ${headline}`.trim(),
      });
      return match;
    } catch (err) {
      log.error('Failed to resolve image for article:', err.message);
      return {
        imageUrl: null,
        imageThumbnailUrl: null,
        imageProvider: null,
        imageAuthor: null,
        imageAuthorUrl: null,
      };
    }
  }
}

export const imageProvider = new ImageProviderService();

