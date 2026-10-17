import { ADDRESS_SOURCE_LABEL, formatBerlinDateTime } from "@/lib/format";
import type { LeadRow } from "@/lib/leads";

type Props = {
  rows: LeadRow[];
  hasMore: boolean;
};

/** Tabelle aller Anfragen. Auf schmalen Bildschirmen seitlich scrollbar. */
export function LeadsTable({ rows, hasMore }: Props) {
  if (rows.length === 0) {
    return <p className="text-zinc-600">Noch keine Anfragen eingegangen.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-600">{rows.length} Anfragen</p>
      <div className="overflow-x-auto rounded border border-zinc-300">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-3 py-2">Eingang</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Telefon</th>
              <th className="px-3 py-2">E-Mail</th>
              <th className="px-3 py-2">Adresse</th>
              <th className="px-3 py-2">Bundesland</th>
              <th className="px-3 py-2">Adressquelle</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="border-t border-zinc-200 align-top">
                <td className="whitespace-nowrap px-3 py-2">{formatBerlinDateTime(lead.created_at)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {lead.first_name} {lead.last_name}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {lead.phone ? <a href={`tel:${lead.phone}`} className="underline">{lead.phone}</a> : "–"}
                </td>
                <td className="px-3 py-2">
                  <a href={`mailto:${lead.email}`} className="underline">
                    {lead.email}
                  </a>
                </td>
                <td className="px-3 py-2">
                  {lead.street} {lead.house_number}, {lead.postal_code} {lead.city}
                </td>
                <td className="px-3 py-2">{lead.state ?? "–"}</td>
                <td className="px-3 py-2">{ADDRESS_SOURCE_LABEL[lead.address_source]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <p className="text-sm text-amber-700">
          Es werden nur die ersten {rows.length} Anfragen angezeigt. Der CSV-Export enthält alle.
        </p>
      )}
    </div>
  );
}
