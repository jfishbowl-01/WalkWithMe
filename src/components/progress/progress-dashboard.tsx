"use client";

import { useEffect, useReducer } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { ProgressRing } from "@/components/progress/progress-ring";
import { PersonalRecordsCard } from "@/components/progress/personal-records-card";
import { StreakCard } from "@/components/progress/streak-card";
import { CompletionMapPreview } from "@/components/progress/completion-map-preview";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  buildProgressStats,
  walkRepository,
  completionRepository,
} from "@/lib/storage/repositories";
import {
  calculatePersonalRecords,
  calculateStreaks,
} from "@/lib/storage/progress-calculations";

/**
 * Progress reads from localStorage. It must not SSR real storage values or the
 * client will hydrate with empty server defaults and stay wrong until a refocus.
 * This module is loaded with `dynamic(..., { ssr: false })` from the route.
 */
export function ProgressDashboard() {
  const [, bump] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const refresh = () => bump();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const progress = buildProgressStats();
  const walks = walkRepository.getAll();
  const completedSegments = completionRepository.getAll();
  const personalRecords = calculatePersonalRecords(walks);
  const streakData = calculateStreaks(walks);

  return (
    <AppShell
      title="Progress"
      subtitle="How you’re doing on the sample street map, your records, and streaks."
      activePath="/progress"
    >
      <div className="grid gap-4 lg:grid-cols-[0.6fr_1fr]">
        <Card className="rounded-[2rem] p-6">
          <CardTitle>Sample map completion</CardTitle>
          <CardDescription className="mt-2">
            This ring is your share of the preview street network near Cambridge, MA—not
            your whole region. Saved walks can still show 0% here if the path doesn’t
            overlap the preview.
          </CardDescription>

          <div className="mt-6 flex justify-center">
            <ProgressRing
              percentage={progress.completionPercentage}
              label="Completed"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                Streets
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {progress.completedSegments} / {progress.totalSegments}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                This Week
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                +{progress.newlyCompletedThisWeek}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] p-6">
          <CardTitle>Completion map</CardTitle>
          <CardDescription className="mt-2">
            Lines light up for streets you’ve completed on the preview map (same area as
            above).
          </CardDescription>

          <div className="mt-6 h-[280px]">
            <CompletionMapPreview
              completedSegments={completedSegments}
              walksLogged={walks.length}
            />
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <PersonalRecordsCard records={personalRecords} />
      </div>

      <div className="mt-4">
        <StreakCard streakData={streakData} progress={progress} />
      </div>
    </AppShell>
  );
}
