import type { WalkLineString, WalkPoint } from "@/types/geo";

export function buildLineStringFromPoints(points: WalkPoint[]): WalkLineString {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: points.map((point) => [point.longitude, point.latitude]),
    },
    properties: {
      pointCount: points.length,
    },
  };
}

// Made with Bob
