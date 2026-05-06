import type { DemoWalkDefinition } from "@/types/walk";

const baseTimestamp = new Date("2026-05-01T14:00:00.000Z").getTime();

export const DEMO_WALKS: DemoWalkDefinition[] = [
  {
    id: "central-square-demo",
    title: "Central Square Demo Loop",
    pointIntervalMs: 900,
    points: [
      {
        latitude: 42.3656,
        longitude: -71.1036,
        timestamp: new Date(baseTimestamp + 0).toISOString(),
        accuracyMeters: 6,
        sequenceIndex: 0,
      },
      {
        latitude: 42.3658,
        longitude: -71.1026,
        timestamp: new Date(baseTimestamp + 900).toISOString(),
        accuracyMeters: 6,
        sequenceIndex: 1,
      },
      {
        latitude: 42.366,
        longitude: -71.1015,
        timestamp: new Date(baseTimestamp + 1800).toISOString(),
        accuracyMeters: 5,
        sequenceIndex: 2,
      },
      {
        latitude: 42.3663,
        longitude: -71.1001,
        timestamp: new Date(baseTimestamp + 2700).toISOString(),
        accuracyMeters: 5,
        sequenceIndex: 3,
      },
      {
        latitude: 42.3666,
        longitude: -71.0987,
        timestamp: new Date(baseTimestamp + 3600).toISOString(),
        accuracyMeters: 5,
        sequenceIndex: 4,
      },
      {
        latitude: 42.367,
        longitude: -71.0971,
        timestamp: new Date(baseTimestamp + 4500).toISOString(),
        accuracyMeters: 5,
        sequenceIndex: 5,
      },
      {
        latitude: 42.3673,
        longitude: -71.0956,
        timestamp: new Date(baseTimestamp + 5400).toISOString(),
        accuracyMeters: 5,
        sequenceIndex: 6,
      },
    ],
  },
];

// Made with Bob
