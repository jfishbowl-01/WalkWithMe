import type { LocalSession } from "@/types/auth";
import type { CompletedSegmentRecord } from "@/types/segments";
import type {
  AchievementPlaceholder,
  PrivacySettings,
  VersionedAppState,
} from "@/types/progress";
import type { WalkRecord } from "@/types/walk";

export const LOCAL_APP_STATE_VERSION = 1;

export const STORAGE_KEYS = {
  appState: "walkwithme.app-state",
} as const;

export interface LocalAppState extends VersionedAppState {
  session: LocalSession;
  walks: WalkRecord[];
  completedSegments: CompletedSegmentRecord[];
  privacy: PrivacySettings;
  achievements: AchievementPlaceholder[];
}

export const defaultLocalState: LocalAppState = {
  version: LOCAL_APP_STATE_VERSION,
  updatedAt: new Date(0).toISOString(),
  session: {
    isAuthenticated: false,
    user: null,
    signedInAt: null,
  },
  walks: [],
  completedSegments: [],
  privacy: {
    homePrivacyCenter: null,
    homePrivacyRadiusMeters: 200,
    routeVisibility: "private",
  },
  achievements: [
    {
      id: "first-walk",
      title: "First Walk Logged",
      description: "Save your first Cambridge walk to unlock this badge.",
      unlocked: false,
    },
    {
      id: "five-segments",
      title: "Five Streets Lit",
      description: "Complete five street or path segments.",
      unlocked: false,
    },
    {
      id: "charles-scout",
      title: "Charles Scout",
      description: "Future achievement placeholder for river-adjacent exploration.",
      unlocked: false,
    },
  ],
};

const canUseStorage = () => typeof window !== "undefined";

export function readLocalAppState(): LocalAppState {
  if (!canUseStorage()) {
    return defaultLocalState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.appState);

    if (!raw) {
      return defaultLocalState;
    }

    const parsed = JSON.parse(raw) as Partial<LocalAppState>;

    if (parsed.version !== LOCAL_APP_STATE_VERSION) {
      window.localStorage.removeItem(STORAGE_KEYS.appState);
      return defaultLocalState;
    }

    // Migrate walks to ensure photoUrls field exists
    const migratedWalks = (parsed.walks ?? []).map((walk) => ({
      ...walk,
      photoUrls: walk.photoUrls ?? [],
    }));

    return {
      ...defaultLocalState,
      ...parsed,
      session: {
        ...defaultLocalState.session,
        ...parsed.session,
      },
      privacy: {
        ...defaultLocalState.privacy,
        ...parsed.privacy,
      },
      achievements: parsed.achievements ?? defaultLocalState.achievements,
      walks: migratedWalks,
      completedSegments: parsed.completedSegments ?? [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.appState);
    return defaultLocalState;
  }
}

export function writeLocalAppState(state: LocalAppState) {
  if (!canUseStorage()) {
    return;
  }

  const nextState: LocalAppState = {
    ...state,
    version: LOCAL_APP_STATE_VERSION,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(nextState));
}

export function updateLocalAppState(
  updater: (currentState: LocalAppState) => LocalAppState,
) {
  const current = readLocalAppState();
  const next = updater(current);
  writeLocalAppState(next);
  return next;
}

export function resetLocalAppState() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.appState);
}

// Made with Bob
