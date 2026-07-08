import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, message, details }, { status });
}

export async function parseJson<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error("JSON inválido.");
  }
}
