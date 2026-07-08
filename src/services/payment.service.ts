import { PaymentMethod } from "@prisma/client";
import { roundMoney } from "@/lib/money";

export type PaymentInput = {
  paymentMethod: PaymentMethod;
  amount: number;
  changeAmount?: number;
};

export function calculatePaidAmount(payments: PaymentInput[]) {
  return roundMoney(payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0));
}

export function calculateRemaining(total: number, payments: PaymentInput[]) {
  return roundMoney(Math.max(0, total - calculatePaidAmount(payments)));
}

export function calculateChange(total: number, payments: PaymentInput[]) {
  const paid = calculatePaidAmount(payments);
  return roundMoney(Math.max(0, paid - total));
}

export function validatePaymentBeforeFinish(total: number, payments: PaymentInput[]) {
  const hasCreditSale = payments.some((p) => p.paymentMethod === PaymentMethod.CREDIT_SALE);
  const paid = calculatePaidAmount(payments);
  if (hasCreditSale) return { valid: true, paid, remaining: 0, change: 0 };
  const remaining = calculateRemaining(total, payments);
  const change = calculateChange(total, payments);
  return { valid: paid >= total, paid, remaining, change };
}
