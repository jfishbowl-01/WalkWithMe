import type { WalkRecord } from "@/types/walk";

export interface PersonalRecords {
  longestWalk: {
    distance: number;
    walkId: string;
    date: string;
  } | null;
  mostSegmentsInOneWalk: {
    count: number;
    walkId: string;
    date: string;
  } | null;
  fastestPace: {
    metersPerMinute: number;
    walkId: string;
    date: string;
  } | null;
  busiestDay: {
    date: string;
    totalDistance: number;
    walkCount: number;
  } | null;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWalkDate: string | null;
  walkDates: string[]; // For calendar heatmap
}

export function calculatePersonalRecords(walks: WalkRecord[]): PersonalRecords {
  if (walks.length === 0) {
    return {
      longestWalk: null,
      mostSegmentsInOneWalk: null,
      fastestPace: null,
      busiestDay: null,
    };
  }

  // Longest walk by distance
  const longestWalk = walks.reduce((max, walk) =>
    walk.distanceMeters > max.distanceMeters ? walk : max
  );

  // Most segments in one walk
  const mostSegments = walks.reduce((max, walk) =>
    walk.newlyCompletedSegmentIds.length > max.newlyCompletedSegmentIds.length
      ? walk
      : max
  );

  // Fastest pace (m/min) - only walks with duration > 0
  const walksWithDuration = walks.filter((w) => w.durationSeconds > 0);
  const fastestPaceWalk =
    walksWithDuration.length > 0
      ? walksWithDuration.reduce((fastest, walk) => {
          const pace = walk.distanceMeters / (walk.durationSeconds / 60);
          const fastestPace =
            fastest.distanceMeters / (fastest.durationSeconds / 60);
          return pace > fastestPace ? walk : fastest;
        })
      : null;

  // Busiest day (most distance in single calendar day)
  const walksByDay = walks.reduce(
    (acc, walk) => {
      const day = new Date(walk.startedAt).toDateString();
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(walk);
      return acc;
    },
    {} as Record<string, WalkRecord[]>
  );

  const busiestDayEntry =
    Object.keys(walksByDay).length > 0
      ? Object.entries(walksByDay)
          .map(([date, dayWalks]) => ({
            date,
            totalDistance: dayWalks.reduce(
              (sum, w) => sum + w.distanceMeters,
              0
            ),
            walkCount: dayWalks.length,
          }))
          .reduce((max, day) =>
            day.totalDistance > max.totalDistance ? day : max
          )
      : null;

  return {
    longestWalk: {
      distance: longestWalk.distanceMeters,
      walkId: longestWalk.id,
      date: longestWalk.startedAt,
    },
    mostSegmentsInOneWalk: {
      count: mostSegments.newlyCompletedSegmentIds.length,
      walkId: mostSegments.id,
      date: mostSegments.startedAt,
    },
    fastestPace: fastestPaceWalk
      ? {
          metersPerMinute:
            fastestPaceWalk.distanceMeters /
            (fastestPaceWalk.durationSeconds / 60),
          walkId: fastestPaceWalk.id,
          date: fastestPaceWalk.startedAt,
        }
      : null,
    busiestDay: busiestDayEntry,
  };
}

export function calculateStreaks(walks: WalkRecord[]): StreakData {
  if (walks.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWalkDate: null,
      walkDates: [],
    };
  }

  // Get unique calendar days with walks
  const walkDatesSet = new Set(
    walks.map((w) => new Date(w.startedAt).toDateString())
  );
  const walkDates = Array.from(walkDatesSet).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (walkDatesSet.has(today) || walkDatesSet.has(yesterday)) {
    let checkDate = walkDatesSet.has(today)
      ? new Date()
      : new Date(Date.now() - 86400000);

    while (walkDatesSet.has(checkDate.toDateString())) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < walkDates.length; i++) {
    const prevDate = new Date(walkDates[i - 1]);
    const currDate = new Date(walkDates[i]);
    const dayDiff = (currDate.getTime() - prevDate.getTime()) / 86400000;

    if (dayDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastWalkDate: walks[0].startedAt,
    walkDates,
  };
}

// Made with Bob
