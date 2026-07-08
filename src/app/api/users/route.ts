import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser, hashPassword } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { createUserSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const user = await requireApiUser();
    if (user.role !== RoleName.MANAGER) throw Object.assign(new Error("Apenas gerente gerencia usuários."), { status: 403 });
    const users = await prisma.user.findMany({ where: { deletedAt: null }, select: { id: true, name: true, username: true, role: true, isActive: true, createdAt: true }, orderBy: { name: "asc" } });
    return ok(users);
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (user.role !== RoleName.MANAGER) throw Object.assign(new Error("Apenas gerente gerencia usuários."), { status: 403 });
    const input = createUserSchema.parse(await parseJson(request));
    const created = await prisma.user.create({ data: { name: input.name, username: input.username, passwordHash: await hashPassword(input.password), role: input.role, isActive: input.isActive }, select: { id: true, name: true, username: true, role: true, isActive: true } });
    return ok(created, 201);
  } catch (error) { return handleApiError(error); }
}
