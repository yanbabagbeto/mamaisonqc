"use client";

import { MarketError } from "@/components/market/market-error";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <MarketError error={error} retry={retry} />;
}
