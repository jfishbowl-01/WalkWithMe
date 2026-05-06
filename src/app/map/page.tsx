"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Flame, Sparkles, Trophy } from "lucide-react";
import { MapControlsCard } from "@/components/map/map-controls-card";
import { AppBottomTabs } from "@/components/shell/app-bottom-tabs";
import { ProfileBubble } from "@/components/shell/profile-bubble";
import { ActiveWalkPanel } from "@/components/walk/active-walk-panel";
import { StartWalkButton } from "@/components/walk/start-walk-button";
import { buildLineStringFromPoints } from "@/lib/geo/buildLineStringFromPoints";
import { calculateCompletedSegments } from "@/lib/geo/calculateCompletedSegments";
import { DEMO_WALKS } from "@/lib/mock-data/demo-walks";
import { generateProceduralDemoWalk } from "@/lib/mock-data/procedural-demo-walk";
import { useLocalSession } from "@/lib/hooks/useLocalSession";
import { useWalkTracker } from "@/lib/hooks/useWalkTracker";
import { CAMBRIDGE_SEGMENTS } from "@/lib/mock-data/cambridge-segments";
import {
  buildProgressStats,
  completionRepository,
  walkRepository,
} from "@/lib/storage/repositories";
import { GPS_HINT_SHORT } from "@/lib/config/user-facing-copy";
import { calculateStreaks } from "@/lib/storage/progress-calculations";
import type { DraftWalkSummary, WalkRecord } from "@/types/walk";

const MapView = dynamic(
  () => import("@/components/map/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
  },
);

function createWalkId() {
  return `walk_${crypto.randomUUID()}`;
}

export default function MapPage() {
  const router = useRouter();
  const { session, isHydrated } = useLocalSession();
  const [recentlyCompletedIds, setRecentlyCompletedIds] = useState<string[]>([]);
  const [completedSegments, setCompletedSegments] = useState<ReturnType<typeof completionRepository.getAll>>(() => {
    if (typeof window === 'undefined') return [];
    return completionRepository.getAll();
  });
  const [progress, setProgress] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        completionPercentage: 0,
        completedSegments: 0,
        totalSegments: 0,
        completedDistanceMeters: 0,
        totalWalkDistanceMeters: 0,
        walksLogged: 0,
        newlyCompletedThisWeek: 0,
      };
    }
    return buildProgressStats();
  });
  const tracker = useWalkTracker({
    demoWalk: DEMO_WALKS[0],
  });

  const currentRoute = useMemo(() => {
    if (tracker.snapshot.points.length < 2) {
      return null;
    }

    return buildLineStringFromPoints(tracker.snapshot.points);
  }, [tracker.snapshot.points]);

  const currentPosition = useMemo(() => {
    const points = tracker.snapshot.points;
    if (points.length === 0) {
      return null;
    }
    return points[points.length - 1];
  }, [tracker.snapshot.points]);

  const refreshMapStatsFromStorage = useCallback(() => {
    setCompletedSegments(completionRepository.getAll());
    setProgress(buildProgressStats());
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!session.isAuthenticated || !session.user) {
      router.replace("/login");
    }
  }, [isHydrated, router, session.isAuthenticated, session.user]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const onFocus = () => refreshMapStatsFromStorage();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshMapStatsFromStorage();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isHydrated, refreshMapStatsFromStorage]);

  if (!isHydrated || !session.isAuthenticated || !session.user) {
    return null;
  }

  const user = session.user;
  const streakData = calculateStreaks(walkRepository.getAll());

  const persistWalk = (draft: DraftWalkSummary, walkId: string) => {
    const walkRecord: WalkRecord = {
      id: walkId,
      userId: user.id,
      title: `Walk in Cambridge · ${new Date(draft.startedAt).toLocaleDateString()}`,
      startedAt: draft.startedAt,
      endedAt: draft.endedAt,
      distanceMeters: draft.distanceMeters,
      durationSeconds: draft.durationSeconds,
      route: draft.route,
      notes: "",
      visibility: "private",
      pointCount: draft.points.length,
      newlyCompletedSegmentIds: draft.newlyCompletedSegmentIds,
      matchDetails: draft.matchDetails,
      createdAt: new Date().toISOString(),
      photoUrls: [],
    };

    walkRepository.save(walkRecord);

    return walkRecord;
  };

  const handleStartWalk = async () => {
    await tracker.startWalk();
  };

  const handleFinishWalk = () => {
    const snapshot = tracker.finishWalk();

    if (snapshot.points.length < 2 || !snapshot.startedAt) {
      return;
    }

    const route = buildLineStringFromPoints(snapshot.points);
    const walkId = createWalkId();

    const completionResult = calculateCompletedSegments({
      userId: user.id,
      walkId,
      walkPoints: snapshot.points,
      streetSegments: CAMBRIDGE_SEGMENTS.features,
      existingCompletedSegments: completedSegments,
    });

    const nextCompletedSegments = completionRepository.saveMany(
      completionResult.updatedCompletedSegments,
    );
    setCompletedSegments(nextCompletedSegments);
    setProgress(buildProgressStats());
    setRecentlyCompletedIds(completionResult.newlyCompletedSegmentIds);

    const saved = persistWalk(
      {
        startedAt: snapshot.startedAt,
        endedAt: new Date().toISOString(),
        durationSeconds: snapshot.elapsedSeconds,
        distanceMeters: snapshot.distanceMeters,
        route,
        points: snapshot.points,
        newlyCompletedSegmentIds: completionResult.newlyCompletedSegmentIds,
        matchDetails: completionResult.matchDetails,
      },
      walkId,
    );

    setProgress(buildProgressStats());
    router.push(`/walk/${saved.id}`);
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#08111d]">
      <div
        className="pointer-events-auto absolute right-3 z-20 sm:right-4"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <ProfileBubble displayName={session.user.displayName} />
      </div>

      <MapView
        completedSegments={completedSegments}
        newlyCompletedSegmentIds={recentlyCompletedIds}
        currentRoute={currentRoute}
        currentPosition={currentPosition}
        isTracking={tracker.isTracking}
      />

      <div className="pointer-events-none absolute inset-0 p-3 sm:p-4">
        <div
          className="flex h-full flex-col justify-between gap-3 sm:pb-4"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="pointer-events-auto">
              <MapControlsCard
                completionPercentage={progress.completionPercentage}
                walksLogged={progress.walksLogged}
              />
            </div>

            <div className="pointer-events-auto">
              <ActiveWalkPanel snapshot={tracker.snapshot} />
            </div>
          </div>

          <div className="pointer-events-auto flex flex-col gap-3 sm:max-w-md">
            {!tracker.isTracking ? (
              <div className="glass-panel rounded-[1.5rem] border p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                  Today at a glance
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/8 bg-white/6 p-3">
                    <Trophy className="h-4 w-4 text-completed" />
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Complete
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {progress.completionPercentage.toFixed(0)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/6 p-3">
                    <Flame className="h-4 w-4 text-orange-300" />
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Streak
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {streakData.currentStreak}d
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/6 p-3">
                    <Sparkles className="h-4 w-4 text-active-route" />
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Walks
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {progress.walksLogged}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <StartWalkButton
                isTracking={tracker.isTracking}
                canFinish={tracker.canFinish}
                onStart={handleStartWalk}
                onFinish={handleFinishWalk}
                onDemoWalk={tracker.startDemoWalk}
                showDemoWalk={process.env.NODE_ENV !== "production"}
                demoOptions={
                  process.env.NODE_ENV !== "production"
                    ? [
                        {
                          label: DEMO_WALKS[1]?.title ?? "Demo 2",
                          onClick: () =>
                            tracker.startDemoWalkFromDefinition(DEMO_WALKS[1]!),
                        },
                        {
                          label: DEMO_WALKS[2]?.title ?? "Demo 3",
                          onClick: () =>
                            tracker.startDemoWalkFromDefinition(DEMO_WALKS[2]!),
                        },
                        {
                          label: "Random route",
                          onClick: () =>
                            tracker.startDemoWalkFromDefinition(
                              generateProceduralDemoWalk(Date.now()),
                            ),
                        },
                      ]
                    : undefined
                }
              />
              <p className="max-w-md text-xs leading-relaxed text-white/50">
                {GPS_HINT_SHORT}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AppBottomTabs activePath="/map" position="absolute" />
    </main>
  );
}

// Made with Bob
