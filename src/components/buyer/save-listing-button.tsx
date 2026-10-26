"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/components/ui/cn";
import { interpolate } from "@/modules/buyer/format-message";
import type { BuyerMessages } from "@/modules/buyer/messages";

/**
 * Save/heart control for a pre-market listing. Works on the Lead-owned `/pre-marche` pages too:
 * pass `initialSaved` when the server already knows it, or omit it and the component reads the
 * session state from `GET /api/buyer/saved?listingId=`. Unauthenticated visitors get a sign-in
 * link instead of a failing request.
 */
export function SaveListingButton({
  listingId,
  listingLabel,
  isAuthenticated,
  loginHref,
  labels,
  initialSaved,
  compact = false,
  refreshOnChange = false,
}: {
  listingId: string;
  listingLabel: string;
  isAuthenticated: boolean;
  loginHref: string;
  labels: BuyerMessages["saved"];
  initialSaved?: boolean;
  compact?: boolean;
  /** Server pages that list saved rows pass true so a removed row disappears after `router.refresh()`. */
  refreshOnChange?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved ?? false);
  const [known, setKnown] = useState(initialSaved !== undefined);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  /** Returns the current saved state; when already known, the local state wins. */
  async function loadState(): Promise<boolean> {
    if (known) return saved;
    try {
      const response = await fetch(
        `/api/buyer/saved?listingId=${encodeURIComponent(listingId)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) return saved;
      const payload = (await response.json()) as
        | { ok: true; data: { saved?: boolean } }
        | { ok: false };
      const next = payload.ok && typeof payload.data.saved === "boolean" ? payload.data.saved : saved;
      setSaved(next);
      setKnown(true);
      return next;
    } catch {
      return saved;
    }
  }

  async function toggle(currentSaved: boolean) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/saved", {
        method: currentSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (!response.ok) {
        setError(labels.error);
        return;
      }
      const next = !currentSaved;
      setSaved(next);
      setKnown(true);
      setAnnouncement(next ? labels.added : labels.removed);
      if (refreshOnChange) router.refresh();
    } catch {
      setError(labels.error);
    } finally {
      setPending(false);
    }
  }

  async function handleClick() {
    const currentSaved = await loadState();
    await toggle(currentSaved);
  }

  const icon = (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill={saved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        d="M12 20.5s-6.5-4.1-8.6-7.9C1.5 9.1 3.4 5.5 6.9 5.5c2.1 0 3.4 1.2 3.9 2 .5-.8 1.8-2 3.9-2 3.5 0 5.4 3.6 3.5 7.1-2.1 3.8-8.2 7.9-8.2 7.9Z"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (!isAuthenticated) {
    return (
      <Link
        href={loginHref}
        aria-label={labels.loginRequired}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface",
          "text-sm font-semibold text-ink-soft transition-colors hover:border-primary/40 hover:text-primary",
          compact ? "size-9" : "h-9 px-3",
        )}
      >
        {icon}
        {compact ? null : <span>{labels.save}</span>}
      </Link>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        aria-pressed={saved}
        aria-label={interpolate(saved ? labels.ariaSaved : labels.ariaSave, {
          street: listingLabel,
        })}
        onClick={() => {
          void handleClick();
        }}
        onFocus={() => {
          void loadState();
        }}
        disabled={pending}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors",
          "disabled:pointer-events-none disabled:opacity-60",
          saved
            ? "border-primary/30 bg-primary-soft text-primary-strong"
            : "border-border-strong bg-surface text-ink-soft hover:border-primary/40 hover:text-primary",
          compact ? "size-9" : "h-9 px-3",
        )}
      >
        {icon}
        {compact ? null : <span>{pending ? labels.saving : saved ? labels.saved : labels.save}</span>}
      </button>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
      {error ? (
        <span role="alert" className="text-xs font-medium text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}
