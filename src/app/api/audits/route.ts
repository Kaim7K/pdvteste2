import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    if (user.role !== RoleName.MANAGER) throw Object.assign(new Error("Apenas gerente acessa auditoria geral."), { status: 403 });
    const url = new URL(request.url);
    const entityType = url.searchParams.get("entityType") || undefined;
    const audits = await prisma.systemAudit.findMany({
      where: { ...(entityType ? { entityType } : {}) },
      include: { user: true, sale: true },
      orderBy: { createdAt: "desc" },
      take: 300
    });
    return ok(audits);
  } catch (error) { return handleApiError(error); }
}
