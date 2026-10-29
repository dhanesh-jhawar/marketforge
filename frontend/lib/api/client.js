import { demoStocks, demoIndices, demoPortfolio, demoHoldings, demoNews } from '../../data/demo/fixtures.js';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const USE_DEMO_FALLBACK = process.env.NEXT_PUBLIC_USE_DEMO_FALLBACK === 'true';

let authToken = null;

export function setApiToken(token) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('marketforge_token', token);
    else localStorage.removeItem('marketforge_token');
  }
}

export function getApiToken() {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('marketforge_token');
  }
  return authToken;
}

export async function apiClient(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = getApiToken();
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    if (!res.ok) {
      const err = new Error(json?.error?.message || `HTTP ${res.status}`);
      err.code = json?.error?.code;
      err.details = json?.error?.details;
      throw err;
    }
    return json.data;
  } catch (err) {
    if (USE_DEMO_FALLBACK) {
      const fallback = getDemoFallback(endpoint, method);
      if (fallback !== undefined) {
        console.warn(`[MarketForge API] Backend unreachable at ${endpoint}. Using seeded fallback data.`);
        return fallback;
      }
    }
    throw err;
  }
}

function getDemoFallback(endpoint, method) {
  if (endpoint.startsWith('/markets/indices')) return demoIndices;
  if (endpoint.startsWith('/markets/movers')) return { gainers: demoStocks.slice(0, 4), losers: demoStocks.slice(4, 7), active: demoStocks };
  if (endpoint.startsWith('/markets/status')) return { exchange: 'NSE', session: 'OPEN', isOpen: true, timestamp: Date.now() };
  if (endpoint.startsWith('/markets')) return demoStocks;
  if (endpoint.startsWith('/portfolio/holdings')) return demoHoldings;
  if (endpoint.startsWith('/portfolio')) return demoPortfolio;
  if (endpoint.startsWith('/news')) return demoNews;
  if (endpoint.startsWith('/auth/me')) return { id: 'demo-user', displayName: 'Market Pioneer', email: 'trader@marketforge.dev', xp: 450, experienceLevel: 'INTERMEDIATE', onboardingComplete: true };
  return undefined;
}
