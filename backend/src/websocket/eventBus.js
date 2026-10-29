import { EventEmitter } from 'node:events';
import { WS_EVENTS } from '@marketforge/shared/constants';

/**
 * Internal domain event bus. Services publish normalized MarketForge events
 * here; the WebSocket server fans them out to subscribed clients.
 * Swap for Redis pub/sub when running multiple backend instances.
 *
 * publish(event, data, { channel })
 *   channel: 'market' | 'news' | 'system' | 'user:<id>' | 'symbol:<SYM>'
 */
class EventBus extends EventEmitter {
  publish(event, data, { channel } = {}) {
    if (!Object.values(WS_EVENTS).includes(event)) throw new Error(`Unknown event '${event}'`);
    this.emit('event', { event, data, channel });
    this.emit(event, data, channel);
  }
}

export const eventBus = new EventBus();
eventBus.setMaxListeners(100);
