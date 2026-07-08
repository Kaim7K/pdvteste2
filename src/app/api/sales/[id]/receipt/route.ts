import { requireApiUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { getSaleForReceipt } from "@/services/sale.service";
import { handleApiError } from "@/lib/api-error";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const sale = await getSaleForReceipt(user, params.id);
    return ok(sale);
  } catch (error) { return handleApiError(error); }
}
