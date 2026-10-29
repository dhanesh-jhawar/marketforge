import { WS_CLIENT_ACTIONS, WS_EVENTS } from '@marketforge/shared/constants';
import { getApiToken } from '../api/client.js';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

class NormalizedWebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = new Map(); // event -> Set<callback>
    this.subscriptions = new Set();
    this.reconnectDelay = 2000;
  }

  connect() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    const token = getApiToken();
    const url = token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        // Resubscribe symbols on reconnect
        if (this.subscriptions.size > 0) {
          this.send({ action: WS_CLIENT_ACTIONS.SUBSCRIBE, symbols: [...this.subscriptions] });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const { event: evtName, data } = JSON.parse(event.data);
          const cbs = this.listeners.get(evtName);
          if (cbs) {
            cbs.forEach((cb) => cb(data));
          }
        } catch {
          // ignore invalid json
        }
      };

      this.ws.onclose = () => {
        setTimeout(() => this.connect(), this.reconnectDelay);
      };
    } catch (e) {
      setTimeout(() => this.connect(), this.reconnectDelay);
    }
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  subscribeSymbols(symbols) {
    const list = Array.isArray(symbols) ? symbols : [symbols];
    list.forEach((s) => this.subscriptions.add(s.toUpperCase()));
    this.send({ action: WS_CLIENT_ACTIONS.SUBSCRIBE, symbols: list });
  }

  unsubscribeSymbols(symbols) {
    const list = Array.isArray(symbols) ? symbols : [symbols];
    list.forEach((s) => this.subscriptions.delete(s.toUpperCase()));
    this.send({ action: WS_CLIENT_ACTIONS.UNSUBSCRIBE, symbols: list });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }
}

export const wsClient = new NormalizedWebSocketClient();
