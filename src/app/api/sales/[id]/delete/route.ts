import { requireApiUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { softDeleteSale } from "@/services/sale.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const sale = await softDeleteSale(user, params.id);
    return ok(sale);
  } catch (error) { return handleApiError(error); }
}
