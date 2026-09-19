"use client";

import TrackingPage from "@/components/tracking-page";

export default function Tracking() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Daily Ride Tracking
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your daily rides and monitor progress toward your GHS 600 target
        </p>
      </div>
      <TrackingPage />
    </div>
  );
}
