import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { handleApiError } from "@/lib/api-error";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireApiUser();
    const audits = await prisma.productAudit.findMany({ where: { productId: params.id }, include: { user: true, sale: true }, orderBy: { createdAt: "desc" }, take: 100 });
    return ok(audits);
  } catch (error) { return handleApiError(error); }
}
