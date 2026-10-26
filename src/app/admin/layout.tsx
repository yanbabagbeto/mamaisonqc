import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/reclamations", label: "Réclamations" },
  { href: "/admin/annonces", label: "Pré-marché" },
  { href: "/admin/donnees", label: "Données" },
  { href: "/admin/outbox", label: "Messages" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const current = await getCurrentUser();
  // Non-admins get a 404, not a 403: the route must not disclose its existence (PRD AC-11).
  if (!current || current.role !== "admin") {
    notFound();
  }

  return (
    <div className="container-page py-10">
      <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">Administration</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Console MaMaisonQC</h1>
      <nav aria-label="Navigation administration" className="mt-6 border-b border-border">
        <ul className="flex flex-wrap gap-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-block rounded-t-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-muted hover:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
