import { AuditOrigin, DiscountType, PaymentMethod, Prisma, RoleName, SaleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applyDiscount, roundMoney } from "@/lib/money";
import { validatePaymentBeforeFinish } from "@/services/payment.service";
import { decreaseStock, increaseStock } from "@/services/stock.service";
import { registerSystemAudit } from "@/services/audit.service";
import type { AuthUser } from "@/lib/auth";

export type CompleteSaleInput = {
  items: Array<{ productId: string; quantity: number; weight?: number | null; unitPrice: number; subtotal: number }>;
  payments: Array<{ paymentMethod: PaymentMethod; amount: number; changeAmount?: number }>;
  discountType: DiscountType;
  discountValue: number;
  observation?: string | null;
  creditCustomer?: { name: string; phone?: string | null; observation?: string | null } | null;
};

export function calculateSaleTotals(items: CompleteSaleInput["items"], discountType: DiscountType, discountValue: number) {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0));
  const total = applyDiscount(subtotal, discountType, discountValue);
  return { subtotal, total };
}

export async function completeSale(user: AuthUser, input: CompleteSaleInput) {
  const { subtotal, total } = calculateSaleTotals(input.items, input.discountType, input.discountValue);
  const paymentValidation = validatePaymentBeforeFinish(total, input.payments);
  const isCreditSale = input.payments.some((p) => p.paymentMethod === PaymentMethod.CREDIT_SALE);

  if (!paymentValidation.valid) throw new Error("Pagamento incompleto. Não é possível finalizar a venda.");
  if (isCreditSale && !input.creditCustomer?.name) throw new Error("Venda fiado exige nome do responsável.");

  return prisma.$transaction(async (tx) => {
    let creditCustomerId: string | null = null;

    if (isCreditSale && input.creditCustomer) {
      const customer = await tx.creditCustomer.create({
        data: {
          name: input.creditCustomer.name,
          phone: input.creditCustomer.phone ?? null,
          observation: input.creditCustomer.observation ?? null,
          createdBy: user.id
        }
      });
      creditCustomerId = customer.id;
    }

    const sale = await tx.sale.create({
      data: {
        userId: user.id,
        status: SaleStatus.COMPLETED,
        subtotal,
        discountType: input.discountType,
        discountValue: input.discountValue,
        total,
        observation: input.observation ?? null,
        isCreditSale,
        creditCustomerId,
        completedAt: new Date()
      }
    });

    for (const item of input.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error("Produto da venda não encontrado.");

      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: item.productId,
          productNameSnapshot: product.name,
          quantity: item.quantity,
          weight: item.weight ?? null,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        }
      });

      const qtyForStock = product.unitType === "WEIGHT" ? Number(item.weight ?? item.quantity) : Number(item.quantity);
      await decreaseStock(tx, { productId: item.productId, userId: user.id, quantity: qtyForStock, saleId: sale.id });
    }

    for (const payment of input.payments) {
      await tx.salePayment.create({
        data: {
          saleId: sale.id,
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
          changeAmount: payment.changeAmount ?? 0
        }
      });
    }

    if (isCreditSale && creditCustomerId) {
      await tx.creditSale.create({
        data: {
          saleId: sale.id,
          creditCustomerId,
          userId: user.id,
          originalAmount: total,
          paidAmount: 0,
          pendingAmount: total,
          status: "OPEN"
        }
      });
    }

    await tx.systemAudit.create({
      data: {
        userId: user.id,
        entityType: "sale",
        entityId: sale.id,
        action: "sale.completed",
        newData: { saleNumber: sale.saleNumber, total, isCreditSale },
        origin: AuditOrigin.SALES_SCREEN,
        saleId: sale.id
      }
    });

    return tx.sale.findUnique({
      where: { id: sale.id },
      include: { items: true, payments: true, user: true, creditCustomer: true }
    });
  });
}

export async function listSales(user: AuthUser, filters: { from?: Date; to?: Date; status?: SaleStatus; sellerId?: string; q?: string } = {}) {
  const where: Prisma.SaleWhereInput = {
    deletedAt: null,
    ...(user.role === RoleName.SELLER ? { userId: user.id } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.sellerId && user.role === RoleName.MANAGER ? { userId: filters.sellerId } : {}),
    ...(filters.from || filters.to ? { createdAt: { gte: filters.from, lte: filters.to } } : {})
  };

  return prisma.sale.findMany({
    where,
    include: { user: true, payments: true, items: true, creditCustomer: true },
    orderBy: { createdAt: "desc" },
    take: 200
  });
}

export async function getSaleForReceipt(user: AuthUser, id: string) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { user: true, payments: true, items: true, creditCustomer: true }
  });
  if (!sale) throw new Error("Venda não encontrada.");
  if (user.role === RoleName.SELLER && sale.userId !== user.id) throw new Error("Sem permissão para ver esta venda.");
  return sale;
}

export async function cancelSale(user: AuthUser, saleId: string, reason?: string | null) {
  const sale = await prisma.sale.findUnique({ where: { id: saleId }, include: { items: true } });
  if (!sale) throw new Error("Venda não encontrada.");
  if (sale.status !== SaleStatus.COMPLETED) throw new Error("Somente vendas concluídas podem ser canceladas.");
  if (user.role === RoleName.SELLER && sale.userId !== user.id) throw new Error("Vendedor só cancela as próprias vendas.");

  return prisma.$transaction(async (tx) => {
    for (const item of sale.items) {
      await increaseStock(tx, {
        productId: item.productId,
        userId: user.id,
        quantity: Number(item.weight ?? item.quantity),
        saleId,
        reason: "Estorno de estoque por cancelamento de venda."
      });
    }

    const updated = await tx.sale.update({
      where: { id: saleId },
      data: { status: SaleStatus.CANCELLED, cancelledAt: new Date() }
    });

    await tx.saleCancellation.create({
      data: {
        saleId,
        userId: user.id,
        reason: reason ?? null,
        saleTotal: sale.total,
        productsSnapshot: sale.items.map((i) => ({ productId: i.productId, name: i.productNameSnapshot, quantity: i.quantity.toString(), subtotal: i.subtotal.toString() }))
      }
    });

    await tx.systemAudit.create({
      data: {
        userId: user.id,
        entityType: "sale",
        entityId: saleId,
        action: "sale.cancelled",
        oldData: { status: sale.status },
        newData: { status: SaleStatus.CANCELLED, reason: reason ?? null },
        origin: AuditOrigin.SALES_SCREEN,
        saleId
      }
    });

    return updated;
  });
}

export async function softDeleteSale(user: AuthUser, saleId: string) {
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale) throw new Error("Venda não encontrada.");
  if (user.role === RoleName.SELLER && sale.userId !== user.id) throw new Error("Vendedor só exclui as próprias vendas.");

  const updated = await prisma.sale.update({ where: { id: saleId }, data: { status: SaleStatus.DELETED, deletedAt: new Date() } });
  await registerSystemAudit({ userId: user.id, entityType: "sale", entityId: saleId, action: "sale.soft_deleted", oldData: { status: sale.status }, origin: AuditOrigin.SALES_SCREEN, saleId });
  return updated;
}
