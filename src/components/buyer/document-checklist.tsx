"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/field";
import { interpolate } from "@/modules/buyer/format-message";
import type { BuyerMessages } from "@/modules/buyer/messages";

/**
 * Four-document pre-approval checklist, persisted only in this browser. The storage value is
 * versioned so a future schema change can migrate instead of silently resetting progress.
 * `useSyncExternalStore` treats localStorage as the external store: React reads the server
 * snapshot during hydration, then re-renders from the stored value — no setState inside effects.
 */
const STORAGE_KEY = "maqc:buyer:checklist:v1";
const ITEM_IDS = ["income", "bank", "down", "id"] as const;
type ItemId = (typeof ITEM_IDS)[number];

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot(): string {
  return "";
}

/** Writes the versioned payload and notifies subscribers. Returns false when storage is blocked. */
function writeChecklist(checked: ItemId[] | null): boolean {
  try {
    if (checked === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, checked }));
    }
    for (const listener of listeners) listener();
    return true;
  } catch {
    return false;
  }
}

function isItemId(value: unknown): value is ItemId {
  return typeof value === "string" && (ITEM_IDS as readonly string[]).includes(value);
}

function parseSnapshot(raw: string): Record<ItemId, boolean> {
  const checked: Record<ItemId, boolean> = { income: false, bank: false, down: false, id: false };
  if (!raw) return checked;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "version" in parsed &&
      parsed.version === 1 &&
      "checked" in parsed &&
      Array.isArray(parsed.checked)
    ) {
      for (const id of parsed.checked) {
        if (isItemId(id)) checked[id] = true;
      }
    }
  } catch {
    // Corrupted storage: fall back to an empty checklist, never crash the page.
  }
  return checked;
}

export function DocumentChecklist({ messages }: { messages: BuyerMessages }) {
  const t = messages.financing.checklist;
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const checked = useMemo(() => parseSnapshot(raw), [raw]);
  const [storageIssue, setStorageIssue] = useState(false);

  function toggle(id: ItemId) {
    const next = ITEM_IDS.filter((item) => (item === id ? !checked[item] : checked[item]));
    setStorageIssue(!writeChecklist(next));
  }

  function reset() {
    setStorageIssue(!writeChecklist(null));
  }

  const done = ITEM_IDS.filter((id) => checked[id]).length;
  const total = ITEM_IDS.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm leading-relaxed text-ink-soft">{t.intro}</p>

        <div>
          <p className="text-sm font-semibold text-ink">
            {interpolate(t.progress, { done, total })}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            aria-label={interpolate(t.progress, { done, total })}
            className="mt-2 h-2 w-full overflow-hidden rounded-pill bg-muted"
          >
            <div
              className="h-full rounded-pill bg-primary transition-[width]"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        </div>

        <ul className="space-y-2">
          {t.items.map((item, index) => {
            const id = ITEM_IDS[index];
            if (!id) return null;
            return (
              <li key={id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted">
                  <Checkbox
                    checked={checked[id]}
                    onChange={() => toggle(id)}
                    aria-describedby={storageIssue ? "checklist-storage-note" : undefined}
                  />
                  <span className="text-sm text-ink-soft">{item}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p id="checklist-storage-note" className="text-xs text-muted-fg">
            {storageIssue ? t.storageUnavailable : t.savedLocally}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            {t.reset}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
