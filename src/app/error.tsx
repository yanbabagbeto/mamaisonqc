"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server logs carry the requestId; the client only gets a digest.
    console.error("[app] route error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60dvh] max-w-xl flex-col justify-center py-16">
      <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">Erreur · Error</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-ink">
        Une erreur est survenue.
      </h1>
      <p className="mt-3 text-ink-soft">
        Le problème a été journalisé. Vous pouvez réessayer ; si cela persiste, revenez dans quelques
        minutes.
      </p>
      <p className="mt-1 text-sm text-muted-fg">Something went wrong. Please try again.</p>
      <div className="mt-8">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-strong"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
