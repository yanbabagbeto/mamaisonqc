"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/components/ui/cn";

export type DetailRowData = { label: string; value: string };
export type DetailSectionData = { title: string; rows: DetailRowData[] };

/**
 * Native `<dialog>` so focus trapping, Escape, inert background and the accessible modal semantics
 * come from the platform instead of a hand-rolled trap. The content is a structured record, not a
 * table of figures: it reads like a form from the assessment roll.
 */
export function RollDetailDialog({
  triggerLabel,
  title,
  intro,
  closeLabel,
  sections,
  note,
  className,
}: {
  triggerLabel: string;
  title: string;
  intro: string;
  closeLabel: string;
  sections: DetailSectionData[];
  note: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = "roll-detail-title";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Some browsers restore focus to the body on close; make the trigger reachable again.
    const onClose = () => {
      (document.activeElement as HTMLElement | null)?.blur();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-strong",
          "bg-surface px-4 text-sm font-semibold text-ink-soft transition-colors",
          "hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          className,
        )}
        aria-haspopup="dialog"
      >
        {triggerLabel}
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 7.5v.5" strokeLinecap="round" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          // Click on the backdrop (the dialog element itself, outside the panel) closes it.
          if (event.target === dialogRef.current) closeDialog();
        }}
        className={cn(
          // `m-auto` restores the native dialog centring that Tailwind's margin reset removes.
          "m-auto w-[min(94vw,46rem)] rounded-card border border-border bg-surface p-0 text-ink shadow-[var(--shadow-lift)]",
          "backdrop:bg-ink/45 backdrop:backdrop-blur-sm",
          "open:animate-none",
        )}
      >
        <div className="flex max-h-[85dvh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
            <div>
              <h2 id={titleId} className="font-display text-xl font-bold text-ink">
                {title}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">{intro}</p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label={closeLabel}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-ink-soft hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="space-y-6 overflow-y-auto px-5 py-5 md:px-6">
            {sections.map((section) => (
              <section key={section.title}>
                <h3 className="font-display text-sm font-bold tracking-wide text-accent uppercase">
                  {section.title}
                </h3>
                <dl className="mt-3 divide-y divide-border">
                  {section.rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5"
                    >
                      <dt className="text-sm text-muted-fg">{row.label}</dt>
                      <dd className="tabular text-sm font-semibold text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            <p className="rounded-lg bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-fg">
              {note}
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
