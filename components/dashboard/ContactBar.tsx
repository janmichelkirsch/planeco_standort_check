"use client";

import { useState, type FormEvent } from "react";
import { renameContactAction } from "@/app/admin/actions";
import { Pencil } from "@/components/icons";
import { useInbox, useInboxAction } from "@/components/dashboard/InboxContext";
import { Button, inputClass } from "@/components/dashboard/ui";

type Props = { contactId: string; ownerId: string | null; firstName: string; lastName: string };

/**
 * Leiste über den Anfragen eines Kontakts: wohin neue Anfragen dieser Person gehen, und den Namen korrigieren.
 * (Getrennt von „automatisch zugeordnet“ an der Anfrage – das sagt, ob die Person wiedererkannt wurde.)
 */
export function ContactBar({ contactId, ownerId, firstName, lastName }: Props) {
  const { me, nameOf } = useInbox();
  const { run, pending } = useInboxAction();
  const [editing, setEditing] = useState(false);
  const owner = nameOf(ownerId);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(
      contactId,
      "Namen ändern",
      () => renameContactAction(contactId, String(fd.get("firstName") ?? ""), String(fd.get("lastName") ?? "")),
      undefined,
      (r) => r.ok && setEditing(false),
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <p className="flex-1 text-[13px] text-forest-soft">
          {ownerId
            ? `Neue Anfragen dieser Person landen automatisch bei ${ownerId === me ? "dir" : owner}.`
            : "Noch niemand zuständig. Über „Nicht zugewiesen“ in der Zeile übernimmst du den Kontakt."}
        </p>
        <Button tone="ghost" size="sm" aria-expanded={editing} onClick={() => setEditing((v) => !v)}>
          <Pencil className="size-4" /> Name bearbeiten
        </Button>
      </div>

      {editing && (
        <form onSubmit={onSubmit} className="mt-3 flex items-end gap-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-line-soft">
          <NameInput id={`${contactId}-first`} name="firstName" label="Vorname" defaultValue={firstName} />
          <NameInput id={`${contactId}-last`} name="lastName" label="Nachname" defaultValue={lastName} />
          <Button type="submit" tone="primary" disabled={pending}>
            {pending ? "Speichert …" : "Speichern"}
          </Button>
          <Button tone="ghost" onClick={() => setEditing(false)}>
            Abbrechen
          </Button>
        </form>
      )}
    </div>
  );
}

function NameInput({ id, label, name, defaultValue }: { id: string; label: string; name: string; defaultValue: string }) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-forest-soft">
        {label}
      </label>
      <input id={id} name={name} defaultValue={defaultValue} required maxLength={200} className={inputClass} />
    </div>
  );
}
