import { Suspense } from "react";
import { logout } from "@/app/admin/actions";
import { requireSalesUser } from "@/lib/auth";

async function AdminHeader() {
  const { email } = await requireSalesUser();
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-zinc-600">Eingeloggt als {email}</p>
      <form action={logout}>
        <button type="submit" className="text-sm underline">
          Abmelden
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Standort-Check – Anfragen</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Lade …</p>}>
        <AdminHeader />
      </Suspense>
    </main>
  );
}
