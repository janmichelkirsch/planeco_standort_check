"use client";

import type { MouseEvent } from "react";
import { claimContactAction, setContactOwnerAction } from "@/app/admin/actions";
import { ChevronDown, UserPlus, Users, X } from "@/components/icons";
import { useInbox, useInboxAction } from "@/components/dashboard/InboxContext";
import { Menu, useAnchor, type MenuAction, type MenuEntry } from "@/components/dashboard/Popover";
import { Avatar } from "@/components/dashboard/ui";

/**
 * Zuständig für den Kontakt (Spezifikation v3, §8.1): genau eine Person. Ohne Zuständigen „Ich übernehme“ oder zuweisen;
 * sonst ändern oder freigeben. Bewusst kein „X“ am Chip: Freigeben nur über das Menü, damit es nicht versehentlich passiert.
 * Sitzt in der Zeile (`<summary>`), daher verhindert jeder Klick das Auf-/Zuklappen.
 */
export function AssigneeMenu({ contactId, ownerId }: { contactId: string; ownerId: string | null }) {
  const { me, members, nameOf, indexOf } = useInbox();
  const { anchor, toggle, close } = useAnchor();
  const { run, pending } = useInboxAction();
  const owner = nameOf(ownerId);

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(e.currentTarget);
  };

  const assignTo = (memberId: string): MenuAction => {
    const name = nameOf(memberId) ?? "";
    return {
      label: memberId === me ? `${name} (ich)` : name,
      icon: <Avatar name={name} index={indexOf(memberId)} size="sm" />,
      onSelect: () =>
        run(
          contactId,
          "Zuständigen ändern",
          () => setContactOwnerAction(contactId, memberId),
          memberId === me
            ? "Du bist jetzt zuständig. Neue Anfragen dieser Person landen automatisch bei dir."
            : `${name} ist jetzt zuständig. Neue Anfragen dieser Person landen automatisch bei ${name}.`,
        ),
    };
  };

  const entries: MenuEntry[] = ownerId
    ? [
        { kind: "heading", label: `${owner} · zuständig` },
        {
          kind: "sub",
          label: "Zuständig ändern",
          icon: <Users className="size-4 text-forest-soft" />,
          items: members.filter((m) => m.id !== ownerId).map((m) => assignTo(m.id)),
        },
        { kind: "separator" },
        {
          kind: "action",
          label: "Freigeben",
          tone: "danger",
          icon: <X className="size-4" />,
          onSelect: () => run(contactId, "Freigeben", () => setContactOwnerAction(contactId, null)),
        },
      ]
    : [
        ...(me
          ? [
              {
                kind: "action" as const,
                label: "Ich übernehme",
                tone: "accent" as const,
                icon: <UserPlus className="size-4" />,
                onSelect: () => run(contactId, "Übernehmen", () => claimContactAction(contactId)),
              },
            ]
          : []),
        {
          kind: "sub",
          label: "Jemand anderem zuweisen",
          icon: <Users className="size-4 text-forest-soft" />,
          items: members.filter((m) => m.id !== me).map((m) => assignTo(m.id)),
        },
      ];

  return (
    <>
      {ownerId ? (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={!!anchor}
          aria-label={`Zuständig: ${owner}. Ändern`}
          disabled={pending}
          onClick={onClick}
          className={`inline-flex h-8 max-w-full items-center gap-1.5 rounded-full bg-white pr-2 pl-1 text-[13px] ring-1 transition-shadow ring-inset hover:ring-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-60 ${
            anchor ? "ring-forest" : "ring-line-soft"
          }`}
        >
          <Avatar name={owner ?? "?"} index={indexOf(ownerId)} size="sm" />
          <span className="truncate font-semibold">{ownerId === me ? `${owner} (du)` : owner}</span>
          <ChevronDown className="size-4 shrink-0 text-forest-soft" />
        </button>
      ) : (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={!!anchor}
          disabled={pending}
          onClick={onClick}
          className={`inline-flex h-8 items-center gap-1.5 rounded-full bg-coral-soft pr-2 pl-3 text-[13px] font-semibold whitespace-nowrap text-coral-ink ring-1 ring-coral/40 transition-colors ring-inset hover:bg-coral/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-60 ${
            anchor ? "bg-coral/20" : ""
          }`}
        >
          <span className="size-1.5 rounded-full bg-coral-strong" />
          Nicht zugewiesen
          <ChevronDown className="size-4" />
        </button>
      )}
      {anchor && <Menu anchor={anchor} label="Zuständigkeit" entries={entries} onClose={close} />}
    </>
  );
}
