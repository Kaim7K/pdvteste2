import { DraftSaleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/lib/auth";
import { applyDiscount } from "@/lib/money";

export async function getMinimizedLimit() {
  const setting = await prisma.setting.findUnique({ where: { key: "max_minimized_sales" } });
  return Number(setting?.value ?? 3);
}

export async function listDraftSales(user: AuthUser) {
  return prisma.draftSale.findMany({
    where: { userId: user.id, status: DraftSaleStatus.MINIMIZED },
    include: { items: { include: { product: true } }, payments: true },
    orderBy: { updatedAt: "desc" }
  });
}

export async function saveDraftSale(user: AuthUser, input: {
  items: Array<{ productId: string; quantity: number; weight?: number | null; unitPrice: number; subtotal: number }>;
  payments?: Array<{ paymentMethod: any; amount: number }>;
  discountType?: any;
  discountValue?: number;
  observation?: string | null;
}) {
  const limit = await getMinimizedLimit();
  const currentCount = await prisma.draftSale.count({ where: { userId: user.id, status: DraftSaleStatus.MINIMIZED } });
  if (currentCount >= limit) throw new Error(`Limite de ${limit} vendas minimizadas atingido.`);

  const subtotal = input.items.reduce((acc, item) => acc + Number(item.subtotal), 0);
  const discountType = input.discountType ?? "NONE";
  const discountValue = input.discountValue ?? 0;
  const total = applyDiscount(subtotal, discountType, discountValue);

  return prisma.$transaction(async (tx) => {
    const draft = await tx.draftSale.create({
      data: { userId: user.id, status: DraftSaleStatus.MINIMIZED, subtotal, discountType, discountValue, total, observation: input.observation ?? null }
    });

    for (const item of input.items) {
      await tx.draftSaleItem.create({ data: { draftSaleId: draft.id, ...item } });
    }
    for (const payment of input.payments ?? []) {
      await tx.draftSalePayment.create({ data: { draftSaleId: draft.id, paymentMethod: payment.paymentMethod, amount: payment.amount } });
    }
    return tx.draftSale.findUnique({ where: { id: draft.id }, include: { items: { include: { product: true } }, payments: true } });
  });
}

export async function discardDraftSale(user: AuthUser, draftSaleId: string) {
  const draft = await prisma.draftSale.findUnique({ where: { id: draftSaleId } });
  if (!draft || draft.userId !== user.id) throw new Error("Venda minimizada não encontrada.");
  return prisma.draftSale.update({ where: { id: draftSaleId }, data: { status: DraftSaleStatus.DISCARDED } });
}
