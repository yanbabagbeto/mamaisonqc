"use client";

import { BuyerError } from "@/components/buyer/buyer-error";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <BuyerError error={error} retry={retry} />;
}
