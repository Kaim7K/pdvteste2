import { requireApiUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { listCreditSales } from "@/services/credit.service";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const user = await requireApiUser();
    const credits = await listCreditSales(user);
    return ok(credits);
  } catch (error) { return handleApiError(error); }
}
