"use client";

import { Flame, Award } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarHeatmap } from "./calendar-heatmap";
import { formatMeters } from "@/lib/geo/formatters";
import { useUnitPreference } from "@/lib/hooks/useUnitPreference";
import type { StreakData } from "@/lib/storage/progress-calculations";
import type { ProgressStats } from "@/types/progress";

interface StreakCardProps {
  streakData: StreakData;
  progress: ProgressStats;
}

export function StreakCard({ streakData, progress }: StreakCardProps) {
  const { currentStreak, longestStreak, walkDates } = streakData;
  const units = useUnitPreference();

  if (walkDates.length === 0) {
    return (
      <Card className="rounded-[2rem] p-6">
        <CardTitle>Walking Streaks</CardTitle>
        <CardDescription className="mt-2">
          Start walking daily to build your streak and see your consistency.
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] p-6">
      <CardTitle>Walking Streaks</CardTitle>
      <CardDescription className="mt-2">
        Track your consistency with daily walking streaks.
      </CardDescription>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Current Streak */}
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/15 to-transparent p-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
              Current Streak
            </p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </p>
          {currentStreak > 0 && (
            <p className="mt-1 text-xs text-orange-200">
              Keep it going! Walk today to continue.
            </p>
          )}
        </div>

        {/* Longest Streak */}
        <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-completed" />
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
              Longest Streak
            </p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </p>
          {currentStreak === longestStreak && longestStreak > 0 && (
            <p className="mt-1 text-xs text-completed">
              Personal record! 🎉
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <CalendarHeatmap walkDates={walkDates} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Total Distance
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatMeters(progress.totalWalkDistanceMeters, units)}
          </p>
          <p className="mt-1 text-xs text-white/60">Distance walked across all trips</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Completed Distance
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatMeters(progress.completedDistanceMeters, units)}
          </p>
          <p className="mt-1 text-xs text-white/60">Distance of completed streets</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Walks Logged</p>
          <p className="mt-2 text-2xl font-semibold text-white">{progress.walksLogged}</p>
          <p className="mt-1 text-xs text-white/60">
            {progress.walksLogged === 1 ? "walk" : "walks"} in your journal
          </p>
        </div>
      </div>
    </Card>
  );
}

// Made with Bob
