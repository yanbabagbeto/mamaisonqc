import {
  FeatureIllustration,
  HeroHouseScene,
  type FeatureKind,
} from "@/components/illustrations";

/**
 * Right-hand panel for the sign-in / sign-up screens: original artwork plus the product's mission
 * in plain words. Server component, all copy comes from the owner dictionary.
 */
export function AuthAside({
  title,
  body,
  bullets,
  note,
  variant,
}: {
  title: string;
  body: string;
  bullets: readonly string[];
  note: string;
  variant: "signin" | "signup";
}) {
  const medallions: FeatureKind[] = ["acheter", "hypotheque", "financement"];

  return (
    <aside className="relative overflow-hidden rounded-[1.75rem] border border-border bg-primary-soft/45 p-5 md:p-7 lg:sticky lg:top-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-surface/70 blur-2xl"
      />

      <div className="relative">
        {variant === "signin" ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <HeroHouseScene className="h-auto w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {medallions.map((kind) => (
              <div
                key={kind}
                className="flex items-center justify-center rounded-2xl border border-border bg-surface p-2.5 shadow-[var(--shadow-card)]"
              >
                <FeatureIllustration kind={kind} className="size-12" />
              </div>
            ))}
          </div>
        )}

        <h2 className="mt-6 font-display text-2xl leading-tight font-bold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>

        <ul className="mt-5 space-y-2.5">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-sm font-medium text-ink-soft">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden="true"
                >
                  <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {bullet}
            </li>
          ))}
        </ul>

        <p className="mt-6 border-t border-primary/15 pt-4 text-xs font-semibold text-primary-strong">
          {note}
        </p>
      </div>
    </aside>
  );
}
