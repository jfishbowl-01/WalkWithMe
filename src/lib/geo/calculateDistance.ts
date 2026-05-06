import type { WalkPoint } from "@/types/geo";

const EARTH_RADIUS_METERS = 6371000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceBetweenPoints(
  start: Pick<WalkPoint, "latitude" | "longitude">,
  end: Pick<WalkPoint, "latitude" | "longitude">,
) {
  const lat1 = toRadians(start.latitude);
  const lat2 = toRadians(end.latitude);
  const deltaLat = toRadians(end.latitude - start.latitude);
  const deltaLng = toRadians(end.longitude - start.longitude);

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_METERS * angularDistance;
}

export function calculateDistance(points: WalkPoint[]) {
  if (points.length < 2) {
    return 0;
  }

  let total = 0;

  for (let index = 1; index < points.length; index += 1) {
    total += calculateDistanceBetweenPoints(points[index - 1], points[index]);
  }

  return total;
}

// Made with Bob
