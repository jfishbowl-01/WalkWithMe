import type { LocalSession, LocalSessionUser } from "@/types/auth";
import type { CompletedSegmentRecord } from "@/types/segments";
import type {
  AchievementPlaceholder,
  AppModeStatus,
  PrivacySettings,
  ProgressStats,
} from "@/types/progress";
import type { WalkRecord } from "@/types/walk";
import {
  defaultLocalState,
  readLocalAppState,
  resetLocalAppState,
  updateLocalAppState,
} from "@/lib/storage/local-store";
import { CAMBRIDGE_SEGMENTS } from "@/lib/mock-data/cambridge-segments";

const MOCK_USER: LocalSessionUser = {
  id: "local-demo-user",
  displayName: "Cambridge Walker",
  email: "walker@local.walkwithme",
};

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function withAchievements(
  completedSegments: CompletedSegmentRecord[],
  walks: WalkRecord[],
  achievements: AchievementPlaceholder[],
) {
  return achievements.map((achievement) => {
    if (achievement.id === "first-walk") {
      return { ...achievement, unlocked: walks.length > 0 };
    }

    if (achievement.id === "five-segments") {
      return { ...achievement, unlocked: completedSegments.length >= 5 };
    }

    return achievement;
  });
}

export const sessionRepository = {
  getSession(): LocalSession {
    return readLocalAppState().session;
  },

  signIn() {
    return updateLocalAppState((state) => ({
      ...state,
      session: {
        isAuthenticated: true,
        user: MOCK_USER,
        signedInAt: new Date().toISOString(),
      },
    })).session;
  },

  signOut() {
    return updateLocalAppState((state) => ({
      ...state,
      session: defaultLocalState.session,
    })).session;
  },
};

export const walkRepository = {
  getAll(): WalkRecord[] {
    return [...readLocalAppState().walks].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
  },

  getById(id: string) {
    return readLocalAppState().walks.find((walk) => walk.id === id) ?? null;
  },

  save(walk: WalkRecord) {
    return updateLocalAppState((state) => {
      const walks = [walk, ...state.walks.filter((item) => item.id !== walk.id)];

      return {
        ...state,
        walks,
        achievements: withAchievements(
          state.completedSegments,
          walks,
          state.achievements,
        ),
      };
    }).walks[0];
  },

  update(id: string, updates: Partial<WalkRecord>) {
    return updateLocalAppState((state) => {
      const walks = state.walks.map((walk) =>
        walk.id === id ? { ...walk, ...updates } : walk,
      );

      return {
        ...state,
        walks,
      };
    }).walks.find((walk) => walk.id === id) ?? null;
  },
};

export const completionRepository = {
  getAll(): CompletedSegmentRecord[] {
    return readLocalAppState().completedSegments;
  },

  saveMany(records: CompletedSegmentRecord[]) {
    return updateLocalAppState((state) => {
      const nextMap = new Map(
        state.completedSegments.map((item) => [item.streetSegmentId, item]),
      );

      for (const record of records) {
        nextMap.set(record.streetSegmentId, record);
      }

      const completedSegments = Array.from(nextMap.values());

      return {
        ...state,
        completedSegments,
        achievements: withAchievements(
          completedSegments,
          state.walks,
          state.achievements,
        ),
      };
    }).completedSegments;
  },
};

export const privacyRepository = {
  get(): PrivacySettings {
    return readLocalAppState().privacy;
  },

  save(privacy: PrivacySettings) {
    return updateLocalAppState((state) => ({
      ...state,
      privacy,
    })).privacy;
  },
};

export const achievementsRepository = {
  getAll(): AchievementPlaceholder[] {
    return readLocalAppState().achievements;
  },
};

export const prototypeRepository = {
  resetAll() {
    resetLocalAppState();
  },

  getModeStatus(): AppModeStatus {
    const supabaseConfigured =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    return {
      persistence: "local",
      auth: "mock",
      supabaseConfigured,
    };
  },
};

export function buildProgressStats(): ProgressStats {
  const state = readLocalAppState();
  const totalSegments = CAMBRIDGE_SEGMENTS.features.length;
  const completedSegments = state.completedSegments.length;
  const completedDistanceMeters = sum(
    CAMBRIDGE_SEGMENTS.features
      .filter((segment) =>
        state.completedSegments.some(
          (completed) => completed.streetSegmentId === segment.properties.id,
        ),
      )
      .map((segment) => segment.properties.lengthMeters),
  );

  const totalWalkDistanceMeters = sum(
    state.walks.map((walk) => walk.distanceMeters),
  );

  const recentlyCompleted = state.completedSegments.filter((segment) => {
    const completedAt = new Date(segment.completedAt).getTime();
    return Date.now() - completedAt <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return {
    completionPercentage:
      totalSegments === 0 ? 0 : (completedSegments / totalSegments) * 100,
    completedSegments,
    totalSegments,
    completedDistanceMeters,
    totalWalkDistanceMeters,
    walksLogged: state.walks.length,
    newlyCompletedThisWeek: recentlyCompleted,
  };
}

// Made with Bob
