export interface ProgressStats {
  completionPercentage: number;
  completedSegments: number;
  totalSegments: number;
  completedDistanceMeters: number;
  totalWalkDistanceMeters: number;
  walksLogged: number;
  newlyCompletedThisWeek: number;
}

export interface AchievementPlaceholder {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface PrivacySettings {
  homePrivacyCenter: {
    latitude: number;
    longitude: number;
  } | null;
  homePrivacyRadiusMeters: number;
  routeVisibility: "private" | "shared";
}

export interface AppModeStatus {
  persistence: "local";
  auth: "mock";
  supabaseConfigured: boolean;
}

export interface VersionedAppState {
  version: number;
  updatedAt: string;
}

// Made with Bob
