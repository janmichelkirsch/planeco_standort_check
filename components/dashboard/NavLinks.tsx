"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Chart, Inbox } from "@/components/icons";

const NAV = [
  { href: "/admin", label: "Inbox", Icon: Inbox, match: (p: string) => p === "/admin" || p.startsWith("/admin/review") },
  { href: "/admin/analyse", label: "Analyse", Icon: Chart, match: (p: string) => p.startsWith("/admin/analyse") },
];

/** Bereiche in der Kopfzeile. Aktiv nach Pfad (die Prüfliste gehört zur Inbox). */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Bereich" className="ml-6 flex gap-1">
      {NAV.map(({ href, label, Icon, match }) => {
        const on = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest ${
              on ? "border-coral-strong font-semibold text-forest" : "border-transparent text-forest-soft hover:text-forest"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
