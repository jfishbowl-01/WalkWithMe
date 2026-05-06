export type LngLatTuple = [number, number];

export type RouteVisibility = "private" | "shared";

export type SegmentStatus = "uncompleted" | "completed" | "newly-completed";

export interface WalkPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracyMeters?: number;
  altitudeMeters?: number | null;
  headingDegrees?: number | null;
  speedMetersPerSecond?: number | null;
  sequenceIndex: number;
}

export interface GeoBounds {
  center: LngLatTuple;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface StreetSegmentFeatureProperties {
  id: string;
  regionId: string;
  osmWayId?: number;
  name: string;
  highwayType: string;
  access?: string;
  foot?: string;
  surface?: string;
  lengthMeters: number;
  isWalkable: boolean;
}

export interface StreetSegmentFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: LngLatTuple[];
  };
  properties: StreetSegmentFeatureProperties;
}

export interface StreetSegmentCollection {
  type: "FeatureCollection";
  features: StreetSegmentFeature[];
}

export interface WalkLineString {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: LngLatTuple[];
  };
  properties: {
    pointCount: number;
  };
}

// Made with Bob
