import type {
  RouteVisibility,
  WalkLineString,
  WalkPoint,
} from "@/types/geo";

export interface WalkSegmentMatch {
  streetSegmentId: string;
  matchedLengthMeters: number;
  segmentLengthMeters: number;
  completionRatio: number;
  countedAsCompleted: boolean;
}

export interface WalkRecord {
  id: string;
  userId: string;
  title: string;
  startedAt: string;
  endedAt: string;
  distanceMeters: number;
  durationSeconds: number;
  route: WalkLineString;
  notes: string;
  visibility: RouteVisibility;
  pointCount: number;
  newlyCompletedSegmentIds: string[];
  matchDetails: WalkSegmentMatch[];
  createdAt: string;
  photoUrls: string[]; // Base64 data URLs for local-first MVP
}

export interface DraftWalkSummary {
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  distanceMeters: number;
  route: WalkLineString;
  points: WalkPoint[];
  newlyCompletedSegmentIds: string[];
  matchDetails: WalkSegmentMatch[];
}

export interface ActiveWalkSnapshot {
  status: "idle" | "requesting" | "tracking" | "error";
  startedAt: string | null;
  elapsedSeconds: number;
  distanceMeters: number;
  points: WalkPoint[];
  errorMessage?: string;
}

export interface DemoWalkDefinition {
  id: string;
  title: string;
  pointIntervalMs: number;
  points: WalkPoint[];
}

// Made with Bob
