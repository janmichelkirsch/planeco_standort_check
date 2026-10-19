# supabase/tests/

Tests für `../004_contact_model.sql`. Laufen gegen eine **lokale Wegwerf-Datenbank**, nie gegen Supabase.

- `run.sh` – startet einen temporären Postgres-Server (Port 55432), spielt Stub, Migration und Tests ein, räumt danach auf.
  Aufruf: `supabase/tests/run.sh [Pfad zu den Postgres-Binaries]` (Standard: `/Library/PostgreSQL/18/bin`).
- `00_supabase_stub.sql` – bildet nach, was Supabase mitbringt: Rollen `anon`/`authenticated`/`service_role`,
  `auth.users`, `auth.uid()` (liest `request.jwt.claim.sub`), drei Test-Nutzer.
- `01_contact_model.sql` – Matching, Prüfliste, Zuständigkeit, Status, Rechte und Integrität (je Fall eine `OK`-Zeile).
  Die Gleichzeitigkeits-Tests (Advisory Lock, doppelte Verarbeitung) stehen in `run.sh`, weil sie zwei Sessions brauchen.
