import { Suspense } from "react";
import { ShellHeader } from "@/components/dashboard/Shell";
import { getSalesContext } from "@/lib/sales-context";

/** Rahmen für Inbox, Prüfliste und Analyse: Kopfzeile und Inhaltsbreite. Der Login wird erst in der Kopfzeile gelesen (Suspense). */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex-1 bg-sage">
      <Suspense fallback={<ShellHeader user={null} />}>
        <AdminHeader />
      </Suspense>
      <main className="mx-auto w-full max-w-7xl px-10 pt-8 pb-24">{children}</main>
    </div>
  );
}

async function AdminHeader() {
  const { displayName, meIndex } = await getSalesContext();
  return <ShellHeader user={{ displayName, index: meIndex }} />;
}
