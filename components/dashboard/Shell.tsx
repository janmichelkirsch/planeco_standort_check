import { logout } from "@/app/admin/actions";
import { Logo } from "@/components/FormParts";
import { Download, LogOut } from "@/components/icons";
import { NavLinks } from "@/components/dashboard/NavLinks";
import { Avatar, buttonClass } from "@/components/dashboard/ui";

export type ShellUser = { displayName: string; index: number };

/**
 * Kopfzeile des Dashboards: Logo, Bereiche, wer eingeloggt ist, CSV-Export, Abmelden.
 * `user` fehlt, solange der Login noch geladen wird (Suspense-Fallback) – dann ohne Namen.
 */
export function ShellHeader({ user }: { user: ShellUser | null }) {
  return (
    <header className="border-b border-line-soft bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-stretch gap-5 px-10">
        <div className="flex items-center gap-5">
          <Logo className="h-6" />
          <span aria-hidden="true" className="h-6 w-px bg-line-soft" />
          <p className="text-[15px] font-semibold tracking-tight">Standort-Check</p>
        </div>

        <NavLinks />

        <div className="ml-auto flex items-center gap-2">
          {user && (
            <span className="mr-3 flex items-center gap-2 text-sm text-forest-soft">
              <Avatar name={user.displayName} index={user.index} />
              <span>
                Eingeloggt als <span className="font-medium text-forest">{user.displayName}</span>
              </span>
            </span>
          )}
          {/* Normaler Link statt <Link>, damit der Browser die Datei herunterlädt. */}
          <a href="/admin/export" className={buttonClass("secondary", "sm")}>
            <Download className="size-4" /> CSV exportieren
          </a>
          <form action={logout}>
            <button type="submit" className={buttonClass("ghost", "sm")}>
              <LogOut className="size-4" /> Abmelden
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
