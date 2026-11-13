export const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₱0.00";
  return n.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
};

export const discountPercent = (product) => {
  if (!product) return 0;
  const price = Number(product.price);
  const original = Number(product.original_price);
  if (!Number.isFinite(price) || !Number.isFinite(original) || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
};

export const soldLabel = (count) => {
  const n = Number(count) || 0;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
};

export const FREE_SHIPPING_THRESHOLD = 2000;
export const SHIPPING_FEE = 99;
