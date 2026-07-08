import { requireApiUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { discardDraftSale } from "@/services/draft-sale.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const draft = await discardDraftSale(user, params.id);
    return ok(draft);
  } catch (error) { return handleApiError(error); }
}
