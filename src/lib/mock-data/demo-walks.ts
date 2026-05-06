import type { DemoWalkDefinition } from "@/types/walk";
import { buildWalkPointsFromSegmentChain } from "@/lib/mock-data/buildDemoWalkAlongSegments";

const baseTimestamp = new Date("2026-05-01T14:00:00.000Z").getTime();

/** Street-following demos built from real polylines in `cambridge-segments.ts`. */
export const DEMO_WALKS: DemoWalkDefinition[] = [
  {
    id: "mass-ave-central-mit",
    title: "Mass Ave (Central → MIT)",
    pointIntervalMs: 2600,
    points: buildWalkPointsFromSegmentChain(["mass-ave-central-1", "mass-ave-mit-1"], {
      stepMeters: 14,
      baseTimestampMs: baseTimestamp,
    }),
  },
  {
    id: "mass-ave-harvard",
    title: "Mass Ave (Harvard area)",
    pointIntervalMs: 2600,
    points: buildWalkPointsFromSegmentChain(["mass-ave-harvard-1"], {
      stepMeters: 14,
      baseTimestampMs: baseTimestamp + 1,
    }),
  },
  {
    id: "fresh-pond-garden",
    title: "Fresh Pond → Garden St",
    pointIntervalMs: 2600,
    points: buildWalkPointsFromSegmentChain(["fresh-pond-path-1", "garden-st-1"], {
      stepMeters: 14,
      baseTimestampMs: baseTimestamp + 2,
    }),
  },
];
