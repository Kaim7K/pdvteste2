import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Não autenticado.", 401);
  return ok(user);
}
