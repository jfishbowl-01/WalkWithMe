import type { StreetSegmentCollection } from "@/types/geo";
import type { CompletedSegmentRecord, SegmentCollectionWithStatus } from "@/types/segments";

export function buildSegmentCollectionWithStatus(
  segments: StreetSegmentCollection,
  completedSegments: CompletedSegmentRecord[],
  newlyCompletedSegmentIds: string[] = [],
): SegmentCollectionWithStatus {
  const completedIds = new Set(
    completedSegments.map((segment) => segment.streetSegmentId),
  );
  const newlyCompletedIds = new Set(newlyCompletedSegmentIds);

  return {
    ...segments,
    features: segments.features.map((feature) => {
      const isNewlyCompleted = newlyCompletedIds.has(feature.properties.id);
      const isCompleted =
        isNewlyCompleted || completedIds.has(feature.properties.id);

      return {
        ...feature,
        properties: {
          ...feature.properties,
          status: isNewlyCompleted
            ? "newly-completed"
            : isCompleted
              ? "completed"
              : "uncompleted",
        },
      };
    }),
  };
}

// Made with Bob
