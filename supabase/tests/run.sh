#!/bin/sh
# Testet supabase/004_contact_model.sql gegen eine Wegwerf-Datenbank (nicht gegen Supabase).
# Aufruf: supabase/tests/run.sh [Pfad zu den Postgres-Binaries]
set -eu
BIN="${1:-/Library/PostgreSQL/18/bin}"
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d /tmp/pgtest.XXXXXX)"
PORT=55432
trap '"$BIN/pg_ctl" -D "$TMP/data" stop -m fast >/dev/null 2>&1 || true; rm -rf "$TMP"' EXIT

"$BIN/initdb" -D "$TMP/data" -U postgres -A trust -E UTF8 --locale=C >/dev/null
"$BIN/pg_ctl" -D "$TMP/data" -o "-p $PORT -k '' -c listen_addresses=127.0.0.1" -l "$TMP/log" -w start >/dev/null
q() { "$BIN/psql" -h 127.0.0.1 -p $PORT -U postgres -d postgres -v ON_ERROR_STOP=1 -q -X "$@"; }

q -f "$HERE/00_supabase_stub.sql"
sed -e 's/<E-Mail von Emily>/emily@test.local/' -e 's/<E-Mail von Björn>/bjoern@test.local/' \
    -e 's/<E-Mail von Michel>/michel@test.local/' "$HERE/../004_contact_model.sql" | q -o /dev/null
echo "004 angewendet"
status=0
q -f "$HERE/01_contact_model.sql" >"$TMP/out" 2>&1 || status=$?
sed 's/^psql:.*NOTICE:  //' "$TMP/out"
[ "$status" = 0 ] || { echo "FEHLER: SQL-Tests abgebrochen"; exit 1; }

# Gleichzeitigkeit: Session A hält die Transaktion 3 s offen, Session B kommt 1 s später.
payload='{"firstName":"Kai","lastName":"Ruthenberg","street":"Osterstraße","houseNumber":"88","postalCode":"22765","city":"Hamburg","addressSource":"manual"}'
new_intake() {
  q -Atc "insert into incoming_submissions (client_request_id, payload, normalized_email, normalized_phone)
          values (gen_random_uuid(), '$payload', '$1', '$2') returning id" | head -1
}
a=$(new_intake race@test.local +494055500001); b=$(new_intake race@test.local +494055500001)
( q -Atc "begin; select process_intake('$a'); select pg_sleep(3); commit;" >/dev/null ) &
sleep 1; q -Atc "select process_intake('$b')" >/dev/null; wait
n=$(q -Atc "select count(distinct contact_id) from contact_methods where normalized_value = 'race@test.local'")
[ "$n" = 1 ] && echo "OK  L1 zwei gleichzeitige Erst-Eingänge → ein Kontakt (Advisory Lock)" || { echo "FEHLER L1: $n Kontakte"; exit 1; }

c=$(new_intake same@test.local +491705550000)
( q -Atc "begin; select process_intake('$c'); select pg_sleep(2); commit;" >/dev/null ) &
sleep 0.5; q -Atc "select process_intake('$c')" >/dev/null; wait
n=$(q -Atc "select count(*) from submissions where intake_id = '$c'")
[ "$n" = 1 ] && echo "OK  L2 after() und „Erneut verarbeiten“ gleichzeitig → eine Submission" || { echo "FEHLER L2: $n"; exit 1; }
echo "Alle Tests bestanden"
