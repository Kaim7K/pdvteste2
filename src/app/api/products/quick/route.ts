import { requireApiUser } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { quickProductSchema } from "@/lib/validators";
import { quickCreateProduct } from "@/services/product.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = quickProductSchema.parse(await parseJson(request));
    const product = await quickCreateProduct(user.id, input);
    return ok(product, 201);
  } catch (error) { return handleApiError(error); }
}
