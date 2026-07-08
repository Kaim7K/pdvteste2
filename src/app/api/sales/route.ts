import { requireApiUser } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { completeSaleSchema } from "@/lib/validators";
import { completeSale, listSales } from "@/services/sale.service";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const url = new URL(request.url);
    const sales = await listSales(user, {
      from: url.searchParams.get("from") ? new Date(url.searchParams.get("from")!) : undefined,
      to: url.searchParams.get("to") ? new Date(url.searchParams.get("to")!) : undefined,
      sellerId: url.searchParams.get("sellerId") ?? undefined,
      status: (url.searchParams.get("status") as any) ?? undefined
    });
    return ok(sales);
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = completeSaleSchema.parse(await parseJson(request));
    const sale = await completeSale(user, input as any);
    return ok(sale, 201);
  } catch (error) { return handleApiError(error); }
}
