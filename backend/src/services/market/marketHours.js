import { MARKET_SESSION } from '@marketforge/shared/constants';

/** Returns current IST wall-clock parts regardless of server timezone. */
export function istParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return { weekday: parts.weekday, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/**
 * Deterministic session calculation from NSE regular hours.
 * TODO: load NSE holiday calendar into market_config and check it here.
 */
export function getIstSession(date = new Date(), holidays = []) {
  const { weekday, minutes } = istParts(date);
  if (weekday === 'Sat' || weekday === 'Sun') return MARKET_SESSION.CLOSED;
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
  if (holidays.includes(ymd)) return MARKET_SESSION.HOLIDAY;
  if (minutes >= 9 * 60 && minutes < 9 * 60 + 15) return MARKET_SESSION.PRE_OPEN;
  if (minutes >= 9 * 60 + 15 && minutes < 15 * 60 + 30) return MARKET_SESSION.OPEN;
  return MARKET_SESSION.CLOSED;
}
