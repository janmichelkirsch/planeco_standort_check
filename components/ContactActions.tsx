import { claimContact, updateContact } from "@/app/admin/actions";
import { ReturnFields, buttonClass, selectClass } from "@/components/DashboardParts";
import type { ContactGroup, Sort, TeamMember, View } from "@/lib/dashboard";

type Props = { group: ContactGroup; members: TeamMember[]; view: View; sort: Sort };

/**
 * Kontakt bearbeiten: „Übernehmen“ (nur solange niemand zuständig ist, gleichzeitige Klicks gewinnt einer),
 * Zuständigen ändern oder freigeben, Namen korrigieren. Anfragen ohne abweichenden Bearbeiter wandern beim Wechsel mit.
 */
export function ContactActions({ group, members, view, sort }: Props) {
  const { contact } = group;
  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-3 text-sm">
      {!group.owner && (
        <form action={claimContact} className="flex flex-wrap items-center gap-3">
          <ReturnFields view={view} sort={sort} />
          <input type="hidden" name="contactId" value={contact.id} />
          <span>Noch niemand zuständig.</span>
          <button type="submit" className={buttonClass}>
            Übernehmen
          </button>
        </form>
      )}

      <details>
        <summary className="cursor-pointer text-zinc-700 underline">Kontakt bearbeiten (Zuständig, Name)</summary>
        <form action={updateContact} className="mt-3 flex flex-wrap items-end gap-3">
          <ReturnFields view={view} sort={sort} />
          <input type="hidden" name="contactId" value={contact.id} />
          <input type="hidden" name="ownerIdBefore" value={contact.account_owner_id ?? ""} />
          <input type="hidden" name="firstNameBefore" value={contact.first_name} />
          <input type="hidden" name="lastNameBefore" value={contact.last_name} />
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Zuständig</span>
            <select name="ownerId" defaultValue={contact.account_owner_id ?? ""} className={selectClass}>
              <option value="">Niemand (zurück in „Nicht zugewiesen“)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Vorname</span>
            <input name="firstName" defaultValue={contact.first_name} required maxLength={200} className={selectClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Nachname</span>
            <input name="lastName" defaultValue={contact.last_name} required maxLength={200} className={selectClass} />
          </label>
          <button type="submit" className={buttonClass}>
            Speichern
          </button>
        </form>
      </details>
    </div>
  );
}
