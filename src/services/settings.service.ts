import { AuditOrigin, RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/lib/auth";
import { registerSystemAudit } from "@/services/audit.service";

export async function listSettings() {
  return prisma.setting.findMany({ orderBy: { key: "asc" } });
}

export async function updateSetting(user: AuthUser, input: { key: string; value: string; description?: string | null }) {
  if (user.role !== RoleName.MANAGER) throw new Error("Apenas gerente altera configurações.");
  const old = await prisma.setting.findUnique({ where: { key: input.key } });
  const setting = await prisma.setting.upsert({
    where: { key: input.key },
    update: { value: input.value, description: input.description ?? old?.description ?? null, updatedBy: user.id },
    create: { key: input.key, value: input.value, description: input.description ?? null, updatedBy: user.id }
  });
  await registerSystemAudit({ userId: user.id, entityType: "settings", entityId: setting.id, action: "setting.updated", oldData: old ? { value: old.value } : null, newData: { key: setting.key, value: setting.value }, origin: AuditOrigin.SETTINGS_SCREEN });
  return setting;
}
