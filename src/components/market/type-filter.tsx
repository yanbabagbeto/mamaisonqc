import Link from "next/link";

import { cn } from "@/components/ui/cn";

/**
 * `?type=` filter for the municipality page. Plain links (no client state): the filter survives
 * without JavaScript and is shareable.
 */
export function TypeFilter({
  basePath,
  active,
  label,
  options,
}: {
  basePath: string;
  active: string | null;
  label: string;
  options: Array<{ value: string | null; label: string }>;
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = active === option.value;
          const href = option.value ? `${basePath}?type=${option.value}` : basePath;
          return (
            <li key={option.value ?? "all"}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-pill border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-border-strong bg-surface text-ink-soft hover:border-primary/40 hover:text-primary",
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
