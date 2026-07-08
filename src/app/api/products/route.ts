import { AuditOrigin } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { productSchema, quickProductSchema } from "@/lib/validators";
import { createProduct, quickCreateProduct, searchProducts } from "@/services/product.service";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const url = new URL(request.url);
    const products = await searchProducts({
      q: url.searchParams.get("q"),
      barcode: url.searchParams.get("barcode"),
      internalCode: url.searchParams.get("internalCode"),
      categoryId: url.searchParams.get("categoryId"),
      take: Number(url.searchParams.get("take") ?? 40)
    });
    return ok(products);
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = productSchema.parse(await parseJson(request));
    const product = await createProduct(user.id, input);
    return ok(product, 201);
  } catch (error) { return handleApiError(error); }
}
