import { Badge } from "@/components/ui/content";
import type { Confidence } from "@/modules/valuation/types";

const TONES: Record<Confidence, "success" | "warning" | "neutral"> = {
  elevee: "success",
  moyenne: "warning",
  faible: "neutral",
};

/**
 * Status is always spelled out, never conveyed by colour alone (accessibility §6).
 * The label comes from the page's dictionary so it follows the active locale.
 */
export function ConfidenceBadge({ confidence, label }: { confidence: Confidence; label: string }) {
  return <Badge tone={TONES[confidence]}>{label}</Badge>;
}
