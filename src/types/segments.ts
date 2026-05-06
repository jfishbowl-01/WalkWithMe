import type {
  SegmentStatus,
  StreetSegmentCollection,
  StreetSegmentFeature,
} from "@/types/geo";

export interface CompletedSegmentRecord {
  streetSegmentId: string;
  firstCompletedWalkId: string;
  completedAt: string;
  completionRatio: number;
}

export interface SegmentWithStatus extends StreetSegmentFeature {
  properties: StreetSegmentFeature["properties"] & {
    status: SegmentStatus;
  };
}

export interface SegmentCollectionWithStatus extends Omit<StreetSegmentCollection, "features"> {
  features: SegmentWithStatus[];
}

export interface CompletionCalculationResult {
  newlyCompletedSegmentIds: string[];
  updatedCompletedSegments: CompletedSegmentRecord[];
  matchDetails: {
    streetSegmentId: string;
    matchedLengthMeters: number;
    segmentLengthMeters: number;
    completionRatio: number;
    countedAsCompleted: boolean;
  }[];
}

// Made with Bob
