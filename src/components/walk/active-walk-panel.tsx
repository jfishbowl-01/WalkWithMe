"use client";

import { Navigation, Timer, Waypoints } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import type { ActiveWalkSnapshot } from "@/types/walk";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(2)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

interface ActiveWalkPanelProps {
  snapshot: ActiveWalkSnapshot;
}

export function ActiveWalkPanel({ snapshot }: ActiveWalkPanelProps) {
  return (
    <Card className="w-full max-w-sm rounded-[1.5rem] p-4">
      <div className="flex items-center justify-between gap-3">
        <CardTitle className="text-base">Current walk</CardTitle>
        <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/55">
          {snapshot.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-white">
        <div className="rounded-xl border border-white/8 bg-white/6 p-3">
          <Timer className="h-4 w-4 text-completed" />
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/45">Time</p>
          <p className="mt-1 text-base font-semibold">{formatDuration(snapshot.elapsedSeconds)}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/6 p-3">
          <Navigation className="h-4 w-4 text-active-route" />
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/45">Distance</p>
          <p className="mt-1 text-base font-semibold">
            {formatDistance(snapshot.distanceMeters)}
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/6 p-3">
          <Waypoints className="h-4 w-4 text-success" />
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/45">Points</p>
          <p className="mt-1 text-base font-semibold">{snapshot.points.length}</p>
        </div>
      </div>

      {snapshot.errorMessage ? (
        <p className="mt-4 text-sm text-rose-300">{snapshot.errorMessage}</p>
      ) : null}
    </Card>
  );
}

// Made with Bob
