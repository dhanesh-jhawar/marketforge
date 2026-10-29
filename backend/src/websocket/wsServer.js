import { WebSocketServer } from 'ws';
import { WS_EVENTS, WS_CLIENT_ACTIONS, WS_CHANNELS, wsEnvelope } from '@marketforge/shared/constants';
import { eventBus } from './eventBus.js';
import { verifyToken } from '../services/auth/authService.js';
import { realtimeService } from '../services/websocket/realtimeService.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('ws');

/**
 * MarketForge WebSocket server (path /ws).
 *
 * Client -> server: { action: 'auth'|'subscribe'|'unsubscribe'|'ping', ... }
 * Server -> client: { event: 'price:update'|..., data, ts }
 *
 * Everyone is in 'market', 'news', 'system'. Authenticated sockets join
 * 'user:<id>'. Symbol subscriptions join 'symbol:<SYM>'.
 */
export function attachWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  /** @type {Map<import('ws').WebSocket, {userId:string|null, channels:Set<string>, alive:boolean}>} */
  const clients = new Map();

  const send = (ws, event, data) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(wsEnvelope(event, data))); };

  wss.on('connection', async (ws, req) => {
    const meta = { userId: null, channels: new Set([WS_CHANNELS.MARKET, WS_CHANNELS.NEWS, WS_CHANNELS.SYSTEM]), alive: true };
    clients.set(ws, meta);

    const token = new URL(req.url, 'http://x').searchParams.get('token');
    if (token) await authenticate(ws, meta, token);
    send(ws, WS_EVENTS.SYSTEM_STATUS, { connected: true, authenticated: Boolean(meta.userId) });

    ws.on('pong', () => { meta.alive = true; });
    ws.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      switch (msg.action) {
        case WS_CLIENT_ACTIONS.AUTH: await authenticate(ws, meta, msg.token); break;
        case WS_CLIENT_ACTIONS.SUBSCRIBE: {
          const symbols = sanitize(msg.symbols);
          symbols.forEach((s) => meta.channels.add(WS_CHANNELS.symbol(s)));
          await realtimeService.addInterest(symbols);
          break;
        }
        case WS_CLIENT_ACTIONS.UNSUBSCRIBE: {
          const symbols = sanitize(msg.symbols);
          symbols.forEach((s) => meta.channels.delete(WS_CHANNELS.symbol(s)));
          await realtimeService.removeInterest(symbols);
          break;
        }
        case WS_CLIENT_ACTIONS.PING: send(ws, WS_EVENTS.SYSTEM_STATUS, { pong: true }); break;
        default: break;
      }
    });
    ws.on('close', () => {
      const symbols = [...meta.channels].filter((c) => c.startsWith('symbol:')).map((c) => c.slice(7));
      realtimeService.removeInterest(symbols);
      clients.delete(ws);
    });
  });

  async function authenticate(ws, meta, token) {
    try {
      const user = await verifyToken(token);
      meta.userId = user.id;
      meta.channels.add(WS_CHANNELS.user(user.id));
    } catch { send(ws, WS_EVENTS.SYSTEM_STATUS, { authenticated: false, error: 'invalid_token' }); }
  }

  // Fan-out from the domain event bus.
  eventBus.on('event', ({ event, data, channel }) => {
    const target = channel ?? WS_CHANNELS.MARKET;
    const payload = JSON.stringify(wsEnvelope(event, data));
    for (const [ws, meta] of clients) if (meta.channels.has(target) && ws.readyState === ws.OPEN) ws.send(payload);
  });

  // Heartbeat to drop dead connections.
  const hb = setInterval(() => {
    for (const [ws, meta] of clients) {
      if (!meta.alive) { ws.terminate(); continue; }
      meta.alive = false; ws.ping();
    }
  }, 30000);
  wss.on('close', () => clearInterval(hb));

  log.info('WebSocket server attached at /ws');
  return { wss, clientCount: () => clients.size };
}

const sanitize = (symbols) => (Array.isArray(symbols) ? symbols : []).slice(0, 200).map((s) => String(s).toUpperCase().trim()).filter(Boolean);
