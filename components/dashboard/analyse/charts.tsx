"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

/** Diagramme der Analyse (aus dem Figma-Entwurf): Linien mit Tooltip, Tabelle für Screenreader, Sparkline, Ring. Ohne Bibliothek, reines SVG. */

export type Series = { key: string; label: string; color: string; values: number[] };

const AXIS = "#556b66";
const GRID = "#dde3da";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Runde Achsenschritte (1, 2, 5, 10 …) mit höchstens `maxTicks` Strichen. */
export function niceScale(max: number, maxTicks: number) {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
  const step = steps.find((s) => Math.ceil(Math.max(max, 1) / s) <= maxTicks) ?? 1000;
  const top = Math.max(1, Math.ceil(max / step)) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return { top, ticks };
}

type LineChartProps = {
  days: string[];
  series: Series[];
  height: number;
  tickLabel: (d: string) => string;
  tooltipDay: (d: string) => string;
  unit: string;
  ariaLabel: string;
};

export function LineChart({ days, series, height, tickLabel, tooltipDay, unit, ariaLabel }: LineChartProps) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const pad = { l: 32, r: 20, t: 14, b: 28 };
  const n = days.length;
  const { top, ticks } = niceScale(Math.max(0, ...series.flatMap((s) => s.values)), 5);
  const iw = Math.max(0, W - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const x = (i: number) => (n > 1 ? pad.l + (i * iw) / (n - 1) : pad.l + iw / 2);
  const y = (v: number) => pad.t + ih - (v / top) * ih;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 64))));
  const xTicks = days.map((_, i) => i).filter((i) => i % every === 0);

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left;
    setHover(n > 1 ? Math.min(n - 1, Math.max(0, Math.round((px / box.width) * (n - 1)))) : 0);
  };
  const hoverRows = hover === null ? [] : series.map((s) => ({ s, v: s.values[hover] })).sort((a, b) => b.v - a.v);

  return (
    <div ref={ref} className="relative" style={{ height }}>
      {W > 0 && (
        <>
          <svg width={W} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} strokeDasharray={t === 0 ? undefined : "2 4"} />
                <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={AXIS} className="tabular-nums">
                  {t}
                </text>
              </g>
            ))}
            {xTicks.map((i) => (
              <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={11} fill={AXIS} className="tabular-nums">
                {tickLabel(days[i])}
              </text>
            ))}
            {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="#22403b" strokeOpacity={0.35} strokeWidth={1} />}
            {series.map((s) => (
              <g key={s.key}>
                <polyline
                  points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {n <= 31 && s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={2.5} fill={s.color} stroke="white" strokeWidth={1.5} />)}
                {hover !== null && <circle cx={x(hover)} cy={y(s.values[hover])} r={4.5} fill={s.color} stroke="white" strokeWidth={2} />}
              </g>
            ))}
            <rect x={pad.l} y={pad.t} width={iw} height={ih} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
          </svg>

          {hover !== null && (
            <div
              className="pointer-events-none absolute z-10 min-w-36 rounded-xl bg-forest px-3 py-2.5 text-xs text-white shadow-lg"
              style={{ top: pad.t, ...(x(hover) > W / 2 ? { right: W - x(hover) + 12 } : { left: x(hover) + 12 }) }}
            >
              <p className="mb-1.5 font-semibold">{tooltipDay(days[hover])}</p>
              <ul className="space-y-1">
                {hoverRows.map(({ s, v }) => (
                  <li key={s.key} className="flex items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full ring-1 ring-white/80" style={{ background: s.color }} />
                    <span className="flex-1 whitespace-nowrap text-white/80">{s.label}</span>
                    <span className="font-semibold tabular-nums">{v}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[11px] text-white/60">{unit}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Dieselben Zahlen als Tabelle, nur für Screenreader. */
export function DataTable({ caption, days, series, dayLabel }: { caption: string; days: string[]; series: Series[]; dayLabel: (d: string) => string }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Tag</th>
          {series.map((s) => (
            <th key={s.key} scope="col">
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map((d, i) => (
          <tr key={d}>
            <th scope="row">{dayLabel(d)}</th>
            {series.map((s) => (
              <td key={s.key}>{s.values[i]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Sparkline({ values, color = "#22403b" }: { values: number[]; color?: string }) {
  const w = 88;
  const h = 32;
  const max = Math.max(1, ...values);
  const n = values.length;
  if (n < 2) return null;
  const pts = values.map((v, i) => [(i / (n - 1)) * (w - 6) + 3, h - 4 - (v / max) * (h - 8)] as const);
  return (
    <svg width={w} height={h} aria-hidden="true" className="shrink-0">
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={3} fill={color} stroke="white" strokeWidth={1.5} />
    </svg>
  );
}

export function Donut({ parts, size = 168, children }: { parts: { label: string; n: number; color: string }[]; size?: number; children?: ReactNode }) {
  const total = parts.reduce((s, p) => s + p.n, 0);
  const r = 54;
  const C = 2 * Math.PI * r;
  const visible = parts.filter((p) => p.n > 0);
  const gap = visible.length > 1 ? 3 : 0;
  const lengths = visible.map((p) => (p.n / total) * C);
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" width={size} height={size} role="img" aria-label={parts.map((p) => `${p.n} ${p.label}`).join(", ")}>
        <circle cx={70} cy={70} r={r} fill="none" stroke={GRID} strokeWidth={16} opacity={total ? 0 : 1} />
        {visible.map((p, i) => (
          <circle
            key={p.label}
            cx={70}
            cy={70}
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth={16}
            strokeDasharray={`${Math.max(0.5, lengths[i] - gap)} ${C}`}
            strokeDashoffset={-offsets[i]}
            transform="rotate(-90 70 70)"
          >
            <title>{`${p.label}: ${p.n}`}</title>
          </circle>
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
