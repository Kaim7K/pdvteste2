import { RoleName } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { getReport } from "@/services/report.service";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    if (user.role !== RoleName.MANAGER) throw Object.assign(new Error("Apenas gerente acessa relatórios globais."), { status: 403 });
    const url = new URL(request.url);
    const report = await getReport(url.searchParams.get("preset") ?? "today", url.searchParams.get("from"), url.searchParams.get("to"));
    return ok(report);
  } catch (error) { return handleApiError(error); }
}
