import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/http";

export async function GET() {
  const categories = await prisma.category.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { name: "asc" } });
  return ok(categories);
}
