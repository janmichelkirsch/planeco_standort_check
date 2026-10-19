import { describe, expect, it } from "vitest";
import { formatBerlinDateTime, formatBerlinLongDate, greetingFor } from "@/lib/format";

describe("formatBerlinLongDate", () => {
  it("schreibt das Datum in deutscher Zeit aus", () => {
    expect(formatBerlinLongDate(new Date("2026-10-19T08:00:00Z"))).toBe("Montag, 19. Oktober 2026");
  });

  it("nimmt kurz vor Mitternacht UTC schon den nächsten Tag in Berlin", () => {
    expect(formatBerlinLongDate(new Date("2026-10-18T22:30:00Z"))).toBe("Montag, 19. Oktober 2026");
  });
});

describe("greetingFor", () => {
  it("grüßt nach Berliner Uhrzeit (Sommerzeit, UTC+2)", () => {
    expect(greetingFor(new Date("2026-10-19T05:00:00Z"))).toBe("Guten Morgen"); // 07:00
    expect(greetingFor(new Date("2026-10-19T08:59:00Z"))).toBe("Guten Morgen"); // 10:59
    expect(greetingFor(new Date("2026-10-19T09:00:00Z"))).toBe("Guten Tag"); // 11:00
    expect(greetingFor(new Date("2026-10-19T16:00:00Z"))).toBe("Guten Abend"); // 18:00
  });

  it("zählt nach Mitternacht wieder als Morgen", () => {
    expect(greetingFor(new Date("2026-10-18T22:30:00Z"))).toBe("Guten Morgen"); // 00:30
  });
});

describe("formatBerlinDateTime", () => {
  it("zeigt UTC-Zeitstempel in deutscher Zeit", () => {
    expect(formatBerlinDateTime("2026-10-17T20:25:00Z")).toBe("17.10.26, 22:25");
  });
});
