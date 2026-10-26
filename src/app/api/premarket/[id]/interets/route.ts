import { assertSameOrigin, clientKey, rateLimit } from "@/lib/request-guards";
import { recordInterest } from "@/modules/premarket";
import { jsonError, jsonOk } from "@/shared/errors";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    assertSameOrigin(request);
    rateLimit(clientKey(request, "premarket-interest"), 10, 60_000);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as unknown;
    const result = await recordInterest(id, body);
    return jsonOk(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
