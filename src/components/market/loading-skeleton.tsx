/** Loading skeleton for the market routes (no spinner, no layout jump). */
export function MarketPageSkeleton({ message, cards = 3 }: { message: string; cards?: number }) {
  return (
    <div className="container-page py-10 md:py-14" aria-busy="true" aria-live="polite">
      <p className="sr-only">{message}</p>
      <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-10 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="rounded-card border border-border bg-surface p-5">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
