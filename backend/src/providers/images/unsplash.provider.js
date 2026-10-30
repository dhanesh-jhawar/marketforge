import { httpJson } from '../../utils/index.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('provider:unsplash');

const SECTOR_IMAGE_MAP = {
  ENERGY: {
    url: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=400&q=80',
    author: 'Markus Spiske',
    authorUrl: 'https://unsplash.com/@markusspiske',
  },
  TECHNOLOGY: {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    author: 'Alexandre Debiève',
    authorUrl: 'https://unsplash.com/@alexandre_debieve',
  },
  BANKING: {
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    author: 'Sean Pollock',
    authorUrl: 'https://unsplash.com/@seanpollock',
  },
  AUTOMOTIVE: {
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
    author: 'Campbell',
    authorUrl: 'https://unsplash.com/@campbell33',
  },
  PHARMACEUTICAL: {
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    author: 'Kendall Henderson',
    authorUrl: 'https://unsplash.com/@kendall_henderson',
  },
  METALS: {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80',
    author: 'Ant Rozetsky',
    authorUrl: 'https://unsplash.com/@rozetsky',
  },
  FMCG: {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    author: 'Jason Leung',
    authorUrl: 'https://unsplash.com/@ninjason',
  },
  MARKETS: {
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    author: 'Nicholas Cappello',
    authorUrl: 'https://unsplash.com/@nicholascappello',
  },
  ECONOMY: {
    url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=400&q=80',
    author: 'Mackenzie Marco',
    authorUrl: 'https://unsplash.com/@mackenziemarco',
  },
};

export class UnsplashImageProvider {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.UNSPLASH_ACCESS_KEY;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async searchImage({ query, symbol, sector, headline }) {
    // 1. Try real Unsplash API if access key configured
    if (this.isConfigured()) {
      try {
        const searchQuery = query || `${symbol || ''} ${sector || ''} ${headline || 'stock market'}`.trim();
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=1&client_id=${this.apiKey}`;
        const data = await httpJson(url);
        if (data?.results?.length) {
          const photo = data.results[0];
          return {
            imageUrl: photo.urls.regular,
            imageThumbnailUrl: photo.urls.small,
            imageProvider: 'unsplash',
            imageAuthor: photo.user?.name || 'Unsplash Contributor',
            imageAuthorUrl: photo.user?.links?.html || 'https://unsplash.com',
          };
        }
      } catch (err) {
        log.warn('Unsplash live search failed, falling back to curated library:', err.message);
      }
    }

    // 2. Curated Contextual Match
    const sec = (sector || '').toUpperCase();
    const sym = (symbol || '').toUpperCase();
    const txt = `${headline || ''} ${sym} ${sec}`.toUpperCase();

    if (sym === 'RELIANCE' || sec.includes('ENERGY') || txt.includes('OIL') || txt.includes('REFINERY')) {
      const match = SECTOR_IMAGE_MAP.ENERGY;
      return { imageUrl: match.url, imageThumbnailUrl: match.thumb, imageProvider: 'curated-unsplash', imageAuthor: match.author, imageAuthorUrl: match.authorUrl };
    }
    if (sym === 'TCS' || sym === 'INFY' || sym === 'WIPRO' || sec.includes('TECH') || sec.includes('IT') || txt.includes('SOFTWARE') || txt.includes('AI')) {
      const match = SECTOR_IMAGE_MAP.TECHNOLOGY;
      return { imageUrl: match.url, imageThumbnailUrl: match.thumb, imageProvider: 'curated-unsplash', imageAuthor: match.author, imageAuthorUrl: match.authorUrl };
    }
    if (sym.includes('BANK') || sym === 'HDFCBANK' || sym === 'SBIN' || sym === 'ICICIBANK' || sec.includes('BANK') || sec.includes('FINANCE')) {
      const match = SECTOR_IMAGE_MAP.BANKING;
      return { imageUrl: match.url, imageThumbnailUrl: match.thumb, imageProvider: 'curated-unsplash', imageAuthor: match.author, imageAuthorUrl: match.authorUrl };
    }
    if (sym === 'TATAMOTORS' || sym === 'MARUTI' || sec.includes('AUTO') || txt.includes('EV') || txt.includes('VEHICLE')) {
      const match = SECTOR_IMAGE_MAP.AUTOMOTIVE;
      return { imageUrl: match.url, imageThumbnailUrl: match.thumb, imageProvider: 'curated-unsplash', imageAuthor: match.author, imageAuthorUrl: match.authorUrl };
    }
    if (sym.includes('PHARMA') || sym === 'SUNPHARMA' || sec.includes('HEALTH') || sec.includes('PHARMA')) {
      const match = SECTOR_IMAGE_MAP.PHARMACEUTICAL;
      return { imageUrl: match.url, imageThumbnailUrl: match.thumb, imageProvider: 'curated-unsplash', imageAuthor: match.author, imageAuthorUrl: match.authorUrl };
    }
    if (sym.includes('STEEL') || sym === 'TATASTEEL' || sec.includes('METAL')) {
      const match = SECTOR_IMAGE_MAP.METALS;
      return { imageUrl: match.url, imageThumbnailUrl: match.thumb, imageProvider: 'curated-unsplash', imageAuthor: match.author, imageAuthorUrl: match.authorUrl };
    }
    if (txt.includes('RBI') || txt.includes('INFLATION') || txt.includes('GDP') || txt.includes('ECONOMY') || txt.includes('POLICY')) {
      const match = SECTOR_IMAGE_MAP.ECONOMY;
      return { imageUrl: match.url, imageThumbnailUrl: match.thumb, imageProvider: 'curated-unsplash', imageAuthor: match.author, imageAuthorUrl: match.authorUrl };
    }

    // Default to Institutional Markets imagery
    const match = SECTOR_IMAGE_MAP.MARKETS;
    return {
      imageUrl: match.url,
      imageThumbnailUrl: match.thumb,
      imageProvider: 'curated-unsplash',
      imageAuthor: match.author,
      imageAuthorUrl: match.authorUrl,
    };
  }
}

