import type { ComponentProps, ReactNode } from "react";

import { cn } from "./cn";

type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-ink-soft border-border",
  primary: "bg-primary-soft text-primary-strong border-primary/20",
  accent: "bg-accent-soft text-accent border-accent/20",
  success: "bg-[#e7f6ee] text-success border-success/20",
  warning: "bg-[#fdf3e4] text-warning border-warning/20",
  danger: "bg-[#fdeceb] text-danger border-danger/20",
  info: "bg-[#eaf1fa] text-info border-info/20",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Section({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={cn("py-14 md:py-20", className)} id={id}>
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            {eyebrow ? (
              <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
                <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-accent" />
                {eyebrow}
              </p>
            ) : null}
            <h2 className="font-display text-3xl leading-tight font-extrabold text-ink md:text-[2.6rem]">
              {title}
            </h2>
            {description ? <p className="mt-4 text-lg text-ink-soft">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface/60 px-6 py-12 text-center">
      {icon ? <div className="mb-4 flex justify-center text-muted-fg">{icon}</div> : null}
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone])} role="status">
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={cn(title && "mt-1")}>{children}</div>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "accent";
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs font-semibold tracking-wide text-muted-fg uppercase">{label}</dt>
      <dd
        className={cn(
          "tabular mt-1 font-display text-2xl font-extrabold",
          tone === "accent" ? "text-accent" : "text-ink",
        )}
      >
        {value}
      </dd>
      {hint ? <p className="mt-1 text-xs text-muted-fg">{hint}</p> : null}
    </div>
  );
}

// Convenience re-exports so a single import covers the primitives (kept in sync with card.tsx).
export { Card, CardBody, CardHeader, CardTitle } from "./card";
