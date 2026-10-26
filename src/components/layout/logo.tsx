import Link from "next/link";

import { cn } from "@/components/ui/cn";

/**
 * MaMaisonQC mark: a roof over a square, dug out of the primary colour.
 * Decorative next to the wordmark, so it is aria-hidden.
 */
export function Logo({
  className,
  tone = "primary",
}: {
  className?: string;
  tone?: "primary" | "inverse";
}) {
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
        tone === "primary" ? "bg-primary text-white" : "bg-white/10 text-white",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M3.5 11.2 12 4l8.5 7.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10v8.2a1.8 1.8 0 0 0 1.8 1.8h8.4A1.8 1.8 0 0 0 18 18.2V10" strokeLinecap="round" />
        <path d="M9.8 20v-4.6h4.4V20" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-lg"
      aria-label="MaMaisonQC — accueil"
    >
      <Logo tone={inverse ? "inverse" : "primary"} />
      <span
        className={cn(
          "font-display text-[1.35rem] leading-none font-extrabold tracking-tight",
          inverse ? "text-white" : "text-ink",
        )}
      >
        MaMaison<span className={inverse ? "text-white/70" : "text-primary"}>QC</span>
      </span>
    </Link>
  );
}
