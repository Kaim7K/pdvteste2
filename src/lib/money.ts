export function toMoney(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isFinite(n) ? n : 0);
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function applyDiscount(subtotal: number, type: "NONE" | "FIXED" | "PERCENTAGE", discountValue: number) {
  if (type === "FIXED") return Math.max(0, roundMoney(subtotal - discountValue));
  if (type === "PERCENTAGE") return Math.max(0, roundMoney(subtotal - subtotal * (discountValue / 100)));
  return roundMoney(subtotal);
}
