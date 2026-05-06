"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { WalkRouteThumbnail } from "@/components/walk/walk-route-thumbnail";
import { formatDurationMinutes, formatMeters } from "@/lib/geo/formatters";
import { useUnitPreference } from "@/lib/hooks/useUnitPreference";
import type { WalkRecord } from "@/types/walk";

interface JournalListProps {
  walks: WalkRecord[];
}

export function JournalList({ walks }: JournalListProps) {
  const units = useUnitPreference();

  if (walks.length === 0) {
    return (
      <Card className="rounded-[2rem] p-6">
        <CardTitle>No walks logged yet</CardTitle>
        <CardDescription className="mt-2">
          Go to the map, start and finish a walk—saved trips show up here. This list is
          stored only in this browser for now.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {walks.map((walk) => (
        <Link key={walk.id} href={`/walk/${walk.id}`}>
          <Card className="rounded-[2rem] p-6 transition hover:bg-white/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>{walk.title}</CardTitle>
                <CardDescription className="mt-2">
                  {new Date(walk.startedAt).toLocaleString()}
                </CardDescription>

                <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/72">
                  <span className="rounded-full border border-white/8 bg-white/6 px-3 py-1">
                    {formatMeters(walk.distanceMeters, units)}
                  </span>
                  <span className="rounded-full border border-white/8 bg-white/6 px-3 py-1">
                    {formatDurationMinutes(walk.durationSeconds)}
                  </span>
                  <span className="rounded-full border border-white/8 bg-white/6 px-3 py-1">
                    {walk.newlyCompletedSegmentIds.length} new streets
                  </span>
                  {walk.photoUrls && walk.photoUrls.length > 0 && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/6 px-3 py-1">
                      <Camera className="h-3.5 w-3.5" />
                      {walk.photoUrls.length}
                    </span>
                  )}
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">
                  {walk.notes || "No notes yet. Tap in to add reflections and future photos."}
                </p>
              </div>

              <div className="w-full lg:w-48">
                <WalkRouteThumbnail route={walk.route} />
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// Made with Bob
