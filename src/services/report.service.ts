import { addDays, endOfDay, format, startOfDay, subDays } from "date-fns";
import { PaymentMethod, SaleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { roundMoney } from "@/lib/money";

function periodFromPreset(preset: string, from?: string | null, to?: string | null) {
  const now = new Date();
  if (preset === "custom" && from && to) return { start: startOfDay(new Date(from)), end: endOfDay(new Date(to)) };
  if (preset === "week") return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
  if (preset === "month") return { start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), end: endOfDay(now) };
  if (preset === "year") return { start: startOfDay(new Date(now.getFullYear(), 0, 1)), end: endOfDay(now) };
  return { start: startOfDay(now), end: endOfDay(now) };
}

export async function getReport(preset = "today", from?: string | null, to?: string | null) {
  const { start, end } = periodFromPreset(preset, from, to);
  const previousLength = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const previousStart = subDays(start, previousLength);
  const previousEnd = subDays(end, previousLength);

  const [sales, previousSales, creditOpen, cancelledCount, negativeProducts] = await Promise.all([
    prisma.sale.findMany({ where: { status: SaleStatus.COMPLETED, completedAt: { gte: start, lte: end }, deletedAt: null }, include: { items: true, payments: true, user: true } }),
    prisma.sale.findMany({ where: { status: SaleStatus.COMPLETED, completedAt: { gte: previousStart, lte: previousEnd }, deletedAt: null } }),
    prisma.creditSale.aggregate({ _sum: { pendingAmount: true }, where: { status: { in: ["OPEN", "PARTIAL"] } } }),
    prisma.sale.count({ where: { status: SaleStatus.CANCELLED, cancelledAt: { gte: start, lte: end } } }),
    prisma.product.count({ where: { stockQuantity: { lte: 0 }, deletedAt: null } })
  ]);

  const revenue = roundMoney(sales.reduce((acc, sale) => acc + Number(sale.total), 0));
  const previousRevenue = roundMoney(previousSales.reduce((acc, sale) => acc + Number(sale.total), 0));
  const ticket = sales.length ? roundMoney(revenue / sales.length) : 0;
  const growth = previousRevenue === 0 ? null : roundMoney(((revenue - previousRevenue) / previousRevenue) * 100);

  const productRank = new Map<string, { name: string; quantity: number; revenue: number }>();
  const paymentRank = new Map<PaymentMethod, number>();
  const sellerRank = new Map<string, { name: string; revenue: number; count: number }>();
  const daily = new Map<string, number>();

  for (const sale of sales) {
    const key = format(sale.completedAt ?? sale.createdAt, "yyyy-MM-dd");
    daily.set(key, roundMoney((daily.get(key) ?? 0) + Number(sale.total)));
    sellerRank.set(sale.userId, {
      name: sale.user.name,
      revenue: roundMoney((sellerRank.get(sale.userId)?.revenue ?? 0) + Number(sale.total)),
      count: (sellerRank.get(sale.userId)?.count ?? 0) + 1
    });
    for (const item of sale.items) {
      const current = productRank.get(item.productId) ?? { name: item.productNameSnapshot, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity);
      current.revenue = roundMoney(current.revenue + Number(item.subtotal));
      productRank.set(item.productId, current);
    }
    for (const payment of sale.payments) {
      paymentRank.set(payment.paymentMethod, roundMoney((paymentRank.get(payment.paymentMethod) ?? 0) + Number(payment.amount)));
    }
  }

  const topProducts = [...productRank.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10);
  const paymentStats = [...paymentRank.entries()].map(([method, amount]) => ({ method, amount })).sort((a, b) => b.amount - a.amount);
  const topSellers = [...sellerRank.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const dailyRevenue = [...daily.entries()].map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));

  const insights: string[] = [];
  if (growth !== null) insights.push(growth >= 0 ? `As vendas cresceram ${growth}% em relação ao período anterior.` : `As vendas caíram ${Math.abs(growth)}% em relação ao período anterior.`);
  if (topProducts[0]) insights.push(`O produto mais vendido foi ${topProducts[0].name}, com ${topProducts[0].quantity} unidades.`);
  if (paymentStats[0]) insights.push(`${paymentStats[0].method} foi a forma de pagamento mais usada no período.`);
  if (negativeProducts > 0) insights.push(`Existem ${negativeProducts} produtos com estoque zerado ou negativo. Revise o estoque.`);
  if (cancelledCount > 0) insights.push(`Foram registradas ${cancelledCount} vendas canceladas no período.`);
  const pendingCredit = Number(creditOpen._sum.pendingAmount ?? 0);
  if (pendingCredit > 0) insights.push(`Há R$ ${pendingCredit.toFixed(2).replace(".", ",")} em fiados pendentes.`);

  return {
    period: { start, end },
    cards: {
      revenue,
      salesCount: sales.length,
      ticket,
      pendingCredit,
      cancelledCount,
      negativeProducts,
      topProduct: topProducts[0]?.name ?? "-",
      topPayment: paymentStats[0]?.method ?? "-"
    },
    charts: { dailyRevenue, paymentStats, topProducts, topSellers },
    insights
  };
}
