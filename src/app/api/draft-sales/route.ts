import { requireApiUser } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { listDraftSales, saveDraftSale } from "@/services/draft-sale.service";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const user = await requireApiUser();
    const drafts = await listDraftSales(user);
    return ok(drafts);
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = await parseJson<any>(request);
    const draft = await saveDraftSale(user, input);
    return ok(draft, 201);
  } catch (error) { return handleApiError(error); }
}
