import { ZodError } from "zod";
import { fail } from "@/lib/http";

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) return fail("Dados inválidos.", 422, error.flatten());
  if (error instanceof Error) return fail(error.message, (error as any).status ?? 400);
  return fail("Erro inesperado.", 500);
}
