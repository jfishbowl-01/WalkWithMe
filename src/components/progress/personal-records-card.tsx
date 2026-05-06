"use client";

import { Trophy, Route, Zap, Calendar } from "lucide-react";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { formatMeters } from "@/lib/geo/formatters";
import { useUnitPreference } from "@/lib/hooks/useUnitPreference";
import type { PersonalRecords } from "@/lib/storage/progress-calculations";

export function PersonalRecordsCard({ records }: { records: PersonalRecords }) {
  const units = useUnitPreference();

  if (!records.longestWalk) {
    return (
      <Card className="rounded-[2rem] p-6">
        <CardTitle>Personal Records</CardTitle>
        <CardDescription className="mt-2">
          Finish and save a walk to see longest distance and other highlights here.
        </CardDescription>
      </Card>
    );
  }

  const recordItems = [
    {
      icon: Route,
      label: "Longest Walk",
      value: formatMeters(records.longestWalk.distance, units),
      walkId: records.longestWalk.walkId,
      color: "text-completed",
    },
    {
      icon: Trophy,
      label: "Most Streets",
      value: `${records.mostSegmentsInOneWalk!.count} streets`,
      walkId: records.mostSegmentsInOneWalk!.walkId,
      color: "text-success",
    },
    records.fastestPace
      ? {
          icon: Zap,
          label: "Fastest Pace",
          value: `${Math.round(records.fastestPace.metersPerMinute)} m/min`,
          walkId: records.fastestPace.walkId,
          color: "text-warning",
        }
      : null,
    records.busiestDay
      ? {
          icon: Calendar,
          label: "Busiest Day",
          value: formatMeters(records.busiestDay.totalDistance, units),
          walkId: null,
          color: "text-active-route",
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Route;
    label: string;
    value: string;
    walkId: string | null;
    color: string;
  }>;

  return (
    <Card className="rounded-[2rem] p-6">
      <CardTitle>Personal Records</CardTitle>
      <CardDescription className="mt-2">
        Your best distances and streaks from saved walks. Street counts use the preview
        map rules above.
      </CardDescription>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {recordItems.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <div className="rounded-2xl border border-white/8 bg-white/6 p-4 transition-all hover:bg-white/10">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${item.color}`} />
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                  {item.label}
                </p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {item.value}
              </p>
            </div>
          );

          return item.walkId ? (
            <Link key={index} href={`/walk/${item.walkId}`}>
              {content}
            </Link>
          ) : (
            <div key={index}>{content}</div>
          );
        })}
      </div>
    </Card>
  );
}

// Made with Bob
