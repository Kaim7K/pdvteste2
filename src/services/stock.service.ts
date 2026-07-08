import { Prisma, StockMovementType } from "@prisma/client";

export async function decreaseStock(tx: Prisma.TransactionClient, input: {
  productId: string;
  userId: string;
  quantity: number;
  saleId?: string;
}) {
  const product = await tx.product.findUnique({ where: { id: input.productId } });
  if (!product) throw new Error("Produto não encontrado para baixa de estoque.");

  const previous = Number(product.stockQuantity);
  const next = previous - input.quantity;

  await tx.product.update({ where: { id: product.id }, data: { stockQuantity: next } });
  await tx.stockMovement.create({
    data: {
      productId: product.id,
      userId: input.userId,
      movementType: StockMovementType.SALE,
      quantity: input.quantity,
      previousStock: previous,
      newStock: next,
      saleId: input.saleId ?? null,
      observation: next < 0 ? "Produto ficou com estoque negativo." : null
    }
  });

  return { previous, next, isNegative: next <= 0 };
}

export async function increaseStock(tx: Prisma.TransactionClient, input: {
  productId: string;
  userId: string;
  quantity: number;
  saleId?: string;
  reason?: string;
}) {
  const product = await tx.product.findUnique({ where: { id: input.productId } });
  if (!product) throw new Error("Produto não encontrado para estorno de estoque.");

  const previous = Number(product.stockQuantity);
  const next = previous + input.quantity;

  await tx.product.update({ where: { id: product.id }, data: { stockQuantity: next } });
  await tx.stockMovement.create({
    data: {
      productId: product.id,
      userId: input.userId,
      movementType: StockMovementType.CANCELLATION_REVERSAL,
      quantity: input.quantity,
      previousStock: previous,
      newStock: next,
      saleId: input.saleId ?? null,
      observation: input.reason ?? "Estorno por cancelamento"
    }
  });

  return { previous, next };
}
