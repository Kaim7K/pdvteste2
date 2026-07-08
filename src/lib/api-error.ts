import { ZodError } from "zod";
import { fail } from "@/lib/http";

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) return fail("Dados invalidos.", 422, error.flatten());

  if (error instanceof Error) {
    const status = (error as { status?: number }).status;
    if (status) return fail(error.message, status);

    console.error(error);
    return fail("Erro interno do servidor.", 500);
  }

  return fail("Erro inesperado.", 500);
}
