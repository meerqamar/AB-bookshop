export function money(n) {
  return 'Rs ' + Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });
}

export function codFee() {
  return 299;
}

export function orderTotalWithCod(subtotal) {
  return subtotal + codFee();
}

export function discountPercent(original, sale) {
  if (!original || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

export const STATUS_COLORS = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Shipped: '#8b5cf6',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};
