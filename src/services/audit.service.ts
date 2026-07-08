import { AuditOrigin, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function registerSystemAudit(input: {
  userId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  oldData?: Prisma.InputJsonValue | null;
  newData?: Prisma.InputJsonValue | null;
  origin: AuditOrigin;
  saleId?: string | null;
  ipAddress?: string | null;
}) {
  return prisma.systemAudit.create({
    data: {
      userId: input.userId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      oldData: input.oldData ?? Prisma.JsonNull,
      newData: input.newData ?? Prisma.JsonNull,
      origin: input.origin,
      saleId: input.saleId ?? null,
      ipAddress: input.ipAddress ?? null
    }
  });
}

export async function registerProductAudit(input: {
  productId: string;
  userId: string;
  fieldChanged: string;
  oldValue?: string | null;
  newValue?: string | null;
  origin: AuditOrigin;
  saleId?: string | null;
  observation?: string | null;
}) {
  const audit = await prisma.productAudit.create({
    data: {
      productId: input.productId,
      userId: input.userId,
      fieldChanged: input.fieldChanged,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
      origin: input.origin,
      saleId: input.saleId ?? null,
      observation: input.observation ?? null
    }
  });

  await registerSystemAudit({
    userId: input.userId,
    entityType: "product",
    entityId: input.productId,
    action: `product.${input.fieldChanged}.changed`,
    oldData: input.oldValue ? { value: input.oldValue } : null,
    newData: input.newValue ? { value: input.newValue } : null,
    origin: input.origin,
    saleId: input.saleId ?? null
  });

  return audit;
}
