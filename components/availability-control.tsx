"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function AvailabilityControl() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/availability", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.available === "boolean") {
          setAvailable(d.available);
          setUpdatedAt(d.updatedAt ?? null);
        } else {
          setError(
            "Could not load status. Check the Status tab in your sheet.",
          );
        }
      })
      .catch(() => setError("Could not load status."));
  }, []);

  const toggle = async () => {
    if (available === null) return;
    const next = !available;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setAvailable(data.available);
      setUpdatedAt(data.updatedAt ?? null);
    } catch {
      setError("Could not update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-6 border-border bg-card">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Ride Requests</h2>
          <p className="text-sm text-muted-foreground">
            {available === null
              ? "Loading status..."
              : available
                ? "ON: customers can request rides."
                : "OFF: customers are told the driver is far away."}
          </p>
          {updatedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Last changed: {new Date(updatedAt).toLocaleString()}
            </p>
          )}
          {error && (
            <p className="mt-1 text-sm font-semibold text-red-600">{error}</p>
          )}
        </div>

        <button
          onClick={toggle}
          disabled={saving || available === null}
          className={`min-w-44 rounded-xl px-6 py-4 text-lg font-bold text-white transition disabled:opacity-50 ${
            available
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {saving
            ? "Saving..."
            : available === null
              ? "..."
              : available
                ? "ON: Taking rides"
                : "OFF: Unavailable"}
        </button>
      </CardContent>
    </Card>
  );
}
