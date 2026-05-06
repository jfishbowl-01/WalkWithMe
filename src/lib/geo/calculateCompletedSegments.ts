import { buffer, featureCollection, lineIntersect, lineString, length } from "@turf/turf";
import type { CompletedSegmentRecord, CompletionCalculationResult } from "@/types/segments";
import type { StreetSegmentFeature, WalkPoint } from "@/types/geo";

interface CompletionCalculationOptions {
  userId: string;
  walkId: string;
  walkPoints: WalkPoint[];
  streetSegments: StreetSegmentFeature[];
  existingCompletedSegments: CompletedSegmentRecord[];
  completionThreshold?: number;
  bufferMeters?: number;
}

/**
 * Local-first mock completion calculation.
 *
 * This intentionally mirrors the future server-side PostGIS flow:
 * - build a LineString from GPS points
 * - buffer the route
 * - inspect each walkable segment for overlap/proximity
 * - derive a completion ratio
 *
 * For the mocked browser implementation we use Turf heuristics rather than
 * production-grade map matching. The interface is kept compatible so this can
 * later move to Supabase/PostGIS with minimal UI changes.
 *
 * POST-MVP TODO: Replace with true map matching
 *
 * Options:
 * 1. Mapbox Matching API (fastest to integrate)
 * 2. OSRM Match Service (open source)
 * 3. PostGIS + pgRouting (best long-term)
 *
 * Current proximity-based algorithm is sufficient for MVP validation.
 */
export function calculateCompletedSegments({
  walkId,
  walkPoints,
  streetSegments,
  existingCompletedSegments,
  completionThreshold = 0.75,
  bufferMeters = 25,
}: CompletionCalculationOptions): CompletionCalculationResult {
  if (walkPoints.length < 2) {
    return {
      newlyCompletedSegmentIds: [],
      updatedCompletedSegments: existingCompletedSegments,
      matchDetails: [],
    };
  }

  const routeFeature = lineString(
    walkPoints.map((point) => [point.longitude, point.latitude]),
  );

  const routeBuffer = buffer(routeFeature, bufferMeters, { units: "meters" });
  const existingMap = new Map(
    existingCompletedSegments.map((item) => [item.streetSegmentId, item]),
  );

  const newlyCompletedSegmentIds: string[] = [];
  const matchDetails = streetSegments.map((segment) => {
    const segmentLine = lineString(segment.geometry.coordinates);
    const segmentLengthMeters = length(segmentLine, { units: "kilometers" }) * 1000;
    const intersects = lineIntersect(segmentLine, routeFeature);
    const bufferedOverlap = featureCollection([segmentLine]);

    const isInsideBuffer = routeBuffer
      ? lineIntersect(segmentLine, routeBuffer as never).features.length > 0
      : false;

    const intersectionBonus = Math.min(intersects.features.length * 0.18, 0.54);
    const proximityBonus = isInsideBuffer ? 0.32 : 0;
    const pointCoverage =
      walkPoints.filter((point) =>
        segment.geometry.coordinates.some(([lng, lat]) => {
          const longitudeDelta = Math.abs(point.longitude - lng);
          const latitudeDelta = Math.abs(point.latitude - lat);
          return longitudeDelta < 0.00045 && latitudeDelta < 0.00045;
        }),
      ).length / Math.max(walkPoints.length, 1);

    const routeCoverage = Math.min(pointCoverage * 1.2 + proximityBonus + intersectionBonus, 1);
    const matchedLengthMeters = segmentLengthMeters * routeCoverage;
    const completionRatio = matchedLengthMeters / Math.max(segmentLengthMeters, 1);
    const countedAsCompleted = completionRatio >= completionThreshold;

    void bufferedOverlap;

    if (countedAsCompleted && !existingMap.has(segment.properties.id)) {
      newlyCompletedSegmentIds.push(segment.properties.id);
      existingMap.set(segment.properties.id, {
        streetSegmentId: segment.properties.id,
        firstCompletedWalkId: walkId,
        completedAt: new Date().toISOString(),
        completionRatio,
      });
    }

    return {
      streetSegmentId: segment.properties.id,
      matchedLengthMeters,
      segmentLengthMeters,
      completionRatio,
      countedAsCompleted,
    };
  });

  return {
    newlyCompletedSegmentIds,
    updatedCompletedSegments: Array.from(existingMap.values()),
    matchDetails,
  };
}

// Made with Bob
