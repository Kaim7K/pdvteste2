import { requireApiUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { cancelCreditSale } from "@/services/credit.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const credit = await cancelCreditSale(user, params.id);
    return ok(credit);
  } catch (error) { return handleApiError(error); }
}
