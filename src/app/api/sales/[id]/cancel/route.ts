import { requireApiUser } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { cancelSaleSchema } from "@/lib/validators";
import { cancelSale } from "@/services/sale.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const input = cancelSaleSchema.parse(await parseJson(request));
    const sale = await cancelSale(user, params.id, input.reason);
    return ok(sale);
  } catch (error) { return handleApiError(error); }
}
