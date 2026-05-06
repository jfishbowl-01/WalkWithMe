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

/** Readable durations for short walks (avoids “0m” for sub-minute activity). */
export function formatDurationHuman(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) {
    return `${s}s`;
  }
  const m = Math.floor(s / 60);
  const rem = s % 60;
  const h = Math.floor(m / 60);
  if (h > 0) {
    const mm = m % 60;
    return `${h}h ${mm}m`;
  }
  if (rem === 0) {
    return `${m}m`;
  }
  return `${m}m ${rem}s`;
}

/** Clock style for live timers: `m:ss` under one hour. */
export function formatDurationClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  const h = Math.floor(m / 60);
  if (h > 0) {
    return `${h}:${String(m % 60).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  }
  return `${m}:${String(rem).padStart(2, "0")}`;
}

// Made with Bob
