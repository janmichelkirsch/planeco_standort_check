import type { ReactNode } from "react";
import { Alert, Check, Clock, ExternalLink, Pin } from "@/components/icons";
import { linkCls } from "@/components/dashboard/ui";
import { plotState, type SubmissionRow } from "@/lib/dashboard";
import { serviceAreaStatus } from "@/lib/service-area";

type Plot = Pick<
  SubmissionRow,
  | "street"
  | "house_number"
  | "postal_code"
  | "city"
  | "municipality"
  | "county"
  | "state"
  | "latitude"
  | "longitude"
  | "geocode_status"
  | "address_source"
>;

const badge = "inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium";

/**
 * Grundstück mit Anreicherung (Case-Erweiterung): Gemeinde/Kreis/Bundesland, Einzugsgebiet und wie gut die Adresse bekannt ist.
 * Kartenlink nur bei genauer Adresse – „nur Ort ermittelt“ hat bewusst keine Koordinaten.
 */
export function PlotInfo({ plot: p }: { plot: Plot }) {
  const state = plotState(p);
  // Ohne Wiederholung („Hamburg · Hamburg“ bei Stadtstaaten, „Dresden · Dresden“ bei kreisfreien Städten).
  const region = [...new Set([p.municipality, p.county, p.state].filter(Boolean))].join(" · ");
  const map =
    state === "exact" ? `https://www.openstreetmap.org/?mlat=${p.latitude}&mlon=${p.longitude}#map=17/${p.latitude}/${p.longitude}` : null;

  return (
    <div className="text-sm">
      <p className="font-medium">
        {p.street} {p.house_number}
      </p>
      <p>
        {p.postal_code} {p.city}
      </p>
      {region && <p className="mt-1 text-[13px] text-forest-soft">{region}</p>}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <AreaBadge state={p.state} />
        {state === "town_only" && (
          <Badge cls="bg-warn-soft text-warn" icon={<Pin className="size-3.5" />}>
            nur Ort ermittelt
          </Badge>
        )}
        {state === "not_found" && (
          <Badge cls="bg-warn-soft text-warn" icon={<Alert className="size-3.5" />}>
            Adresse nicht gefunden
          </Badge>
        )}
        {state === "pending" && (
          <Badge cls="bg-line-soft text-forest-soft" icon={<Clock className="size-3.5" />}>
            wird nachgeschlagen …
          </Badge>
        )}
        {state === "failed" && (
          <Badge cls="bg-danger-soft text-danger" icon={<Alert className="size-3.5" />}>
            Nachschlagen fehlgeschlagen
          </Badge>
        )}
      </div>
      {state === "failed" && <p className="mt-1.5 text-[13px] text-forest-soft">Wird mit „Erneut verarbeiten“ wiederholt.</p>}

      <p className="mt-2.5 flex items-center gap-3 text-[13px] text-forest-soft">
        <span>{p.address_source === "photon" ? "Aus Adressvorschlag" : "Manuell eingegeben"}</span>
        {map && (
          <a href={map} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1 ${linkCls}`}>
            Karte <ExternalLink className="size-3.5" />
          </a>
        )}
      </p>
    </div>
  );
}

function Badge({ cls, icon, children }: { cls: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <span className={`${badge} ${cls}`}>
      {icon}
      {children}
    </span>
  );
}

function AreaBadge({ state }: { state: string | null }) {
  const area = serviceAreaStatus(state);
  if (area === "inside")
    return (
      <Badge cls="bg-ok-soft text-ok" icon={<Check className="size-3.5" />}>
        im Einzugsgebiet
      </Badge>
    );
  if (area === "outside") return <Badge cls="bg-danger-soft text-danger">außerhalb</Badge>;
  return <Badge cls="bg-line-soft text-forest-soft">Gebiet unbekannt</Badge>;
}
