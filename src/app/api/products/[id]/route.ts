import { AuditOrigin } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { productSchema } from "@/lib/validators";
import { changeProductPrice, softDeleteProduct, updateProduct } from "@/services/product.service";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const input = productSchema.partial().parse(await parseJson(request));
    const product = await updateProduct(user.id, params.id, input);
    return ok(product);
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const product = await softDeleteProduct(user.id, params.id);
    return ok(product);
  } catch (error) { return handleApiError(error); }
}
