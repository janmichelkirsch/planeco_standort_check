import { Tag } from "@/components/dashboard/ui";
import { originOf, type TrackingFields } from "@/lib/channel";

/** Herkunft einer Anfrage: Kanal, Kampagne, Klick-ID; ohne Kampagne „über {Host}“ bzw. „direkt aufgerufen“. */
export function CampaignInfo({ tracking }: { tracking: TrackingFields }) {
  const o = originOf(tracking);
  if (!o.fromCampaign)
    return (
      <div className="text-sm">
        <p className="font-medium">Ohne Kampagne</p>
        <p className="mt-0.5 text-forest-soft">{o.referrerHost ? `über ${o.referrerHost}` : "direkt aufgerufen"}</p>
      </div>
    );
  const raw = [tracking.utm_source, tracking.utm_medium].filter(Boolean).join(" / ");
  return (
    <div className="text-sm">
      <p className="font-medium">{o.channel}</p>
      {raw && raw !== o.channel && <p className="text-[13px] text-forest-soft">{raw}</p>}
      <p className="mt-0.5 truncate text-forest-soft" title={o.campaign}>
        {o.hasCampaignName ? `Kampagne: ${o.campaign}` : o.campaign}
      </p>
      {o.click && <Tag className="mt-2">{o.click}</Tag>}
    </div>
  );
}
