import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { setAuthCookie, signToken, verifyPassword } from "@/lib/auth";
import { fail } from "@/lib/http";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findFirst({
      where: { username: input.username, isActive: true, deletedAt: null },
      select: { id: true, name: true, username: true, role: true, passwordHash: true }
    });
    if (!user) return fail("Usuário ou senha inválidos.", 401);
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) return fail("Usuário ou senha inválidos.", 401);
    const token = signToken({ id: user.id, name: user.name, username: user.username, role: user.role });
    setAuthCookie(token);
    return NextResponse.json({ ok: true, data: { id: user.id, name: user.name, username: user.username, role: user.role } });
  } catch (error) {
    return handleApiError(error);
  }
}
