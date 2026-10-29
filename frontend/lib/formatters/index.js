/** Format INR amounts (e.g. ₹1,45,230.50) using Indian numbering system */
export function formatINR(val, { decimals = 2, showSign = false } = {}) {
  const n = Number(val || 0);
  const sign = showSign && n > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)}`;
}

export function formatPct(val, { decimals = 2, showSign = true } = {}) {
  const n = Number(val || 0);
  const sign = showSign && n > 0 ? '+' : '';
  return `${sign}${n.toFixed(decimals)}%`;
}

export function formatVolume(val) {
  const n = Number(val || 0);
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} K`;
  return n.toLocaleString('en-IN');
}
