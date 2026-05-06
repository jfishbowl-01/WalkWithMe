import { along, distance, length, lineString, point } from "@turf/turf";
import type { Position } from "geojson";
import { CAMBRIDGE_SEGMENTS } from "@/lib/mock-data/cambridge-segments";
import type { StreetSegmentFeature } from "@/types/geo";
import type { WalkPoint } from "@/types/geo";

const JOIN_TOLERANCE_M = 28;
/** If consecutive path vertices are farther apart than this, the chain is invalid (no long chords). */
const MAX_LEG_M = 55;

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
      // Do not add a disjoint segment — that would draw a straight chord across the map.
      break;
    }
  }

  return path;
}

/** Insert points every `stepMeters` along each leg so low-vertex mock polylines still bend like streets. */
export function densifyPathCoordinates(
  coordinates: [number, number][],
  stepMeters: number,
): [number, number][] {
  if (coordinates.length < 2) {
    return coordinates;
  }

  const out: [number, number][] = [];

  for (let i = 0; i < coordinates.length - 1; i++) {
    const seg = lineString([coordinates[i], coordinates[i + 1]]);
    const segKm = length(seg, { units: "kilometers" });
    const segM = segKm * 1000;
    if (segM < 0.01) {
      continue;
    }
    for (let dM = 0; dM < segM; dM += stepMeters) {
      const p = along(seg, Math.min(dM / 1000, segKm), { units: "kilometers" });
      out.push(p.geometry.coordinates as [number, number]);
    }
  }

  out.push(coordinates[coordinates.length - 1]);

  return out;
}

function maxLegMeters(coordinates: [number, number][]): number {
  let max = 0;
  for (let i = 1; i < coordinates.length; i++) {
    max = Math.max(
      max,
      distance(point(coordinates[i - 1]), point(coordinates[i]), {
        units: "meters",
      }),
    );
  }
  return max;
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

const FALLBACK_CHAIN = ["mass-ave-central-1", "mass-ave-mit-1"] as const;

export function buildWalkPointsFromSegmentChain(
  segmentIds: string[],
  options: { stepMeters: number; baseTimestampMs: number },
): WalkPoint[] {
  let path = chainSegmentCoordinates(segmentIds);

  if (path.length < 2 || maxLegMeters(path) > MAX_LEG_M) {
    path = chainSegmentCoordinates([...FALLBACK_CHAIN]);
  }

  path = densifyPathCoordinates(path, 6);

  const raw = samplePointsAlongPath(path, options.stepMeters);
  return raw.map((p, sequenceIndex) => ({
    ...p,
    sequenceIndex,
    timestamp: new Date(options.baseTimestampMs + sequenceIndex).toISOString(),
  }));
}
