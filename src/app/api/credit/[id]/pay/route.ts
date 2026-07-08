import { requireApiUser } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { creditPaymentSchema } from "@/lib/validators";
import { payCreditSale } from "@/services/credit.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireApiUser();
    const input = creditPaymentSchema.parse(await parseJson(request));
    const credit = await payCreditSale(user, params.id, input as any);
    return ok(credit);
  } catch (error) { return handleApiError(error); }
}
