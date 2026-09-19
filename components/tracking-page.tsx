"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

const DAY_COUNT = 18;
const NIGHT_COUNT = 17;
const TOTAL_RIDES = DAY_COUNT + NIGHT_COUNT; // 35
const DAY_TARGET = 300; // GHS
const NIGHT_TARGET = 300; // GHS
const TOTAL_TARGET = DAY_TARGET + NIGHT_TARGET; // 600 GHS
const AVG_RIDE_VALUE = TOTAL_TARGET / TOTAL_RIDES; // ~17.14 GHS per ride
const SAVE_DELAY_MS = 400; // wait this long after the last tap before writing to the sheet

// Local calendar date (YYYY-MM-DD) — the day on the driver's own device.
const today = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};
const emptyRides = () => new Array(TOTAL_RIDES).fill(false);
const newestFirst = (a: Row, b: Row) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0;

type Row = { date: string; rides: boolean[] };

export default function TrackingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [todayStr, setTodayStr] = useState(today);
  const [newDate, setNewDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const { toast } = useToast();

  // Always-current copy of `rows`, so handlers never work from stale state.
  const rowsRef = useRef<Row[]>([]);
  // Save bookkeeping, per date:
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({}); // debounce timers
  const queued = useRef<Record<string, boolean[]>>({}); // newest ticks waiting to be sent
  const inFlight = useRef<Set<string>>(new Set()); // dates with a request currently running
  const failed = useRef<Set<string>>(new Set()); // dates whose last save failed
  const ready = useRef(false); // initial load finished

  const commit = (next: Row[]) => {
    const sorted = [...next].sort(newestFirst);
    rowsRef.current = sorted;
    setRows(sorted);
  };

  // Sends the newest queued state for a date. Only ONE request per date is ever in
  // flight: if you tick again while it runs, the newer state is sent right after it
  // finishes. That keeps writes in order and stops a new date from being appended twice.
  const flush = async (date: string) => {
    if (inFlight.current.has(date)) return;
    const rides = queued.current[date];
    if (!rides) return;
    delete queued.current[date];
    inFlight.current.add(date);

    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, rides }),
        cache: "no-store",
        keepalive: true, // lets the request finish even if the tab is closing
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      failed.current.delete(date);
    } catch (err) {
      console.error("Error saving tracking data:", err);
      failed.current.add(date);
      toast({
        title: "Not saved",
        description: `${formatDate(date)} didn't reach the sheet. Tap "Retry" or tick a box again.`,
        variant: "destructive",
      });
    } finally {
      inFlight.current.delete(date);
      setSaveFailed(failed.current.size > 0);
      if (queued.current[date]) {
        void flush(date); // more ticks arrived while saving
      } else {
        setSavingDate((d) => (d === date ? null : d));
      }
    }
  };

  // Debounced per date; takes the new array explicitly so it can never save stale state.
  const save = (date: string, rides: boolean[]) => {
    queued.current[date] = rides;
    setSavingDate(date);
    clearTimeout(timers.current[date]);
    timers.current[date] = setTimeout(() => {
      delete timers.current[date];
      void flush(date);
    }, SAVE_DELAY_MS);
  };

  // Delete a row entirely from the page and the sheet

  const deleteRow = async (date: string) => {
    // Add confirmation prompt before deleting
    if (
      !confirm(
        `Are you sure you want to delete the row for ${formatDate(date)}? This action cannot be undone.`,
      )
    ) {
      return; // Exit if user cancels
    }
    try {
      const res = await fetch(`/api/tracking?date=${date}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Remove the row from the UI
      commit(rowsRef.current.filter((r) => r.date !== date));

      toast({
        title: "Row deleted",
        description: `${formatDate(date)} has been removed from the sheet.`,
      });
    } catch (err) {
      console.error("Error deleting row:", err);
      toast({
        title: "Delete failed",
        description: `Could not delete ${formatDate(date)}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Send everything that is waiting right now (used when leaving / hiding the page).
  const flushAll = () => {
    Object.keys(timers.current).forEach((d) => {
      clearTimeout(timers.current[d]);
      delete timers.current[d];
    });
    Object.keys(queued.current).forEach((d) => void flush(d));
  };

  // Make sure a date has a row — on the page AND in the sheet (a fresh, unticked row).
  const ensureRow = (date: string) => {
    if (rowsRef.current.some((r) => r.date === date)) return;
    commit([...rowsRef.current, { date, rides: emptyRides() }]);
    save(date, emptyRides());
  };

  // Initial load.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/tracking", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        const loaded: Row[] = (data?.rows ?? []).map((r: Row) => ({
          date: r.date,
          rides: normalise(r.rides),
        }));
        commit(loaded);

        // A new day = a new row with every box unticked (also written to the sheet).
        ensureRow(today());
      } catch (err) {
        if (cancelled) return;
        console.error("Error loading tracking data:", err);
        commit([{ date: today(), rides: emptyRides() }]);
        toast({
          title: "Couldn't load history",
          description:
            "Showing today only. Check the Tracking sheet and your connection.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) {
          ready.current = true;
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A page left open past midnight (or a phone waking up the next morning) rolls over to a
  // new row with fresh, unticked boxes.
  useEffect(() => {
    const check = () => {
      const t = today();
      setTodayStr((prev) => (prev === t ? prev : t));
      if (ready.current) ensureRow(t);
    };
    const id = setInterval(check, 30_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Never lose a tap made just before leaving: send it instead of dropping it.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flushAll();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      flushAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick OR untick: flips one box and writes the whole day to the sheet (TRUE / FALSE).
  const toggle = (date: string, index: number) => {
    const row = rowsRef.current.find((r) => r.date === date);
    if (!row) return;
    const rides = row.rides.map((v, i) => (i === index ? !v : v));
    commit(rowsRef.current.map((r) => (r.date === date ? { ...r, rides } : r)));
    save(date, rides);
  };

  const addRow = () => {
    if (!newDate) return;
    if (rowsRef.current.some((r) => r.date === newDate)) {
      toast({
        title: "Already there",
        description: `${formatDate(newDate)} is on the sheet already.`,
      });
      return;
    }
    ensureRow(newDate);
  };

  const clearRow = (date: string) => {
    const blank = emptyRides();
    commit(
      rowsRef.current.map((r) =>
        r.date === date ? { ...r, rides: blank } : r,
      ),
    );
    save(date, blank);
  };

  // Re-send the current state of every date whose last save failed.
  const retryFailed = () => {
    Array.from(failed.current).forEach((date) => {
      const row = rowsRef.current.find((r) => r.date === date);
      if (row) save(date, row.rides);
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading tracking data...
      </div>
    );
  }

  const todayRow = rows.find((r) => r.date === todayStr);
  const todayDone = todayRow ? todayRow.rides.filter(Boolean).length : 0;
  const todayDay = todayRow
    ? todayRow.rides.slice(0, DAY_COUNT).filter(Boolean).length
    : 0;
  const todayNight = todayRow
    ? todayRow.rides.slice(DAY_COUNT).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Today's summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          label="Day (today)"
          value={`${todayDay}/${DAY_COUNT}`}
          tone="text-green-600"
          bar="bg-green-600"
          percent={(todayDay / DAY_COUNT) * 100}
        />
        <Stat
          label="Night (today)"
          value={`${todayNight}/${NIGHT_COUNT}`}
          tone="text-purple-600"
          bar="bg-purple-600"
          percent={(todayNight / NIGHT_COUNT) * 100}
        />
        <Stat
          label="Total (today)"
          value={`${todayDone}/${TOTAL_RIDES}`}
          tone="text-blue-600"
          bar="bg-blue-600"
          percent={(todayDone / TOTAL_RIDES) * 100}
        />
        <Stat
          label="Estimated revenue"
          value={`GHS ${(todayDone * AVG_RIDE_VALUE).toFixed(2)}`}
          tone="text-foreground"
          sub={`Target: GHS ${TOTAL_TARGET}`}
        />
      </div>

      {/* Add a date */}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="new-date" className="text-sm font-medium">
          Add a date:
        </label>
        <input
          id="new-date"
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2"
        />
        <Button onClick={addRow}>Add row</Button>
        {saveFailed ? (
          <span className="flex items-center gap-2 text-sm text-destructive">
            Not saved to the sheet
            <Button size="sm" variant="outline" onClick={retryFailed}>
              Retry
            </Button>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            {savingDate ? `Saving ${formatDate(savingDate)}…` : "Saved"}
          </span>
        )}
      </div>

      {/* One row of 35 boxes per date */}
      <Card>
        <CardHeader>
          <CardTitle>Ride tracker</CardTitle>
          <p className="text-sm text-muted-foreground">
            Boxes 1–{DAY_COUNT} are the day shift (GHS {DAY_TARGET}),{" "}
            {DAY_COUNT + 1}–{TOTAL_RIDES} the night shift (GHS {NIGHT_TARGET}).
            Tick one per ride; tap again to untick.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-max border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium">
                  Date
                </th>
                {Array.from({ length: TOTAL_RIDES }, (_, i) => (
                  <th
                    key={i}
                    className={`w-9 px-0 py-2 text-center text-xs font-normal text-muted-foreground ${
                      i === DAY_COUNT ? "border-l-2 border-border" : ""
                    }`}
                  >
                    {i < DAY_COUNT ? i + 1 : i - DAY_COUNT + 1}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-medium">Total</th>
                <th className="px-3 py-2 text-right font-medium">GHS</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const done = row.rides.filter(Boolean).length;
                const isToday = row.date === todayStr;
                return (
                  <tr
                    key={row.date}
                    className={isToday ? "bg-muted/40" : undefined}
                  >
                    <td
                      className={`sticky left-0 z-10 whitespace-nowrap px-3 py-1.5 font-medium ${
                        isToday ? "bg-muted" : "bg-background"
                      }`}
                    >
                      {formatDate(row.date)}
                      {isToday && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          today
                        </span>
                      )}
                    </td>

                    {row.rides.map((ticked, i) => (
                      <td
                        key={i}
                        className={`p-0.5 ${
                          i === DAY_COUNT ? "border-l-2 border-border" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggle(row.date, i)}
                          aria-pressed={ticked}
                          aria-label={`${formatDate(row.date)} ride ${i + 1}`}
                          className={`flex h-8 w-8 items-center justify-center rounded border-2 text-xs font-bold transition-all active:scale-90 ${
                            ticked
                              ? i < DAY_COUNT
                                ? "border-green-600 bg-green-600 text-white"
                                : "border-purple-600 bg-purple-600 text-white"
                              : "border-border bg-background text-transparent hover:border-foreground/40"
                          }`}
                        >
                          ✓
                        </button>
                      </td>
                    ))}

                    <td className="whitespace-nowrap px-3 py-1.5 text-right font-semibold">
                      {done}/{TOTAL_RIDES}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-right text-muted-foreground">
                      {(done * AVG_RIDE_VALUE).toFixed(0)}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => clearRow(row.date)}
                          className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                        >
                          clear
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRow(row.date)}
                          className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                          title="Delete this row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function normalise(rides: boolean[] | undefined): boolean[] {
  return Array.from({ length: TOTAL_RIDES }, (_, i) => Boolean(rides?.[i]));
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Stat({
  label,
  value,
  tone,
  bar,
  percent,
  sub,
}: {
  label: string;
  value: string;
  tone: string;
  bar?: string;
  percent?: number;
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${tone}`}>{value}</div>
        {typeof percent === "number" && (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              {percent.toFixed(1)}%
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full transition-all ${bar}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </>
        )}
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
