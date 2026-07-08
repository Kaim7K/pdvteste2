import { CreditStatus, PaymentMethod, RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/lib/auth";
import { registerSystemAudit } from "@/services/audit.service";

export async function listCreditSales(user: AuthUser) {
  return prisma.creditSale.findMany({
    where: user.role === RoleName.SELLER ? { userId: user.id } : {},
    include: { creditCustomer: true, sale: true, user: true, payments: true },
    orderBy: { createdAt: "desc" },
    take: 200
  });
}

export async function payCreditSale(user: AuthUser, creditSaleId: string, input: { amount: number; paymentMethod: PaymentMethod; observation?: string | null }) {
  const credit = await prisma.creditSale.findUnique({ where: { id: creditSaleId }, include: { payments: true } });
  if (!credit) throw new Error("Fiado não encontrado.");
  if (user.role === RoleName.SELLER && credit.userId !== user.id) throw new Error("Vendedor só quita seus próprios fiados.");
  if (credit.status === CreditStatus.PAID || credit.status === CreditStatus.CANCELLED) throw new Error("Fiado já encerrado.");

  const newPaid = Number(credit.paidAmount) + input.amount;
  const pending = Math.max(0, Number(credit.originalAmount) - newPaid);
  const status = pending <= 0 ? CreditStatus.PAID : CreditStatus.PARTIAL;

  return prisma.$transaction(async (tx) => {
    await tx.creditPayment.create({ data: { creditSaleId, userId: user.id, amount: input.amount, paymentMethod: input.paymentMethod, observation: input.observation ?? null } });
    const updated = await tx.creditSale.update({
      where: { id: creditSaleId },
      data: { paidAmount: newPaid, pendingAmount: pending, status, paidAt: status === CreditStatus.PAID ? new Date() : null }
    });
    await tx.systemAudit.create({
      data: {
        userId: user.id,
        entityType: "credit_sale",
        entityId: creditSaleId,
        action: "credit.payment_registered",
        oldData: { paidAmount: credit.paidAmount.toString(), pendingAmount: credit.pendingAmount.toString() },
        newData: { paidAmount: newPaid, pendingAmount: pending, status },
        origin: "CREDIT_SCREEN",
        saleId: credit.saleId
      }
    });
    return updated;
  });
}

export async function cancelCreditSale(user: AuthUser, creditSaleId: string) {
  const credit = await prisma.creditSale.findUnique({ where: { id: creditSaleId } });
  if (!credit) throw new Error("Fiado não encontrado.");
  if (user.role === RoleName.SELLER && credit.userId !== user.id) throw new Error("Vendedor só cancela seus próprios fiados.");
  const updated = await prisma.creditSale.update({ where: { id: creditSaleId }, data: { status: CreditStatus.CANCELLED, cancelledAt: new Date() } });
  await registerSystemAudit({ userId: user.id, entityType: "credit_sale", entityId: creditSaleId, action: "credit.cancelled", origin: "CREDIT_SCREEN", saleId: credit.saleId });
  return updated;
}
