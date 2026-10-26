import { requireUser } from "@/lib/auth";
import { assertSameOrigin, clientKey, rateLimit } from "@/lib/request-guards";
import { publishListing } from "@/modules/premarket";
import { jsonError, jsonOk } from "@/shared/errors";

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const current = await requireUser();
    rateLimit(clientKey(request, `premarket:${current.id}`), 5, 60_000);
    const body = (await request.json().catch(() => null)) as unknown;
    const result = await publishListing(current.id, body);
    return jsonOk(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
