import { along, distance, length, lineString, point } from "@turf/turf";
import type { Position } from "geojson";
import { CAMBRIDGE_SEGMENTS } from "@/lib/mock-data/cambridge-segments";
import type { StreetSegmentFeature } from "@/types/geo";
import type { WalkPoint } from "@/types/geo";

const JOIN_TOLERANCE_M = 28;

function asLngLatTuple(c: Position): [number, number] {
  return [c[0], c[1]];
}

/**
 * Pick forward or reversed segment coords so the start is nearest to the last chained point.
 */
function orientedSegmentCoords(
  accLast: [number, number] | null,
  raw: Position[],
): [number, number][] {
  const forward = raw.map(asLngLatTuple);
  if (!accLast) {
    return forward;
  }
  const backward = [...forward].reverse();
  const df = distance(point(accLast), point(forward[0]), { units: "meters" });
  const db = distance(point(accLast), point(backward[0]), { units: "meters" });
  return df <= db ? forward : backward;
}

/**
 * Chain segment polylines into one path (for demo routes that follow real sample streets).
 */
export function chainSegmentCoordinates(
  segmentIds: string[],
  features: StreetSegmentFeature[] = CAMBRIDGE_SEGMENTS.features,
): [number, number][] {
  const path: [number, number][] = [];

  for (const id of segmentIds) {
    const feature = features.find((f) => f.properties.id === id);
    if (!feature) {
      throw new Error(`Unknown segment id: ${id}`);
    }
    const raw = feature.geometry.coordinates as Position[];
    const oriented = orientedSegmentCoords(
      path.length > 0 ? path[path.length - 1] : null,
      raw,
    );

    if (path.length === 0) {
      path.push(...oriented);
      continue;
    }

    const last = path[path.length - 1];
    const join = oriented[0];
    const gap = distance(point(last), point(join), { units: "meters" });
    if (gap <= JOIN_TOLERANCE_M) {
      path.push(...oriented.slice(1));
    } else {
      path.push(...oriented);
    }
  }

  return path;
}

/**
 * Sample WalkPoints along a coordinate path at fixed spacing (meters) for smooth street-following demos.
 */
export function samplePointsAlongPath(
  coordinates: [number, number][],
  stepMeters: number,
): Omit<WalkPoint, "timestamp" | "sequenceIndex">[] {
  if (coordinates.length < 2) {
    return [];
  }

  const line = lineString(coordinates);
  const totalKm = length(line, { units: "kilometers" });
  const totalM = totalKm * 1000;

  const samples: Omit<WalkPoint, "timestamp" | "sequenceIndex">[] = [];

  for (let dM = 0; dM <= totalM; dM += stepMeters) {
    const kmAlong = Math.min(dM / 1000, totalKm);
    const p = along(line, kmAlong, { units: "kilometers" });
    const [lng, lat] = p.geometry.coordinates;
    samples.push({
      latitude: lat,
      longitude: lng,
      accuracyMeters: 5,
      altitudeMeters: null,
      headingDegrees: null,
      speedMetersPerSecond: null,
    });
  }

  const lastCoord = coordinates[coordinates.length - 1];
  const lastSample = samples[samples.length - 1];
  if (
    lastSample &&
    (Math.abs(lastSample.longitude - lastCoord[0]) > 1e-6 ||
      Math.abs(lastSample.latitude - lastCoord[1]) > 1e-6)
  ) {
    samples.push({
      latitude: lastCoord[1],
      longitude: lastCoord[0],
      accuracyMeters: 5,
      altitudeMeters: null,
      headingDegrees: null,
      speedMetersPerSecond: null,
    });
  }

  if (samples.length < 2 && totalM > 0) {
    const end = coordinates[coordinates.length - 1];
    samples.push({
      latitude: end[1],
      longitude: end[0],
      accuracyMeters: 5,
      altitudeMeters: null,
      headingDegrees: null,
      speedMetersPerSecond: null,
    });
  }

  return samples;
}

export function buildWalkPointsFromSegmentChain(
  segmentIds: string[],
  options: { stepMeters: number; baseTimestampMs: number },
): WalkPoint[] {
  const path = chainSegmentCoordinates(segmentIds);
  const raw = samplePointsAlongPath(path, options.stepMeters);
  return raw.map((p, sequenceIndex) => ({
    ...p,
    sequenceIndex,
    timestamp: new Date(options.baseTimestampMs + sequenceIndex).toISOString(),
  }));
}
