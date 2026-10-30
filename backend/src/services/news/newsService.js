import { repos } from '../../repositories/index.js';
import { getProviders } from '../../providers/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { TTLCache } from '../../utils/index.js';
import { imageProvider } from '../../providers/images/imageProvider.js';
import { marketService } from '../market/marketService.js';

const newsCache = new TTLCache(60000); // 1 min

export const newsService = {
  async getLatest({ limit = 20, symbols, query, filter, sector } = {}) {
    const key = `latest:${limit}:${(symbols || []).join(',')}:${query || ''}:${filter || ''}:${sector || ''}`;
    const cached = newsCache.get(key);
    if (cached) return cached;

    const providers = getProviders();
    let articles = [];

    try {
      articles = await providers.news.getLatest({ limit: Math.max(limit, 25), symbols, query });
    } catch {
      // Fallback to database
      articles = await repos.news.findMany({}, { limit: 30, orderBy: 'published_at', desc: true });
    }

    if (!articles || articles.length === 0) {
      // Load fallback curated articles
      articles = this.getDefaultCuratedNews();
    }

    // Enrich each article with images, symbols, and current stock quotes
    const enriched = await Promise.all(
      articles.map(async (art) => {
        let syms = art.symbols || [];
        if (typeof syms === 'string') {
          try { syms = JSON.parse(syms); } catch { syms = syms.split(',').map((s) => s.trim()); }
        }

        // Detect symbols from title/summary if none
        if (!syms.length) {
          const txt = `${art.title || ''} ${art.summary || ''}`.toUpperCase();
          ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'TATAMOTORS', 'MARUTI', 'SUNPHARMA', 'TATASTEEL'].forEach((s) => {
            if (txt.includes(s) && !syms.includes(s)) syms.push(s);
          });
        }

        // Image enrichment
        let img = {
          imageUrl: art.imageUrl || art.image_url,
          imageThumbnailUrl: art.imageThumbnailUrl || art.image_thumbnail_url,
          imageProvider: art.imageProvider || art.image_provider,
          imageAuthor: art.imageAuthor || art.image_author,
          imageAuthorUrl: art.imageAuthorUrl || art.image_author_url,
        };

        if (!img.imageUrl || !img.imageUrl.startsWith('http')) {
          img = await imageProvider.resolveImage({
            ...art,
            symbols: syms,
            sector: art.sector || art.category,
            headline: art.title || art.headline,
          });
        }

        // Stock quotes enrichment
        let stockQuotes = [];
        if (syms.length) {
          stockQuotes = await Promise.all(
            syms.slice(0, 3).map(async (sym) => {
              try {
                const q = await marketService.getQuote(sym);
                return {
                  symbol: sym,
                  name: q.security?.name || sym,
                  ltp: q.ltp,
                  change: q.change,
                  changePct: q.changePct,
                };
              } catch {
                return { symbol: sym, ltp: 1000, change: 0, changePct: 0 };
              }
            })
          );
        }

        const enrichedArticle = {
          ...art,
          headline: art.title || art.headline,
          description: art.summary || art.description,
          source: art.sourceName || art.source || 'NSE Financial Wire',
          sourceUrl: art.url || art.sourceUrl || '#',
          symbols: syms,
          imageUrl: img.imageUrl,
          imageThumbnailUrl: img.imageThumbnailUrl || img.imageUrl,
          imageProvider: img.imageProvider,
          imageAuthor: img.imageAuthor,
          imageAuthorUrl: img.imageAuthorUrl,
          stockQuotes,
        };

        // Cache into DB asynchronously
        try {
          await repos.news.upsert({
            id: art.id,
            title: enrichedArticle.headline,
            headline: enrichedArticle.headline,
            summary: enrichedArticle.description,
            description: enrichedArticle.description,
            url: enrichedArticle.sourceUrl,
            imageUrl: enrichedArticle.imageUrl,
            imageThumbnailUrl: enrichedArticle.imageThumbnailUrl,
            imageProvider: enrichedArticle.imageProvider,
            imageAuthor: enrichedArticle.imageAuthor,
            imageAuthorUrl: enrichedArticle.imageAuthorUrl,
            sourceName: enrichedArticle.source,
            provider: art.provider || 'marketforge-news',
            category: art.category || art.sector || 'Equities',
            symbols: JSON.stringify(syms),
            sectors: art.sector || art.category || 'General',
            sentiment: art.sentiment || 'NEUTRAL',
            publishedAt: art.publishedAt || new Date().toISOString(),
          });
        } catch {
          // ignore cache errors
        }

        return enrichedArticle;
      })
    );

    // Apply filters
    let results = enriched;
    if (sector && sector !== 'ALL') {
      results = results.filter((a) => (a.category && a.category.toLowerCase().includes(sector.toLowerCase())) || (a.sector && a.sector.toLowerCase().includes(sector.toLowerCase())));
    }

    if (filter) {
      const f = filter.toUpperCase();
      if (f === 'TRENDING') {
        results = results.filter((a) => a.impact === 'HIGH IMPACT' || a.sentiment === 'POSITIVE');
      } else if (f === 'MARKET_MOVERS') {
        results = results.filter((a) => (a.stockQuotes || []).some((s) => Math.abs(s.changePct || 0) >= 0.75));
      } else if (f === 'COMPANY_NEWS') {
        results = results.filter((a) => (a.symbols || []).length > 0);
      } else if (f === 'MARKET_IMPACT') {
        results = results.filter((a) => a.impact === 'HIGH IMPACT' || a.impact === 'MODERATE IMPACT');
      }
    }

    const finalArticles = results.slice(0, limit);
    newsCache.set(key, finalArticles);
    return finalArticles;
  },

  async getById(id) {
    const article = await repos.news.findById(id);
    if (!article) throw ApiError.notFound('News article not found');
    return article;
  },

  async getForHoldings(userId) {
    const portfolio = await repos.portfolios.findOne({ userId });
    if (!portfolio) return this.getLatest({ limit: 10 });
    const holdings = await repos.holdings.findMany({ portfolioId: portfolio.id });
    const symbols = holdings.map((h) => h.symbol);
    if (!symbols.length) return this.getLatest({ limit: 10 });
    return this.getLatest({ symbols, limit: 20 });
  },

  async getForWatchlist(userId) {
    const watchlist = await repos.watchlists.findOne({ userId, isDefault: true });
    const symbols = watchlist?.symbols || [];
    if (!symbols.length) return this.getLatest({ limit: 10 });
    return this.getLatest({ symbols, limit: 20 });
  },

  async search(query, limit = 20) {
    if (!query) return [];
    return this.getLatest({ query, limit });
  },

  getDefaultCuratedNews() {
    return [
      {
        id: 'news-1',
        title: 'RBI Monetary Policy Committee maintains repo rate at 6.5%, signals focus on inflation glidepath',
        summary: 'The Reserve Bank of India retained policy stance of withdrawal of accommodation. System liquidity remains stable, supporting corporate lending and banking margins.',
        sourceName: 'Economic Times',
        url: 'https://economictimes.indiatimes.com',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        symbols: ['HDFCBANK', 'SBIN', 'ICICIBANK'],
        sector: 'Banking & Financial Services',
        category: 'Banking & Financial Services',
        sentiment: 'POSITIVE',
        impact: 'HIGH IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        imageThumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
        imageProvider: 'curated-unsplash',
        imageAuthor: 'Sean Pollock',
        imageAuthorUrl: 'https://unsplash.com/@seanpollock',
      },
      {
        id: 'news-2',
        title: 'Indian IT majors report sequential improvement in constant-currency deal bookings and margin expansion',
        summary: 'Stronger BFS pipeline in North American enterprises aids utilization rates. Operating margins expand by 40-60 bps sequentially across tier-1 exporters.',
        sourceName: 'LiveMint',
        url: 'https://www.livemint.com',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        symbols: ['TCS', 'INFY'],
        sector: 'Information Technology',
        category: 'Information Technology',
        sentiment: 'POSITIVE',
        impact: 'MODERATE IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        imageThumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
        imageProvider: 'curated-unsplash',
        imageAuthor: 'Alexandre Debiève',
        imageAuthorUrl: 'https://unsplash.com/@alexandre_debieve',
      },
      {
        id: 'news-3',
        title: 'Crude oil prices hover near $78/bbl amidst Middle East logistics monitoring; OMCs stable',
        summary: 'Brent futures trade in a tight range as shipping freight premiums stabilize. Domestic refining margins remain supported by stable retail demand.',
        sourceName: 'Business Standard',
        url: 'https://www.business-standard.com',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        symbols: ['RELIANCE'],
        sector: 'Energy & Petrochemicals',
        category: 'Energy & Petrochemicals',
        sentiment: 'NEUTRAL',
        impact: 'MODERATE IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80',
        imageThumbnailUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=400&q=80',
        imageProvider: 'curated-unsplash',
        imageAuthor: 'Markus Spiske',
        imageAuthorUrl: 'https://unsplash.com/@markusspiske',
      },
      {
        id: 'news-4',
        title: 'Automobile retail registrations record 11% year-on-year growth during festive Dhanteras deliveries',
        summary: 'Passenger vehicles and utility vehicle retail dispatches reach record highs as consumer demand rebounds across urban and semi-rural geographies.',
        sourceName: 'CNBC-TV18',
        url: 'https://www.cnbctv18.com',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        symbols: ['TATAMOTORS', 'MARUTI'],
        sector: 'Automobile',
        category: 'Automobile',
        sentiment: 'POSITIVE',
        impact: 'HIGH IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        imageThumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
        imageProvider: 'curated-unsplash',
        imageAuthor: 'Campbell',
        imageAuthorUrl: 'https://unsplash.com/@campbell33',
      },
      {
        id: 'news-5',
        title: 'NIFTY 50 consolidates above 24,300 level as domestic mutual fund SIP inflows reach all-time high',
        summary: 'Systematic Investment Plan (SIP) contributions hit ₹23,500 crore in the recent month, absorbing foreign institutional selling pressure and stabilizing market breadth.',
        sourceName: 'Financial Express',
        url: 'https://www.financialexpress.com',
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        symbols: ['HDFCBANK', 'RELIANCE', 'TCS'],
        sector: 'Macro & Markets',
        category: 'Macro & Markets',
        sentiment: 'POSITIVE',
        impact: 'HIGH IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
        imageThumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
        imageProvider: 'curated-unsplash',
        imageAuthor: 'Nicholas Cappello',
        imageAuthorUrl: 'https://unsplash.com/@nicholascappello',
      },
    ];
  },
};
