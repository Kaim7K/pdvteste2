import { requireApiUser } from "@/lib/auth";
import { ok, parseJson } from "@/lib/http";
import { settingSchema } from "@/lib/validators";
import { listSettings, updateSetting } from "@/services/settings.service";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    await requireApiUser();
    const settings = await listSettings();
    return ok(settings);
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const input = settingSchema.parse(await parseJson(request));
    const setting = await updateSetting(user, input);
    return ok(setting);
  } catch (error) { return handleApiError(error); }
}
