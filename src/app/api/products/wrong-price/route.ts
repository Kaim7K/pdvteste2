import { AuditOrigin } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { wrongPriceSchema } from "@/lib/validators";
import { changeProductPrice } from "@/services/product.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = wrongPriceSchema.parse(await parseJson(request));
    const product = await changeProductPrice(user.id, { productId: input.productId, newPrice: input.newPrice, saleId: input.saleId, origin: AuditOrigin[input.origin] });
    return ok(product);
  } catch (error) { return handleApiError(error); }
}
