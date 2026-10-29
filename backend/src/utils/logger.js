import { config } from '../config/index.js';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[config.logLevel] ?? LEVELS.info;

function log(level, scope, msg, meta) {
  if (LEVELS[level] < threshold) return;
  const line = { t: new Date().toISOString(), level, scope, msg, ...(meta ? { meta } : {}) };
  const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  out(config.isProd ? JSON.stringify(line) : `[${line.t}] ${level.toUpperCase().padEnd(5)} ${scope}: ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`);
}

/** @param {string} scope */
export const createLogger = (scope) => ({
  debug: (m, meta) => log('debug', scope, m, meta),
  info: (m, meta) => log('info', scope, m, meta),
  warn: (m, meta) => log('warn', scope, m, meta),
  error: (m, meta) => log('error', scope, m, meta),
});

export default createLogger('app');
