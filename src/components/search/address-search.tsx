"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/components/ui/cn";
import { Input, Label } from "@/components/ui/field";

export type AddressCandidate = {
  label: string;
  civic: string;
  street: string;
  city: string;
  postal: string;
  lat: number | null;
  lon: number | null;
  /** Present when the address resolves to a property unit in our ingested roll. */
  matricule: string | null;
};

type SearchLabels = {
  label: string;
  placeholder: string;
  /** "singular|plural" template with a `{count}` placeholder. */
  results: string;
  searching: string;
  suggestions: string;
  available: string;
  notFound: string;
  unavailable: string;
};

function formatResultCount(template: string, count: number): string {
  const [singular, plural] = template.split("|");
  const chosen = count > 1 ? (plural ?? singular ?? template) : (singular ?? template);
  return chosen.replace("{count}", String(count));
}

type SearchResponse =
  | { ok: true; data: { candidates: AddressCandidate[] } }
  | { ok: false; error: { code: string; message: string } };

/**
 * Accessible combobox (WAI-ARIA 1.2): ArrowUp/ArrowDown move the active option, Enter selects,
 * Escape closes, and the live region announces the result count.
 */
export function AddressSearch({
  labels,
  autoFocus = false,
  size = "lg",
  placeholder,
}: {
  labels: SearchLabels;
  autoFocus?: boolean;
  size?: "lg" | "md";
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const listboxId = useId();
  const inputId = useId();
  const statusId = useId();
  const localePrefix = pathname === "/en" || pathname?.startsWith("/en/") ? "/en" : "";

  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<AddressCandidate[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const trimmedQuery = query.trim();
  /** Derived, never a setState-in-effect reset: <3 characters simply hide any stale results. */
  const tooShort = trimmedQuery.length < 3;

  useEffect(() => {
    if (tooShort) return;
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/address/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as SearchResponse;
        if (!payload.ok) {
          setError(labels.unavailable);
          setCandidates([]);
          setOpen(false);
          return;
        }
        // De-duplicate: the geocoder can return the same civic twice (two postal codes / suites).
        const unique = payload.data.candidates.filter(
          (candidate, index, all) =>
            all.findIndex(
              (other) => other.label === candidate.label && other.postal === candidate.postal,
            ) === index,
        );
        setCandidates(unique);
        setOpen(true);
        // Nothing is highlighted until the user moves: Enter then submits the query instead of
        // silently opening whichever row happened to be first (wrong-address bug).
        setActiveIndex(-1);
      } catch (cause) {
        if ((cause as Error).name === "AbortError") return;
        setError(labels.unavailable);
        setCandidates([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [trimmedQuery, tooShort, labels]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function go(candidate: AddressCandidate) {
    setOpen(false);
    if (candidate.matricule) {
      router.push(`${localePrefix}/evaluation/${encodeURIComponent(candidate.matricule)}`);
      return;
    }
    router.push(`${localePrefix}/recherche?q=${encodeURIComponent(candidate.label)}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, candidates.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? Math.max(candidates.length - 1, 0) : index - 1,
      );
      return;
    }
    if (event.key === "Enter") {
      if (open && activeIndex >= 0 && candidates[activeIndex]) {
        event.preventDefault();
        go(candidates[activeIndex]);
      } else if (!tooShort) {
        event.preventDefault();
        router.push(`${localePrefix}/recherche?q=${encodeURIComponent(trimmedQuery)}`);
      }
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const activeOptionId = open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className="relative w-full">
      <Label htmlFor={inputId} className="sr-only">
        {labels.label}
      </Label>
      <div className="relative">
        <Input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-describedby={statusId}
          autoComplete="off"
          autoFocus={autoFocus}
          enterKeyHint="search"
          placeholder={placeholder ?? labels.placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (candidates.length > 0) setOpen(true);
          }}
          className={cn(size === "lg" ? "h-14 pr-12 pl-4 text-base" : "h-11 pr-11", "shadow-[var(--shadow-card)]")}
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-fg">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      <p id={statusId} aria-live="polite" className="sr-only">
        {loading
          ? labels.searching
          : open && !tooShort && candidates.length > 0
            ? formatResultCount(labels.results, candidates.length)
            : ""}
      </p>

      {error && !tooShort ? (
        <p className="mt-2 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {open && !tooShort && candidates.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={labels.suggestions}
          className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-border bg-surface p-1 text-left shadow-[var(--shadow-lift)]"
        >
          {candidates.map((candidate, index) => (
            <li key={`${candidate.label}-${index}`}>
              <button
                type="button"
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => go(candidate)}
                className={cn(
                  "flex w-full flex-col rounded-lg px-3 py-2.5 text-left",
                  index === activeIndex ? "bg-primary-soft" : "hover:bg-muted",
                )}
              >
                <span className="text-sm font-semibold text-ink">{candidate.label}</span>
                <span className="text-xs text-muted-fg">
                  {candidate.city}
                  {candidate.postal ? ` · ${candidate.postal}` : ""}
                  {candidate.matricule ? ` · ${labels.available}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open && !tooShort && !loading && candidates.length === 0 && !error ? (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-border bg-surface p-4 text-sm text-ink-soft shadow-[var(--shadow-lift)]">
          {labels.notFound}
        </div>
      ) : null}
    </div>
  );
}
