import { AuditOrigin, Prisma, UnitType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerProductAudit, registerSystemAudit } from "@/services/audit.service";

export async function generateInternalCode(tx: Prisma.TransactionClient = prisma) {
  const count = await tx.product.count();
  return `PROD-${String(count + 1).padStart(6, "0")}`;
}

export async function searchProducts(query: {
  q?: string | null;
  barcode?: string | null;
  internalCode?: string | null;
  categoryId?: string | null;
  take?: number;
}) {
  const q = query.q?.trim();
  return prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      ...(query.barcode ? { barcode: query.barcode } : {}),
      ...(query.internalCode ? { internalCode: query.internalCode } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { barcode: { equals: q } },
          { internalCode: { equals: q } },
          { category: { name: { contains: q, mode: "insensitive" } } }
        ]
      } : {})
    },
    include: { category: true },
    orderBy: { name: "asc" },
    take: query.take ?? 30
  });
}

export async function findProductByFastCode(code: string) {
  return prisma.product.findFirst({
    where: {
      deletedAt: null,
      isActive: true,
      OR: [{ barcode: code }, { internalCode: code }, { name: { equals: code, mode: "insensitive" } }]
    },
    include: { category: true }
  });
}

export async function createProduct(userId: string, input: {
  name: string;
  barcode?: string | null;
  categoryId?: string | null;
  imageUrl?: string | null;
  salePrice: number;
  costPrice?: number | null;
  stockQuantity?: number;
  unitType?: UnitType;
  isActive?: boolean;
}) {
  return prisma.$transaction(async (tx) => {
    const internalCode = await generateInternalCode(tx);
    const product = await tx.product.create({
      data: {
        internalCode,
        barcode: input.barcode || null,
        name: input.name,
        categoryId: input.categoryId || null,
        imageUrl: input.imageUrl || null,
        salePrice: input.salePrice,
        costPrice: input.costPrice ?? null,
        stockQuantity: input.stockQuantity ?? 0,
        unitType: input.unitType ?? "UNIT",
        isActive: input.isActive ?? true,
        createdBy: userId
      }
    });

    await tx.productAudit.create({
      data: {
        productId: product.id,
        userId,
        fieldChanged: "created",
        newValue: product.name,
        origin: AuditOrigin.MANUAL_EDIT
      }
    });

    await tx.systemAudit.create({
      data: {
        userId,
        entityType: "product",
        entityId: product.id,
        action: "product.created",
        newData: { id: product.id, internalCode: product.internalCode, name: product.name },
        origin: AuditOrigin.MANUAL_EDIT
      }
    });

    return product;
  });
}

export async function quickCreateProduct(userId: string, input: { name: string; barcode?: string | null }) {
  return prisma.$transaction(async (tx) => {
    const internalCode = await generateInternalCode(tx);
    const product = await tx.product.create({
      data: {
        internalCode,
        barcode: input.barcode || null,
        name: input.name,
        salePrice: 0,
        stockQuantity: 0,
        unitType: "UNIT",
        createdBy: userId
      }
    });

    await tx.productAudit.create({
      data: {
        productId: product.id,
        userId,
        fieldChanged: "quick_register",
        newValue: product.name,
        origin: AuditOrigin.QUICK_REGISTER,
        observation: "Produto cadastrado rapidamente pelo caixa. Preço deve ser revisado."
      }
    });

    await tx.stockMovement.create({
      data: {
        productId: product.id,
        userId,
        movementType: "QUICK_REGISTER",
        quantity: 0,
        previousStock: 0,
        newStock: 0,
        observation: "Cadastro rápido"
      }
    });

    return product;
  });
}

export async function updateProduct(userId: string, id: string, input: Record<string, unknown>) {
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current || current.deletedAt) throw new Error("Produto não encontrado.");

  const allowedData: Prisma.ProductUpdateInput = {
    name: input.name as string | undefined,
    barcode: (input.barcode as string | null | undefined) || null,
    category: input.categoryId ? { connect: { id: input.categoryId as string } } : input.categoryId === null ? { disconnect: true } : undefined,
    imageUrl: (input.imageUrl as string | null | undefined) || null,
    salePrice: input.salePrice as number | undefined,
    costPrice: input.costPrice as number | null | undefined,
    stockQuantity: input.stockQuantity as number | undefined,
    unitType: input.unitType as UnitType | undefined,
    isActive: input.isActive as boolean | undefined
  };

  const updated = await prisma.product.update({ where: { id }, data: allowedData });

  const entries = Object.entries(input);
  for (const [field, newValue] of entries) {
    const oldValue = (current as unknown as Record<string, unknown>)[field];
    if (String(oldValue ?? "") !== String(newValue ?? "")) {
      await registerProductAudit({
        productId: id,
        userId,
        fieldChanged: field,
        oldValue: oldValue == null ? null : String(oldValue),
        newValue: newValue == null ? null : String(newValue),
        origin: AuditOrigin.MANUAL_EDIT
      });
    }
  }

  return updated;
}

export async function changeProductPrice(userId: string, input: {
  productId: string;
  newPrice: number;
  saleId?: string | null;
  origin: AuditOrigin;
}) {
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || product.deletedAt) throw new Error("Produto não encontrado.");
  const oldPrice = product.salePrice.toString();
  const updated = await prisma.product.update({ where: { id: input.productId }, data: { salePrice: input.newPrice } });

  await registerProductAudit({
    productId: input.productId,
    userId,
    fieldChanged: "salePrice",
    oldValue: oldPrice,
    newValue: String(input.newPrice),
    origin: input.origin,
    saleId: input.saleId ?? null,
    observation: input.origin === AuditOrigin.WRONG_PRICE ? "Alteração feita pela função Produto com valor errado." : null
  });

  return updated;
}

export async function softDeleteProduct(userId: string, id: string) {
  const product = await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  await registerSystemAudit({ userId, entityType: "product", entityId: id, action: "product.deleted", oldData: { name: product.name }, origin: AuditOrigin.MANUAL_EDIT });
  return product;
}
