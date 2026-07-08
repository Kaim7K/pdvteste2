import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PermissionKey, roleHasPermission } from "@/lib/permissions";

const COOKIE_NAME = "pdv_token";

type TokenPayload = {
  sub: string;
  username: string;
  role: RoleName;
};

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: RoleName;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("JWT_SECRET ausente ou fraco. Configure o .env.");
  }
  return secret;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function signToken(user: AuthUser) {
  return jwt.sign({ sub: user.id, username: user.username, role: user.role } satisfies TokenPayload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d"
  });
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAuthCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
    const user = await prisma.user.findFirst({
      where: { id: decoded.sub, isActive: true, deletedAt: null },
      select: { id: true, name: true, username: true, role: true }
    });
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) throw Object.assign(new Error("Não autenticado."), { status: 401 });
  return user;
}

export function ensurePermission(user: AuthUser, permission: PermissionKey) {
  if (!roleHasPermission(user.role, permission)) {
    throw Object.assign(new Error("Permissão insuficiente."), { status: 403 });
  }
}
