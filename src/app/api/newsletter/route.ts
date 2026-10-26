import { subscribe } from "@/modules/newsletter";
import { jsonError, jsonOk } from "@/shared/errors";
import { assertSameOrigin, clientKey, rateLimit } from "@/lib/request-guards";

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    rateLimit(clientKey(request, "newsletter"), 5, 60_000);
    const body = (await request.json().catch(() => null)) as unknown;
    const result = await subscribe(body);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
