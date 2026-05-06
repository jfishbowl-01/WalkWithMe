export type DistanceUnit = "metric" | "imperial";

export function formatMeters(
  distanceMeters: number,
  units: DistanceUnit = "metric",
) {
  if (units === "imperial") {
    const miles = distanceMeters / 1609.34;
    if (miles >= 0.1) {
      return `${miles.toFixed(2)} mi`;
    }

    const feet = distanceMeters * 3.28084;
    return `${Math.round(feet)} ft`;
  }

  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(2)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

export function formatDurationMinutes(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

// Made with Bob
