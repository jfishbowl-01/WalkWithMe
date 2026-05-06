"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  calculateDistance,
  calculateDistanceBetweenPoints,
} from "@/lib/geo/calculateDistance";
import type { WalkPoint } from "@/types/geo";
import type { ActiveWalkSnapshot, DemoWalkDefinition } from "@/types/walk";

/** Reject fixes worse than this after we already have a point (meters). */
const MAX_ACCEPTABLE_ACCURACY_M = 85;
/** Implied speed above this is treated as a GPS jump (m/s). ~6 m/s ≈ 13.4 mph. */
const MAX_IMPLIED_SPEED_MPS = 5.5;
/** Ignore nearly-duplicate readings (noise while stationary). */
const MIN_POINT_INTERVAL_S = 0.45;
const MIN_POINT_DISPLACEMENT_M = 2.5;

interface UseWalkTrackerOptions {
  demoWalk?: DemoWalkDefinition;
}

function mergeNextPoint(points: WalkPoint[], candidate: WalkPoint): WalkPoint[] | null {
  if (points.length === 0) {
    return [candidate];
  }

  const last = points[points.length - 1];
  const dt =
    (Date.parse(candidate.timestamp) - Date.parse(last.timestamp)) / 1000;
  if (dt <= 0) {
    return null;
  }

  if (
    candidate.accuracyMeters != null &&
    candidate.accuracyMeters > MAX_ACCEPTABLE_ACCURACY_M &&
    points.length >= 1
  ) {
    return null;
  }

  const dist = calculateDistanceBetweenPoints(last, candidate);
  const impliedSpeed = dist / Math.max(dt, 0.25);

  if (impliedSpeed > MAX_IMPLIED_SPEED_MPS) {
    const lastAcc = last.accuracyMeters;
    const newAcc = candidate.accuracyMeters;
    if (
      lastAcc != null &&
      newAcc != null &&
      newAcc < lastAcc * 0.85 &&
      newAcc <= 40
    ) {
      return [...points.slice(0, -1), candidate];
    }
    return null;
  }

  if (dt < MIN_POINT_INTERVAL_S && dist < MIN_POINT_DISPLACEMENT_M) {
    return null;
  }

  return [...points, candidate];
}

function createPoint(
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    altitude?: number | null;
    heading?: number | null;
    speed?: number | null;
  },
  sequenceIndex: number,
): WalkPoint {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    timestamp: new Date().toISOString(),
    accuracyMeters: coords.accuracy ?? undefined,
    altitudeMeters: coords.altitude ?? null,
    headingDegrees: coords.heading ?? null,
    speedMetersPerSecond: coords.speed ?? null,
    sequenceIndex,
  };
}

function toCoordinatePoint(position: GeolocationPosition["coords"], sequenceIndex: number) {
  return createPoint(
    {
      latitude: position.latitude,
      longitude: position.longitude,
      accuracy: position.accuracy,
      altitude: position.altitude,
      heading: position.heading,
      speed: position.speed,
    },
    sequenceIndex,
  );
}

export function useWalkTracker(options?: UseWalkTrackerOptions) {
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const demoTimeoutRef = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState<ActiveWalkSnapshot>({
    status: "idle",
    startedAt: null,
    elapsedSeconds: 0,
    distanceMeters: 0,
    points: [],
  });

  const stop = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (demoTimeoutRef.current !== null) {
      window.clearTimeout(demoTimeoutRef.current);
      demoTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const recalculateElapsed = useCallback((startedAt: string) => {
    const started = new Date(startedAt).getTime();
    return Math.max(0, Math.round((Date.now() - started) / 1000));
  }, []);

  const pushPoint = useCallback((point: WalkPoint) => {
    setSnapshot((current) => {
      const points = [...current.points, point];

      return {
        ...current,
        status: "tracking",
        points,
        distanceMeters: calculateDistance(points),
      };
    });
  }, []);

  const startTimer = useCallback((startedAt: string) => {
    timerRef.current = window.setInterval(() => {
      setSnapshot((current) => ({
        ...current,
        elapsedSeconds: recalculateElapsed(startedAt),
      }));
    }, 1000);
  }, [recalculateElapsed]);

  const startWalk = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setSnapshot({
        status: "error",
        startedAt: null,
        elapsedSeconds: 0,
        distanceMeters: 0,
        points: [],
        errorMessage: "Geolocation is not available in this browser.",
      });
      return false;
    }

    stop();
    const startedAt = new Date().toISOString();

    setSnapshot({
      status: "requesting",
      startedAt,
      elapsedSeconds: 0,
      distanceMeters: 0,
      points: [],
    });

    startTimer(startedAt);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setSnapshot((current) => {
          const nextIndex = current.points.length;
          const candidate = toCoordinatePoint(position.coords, nextIndex);
          const merged = mergeNextPoint(current.points, candidate);

          if (merged === null) {
            return current.status === "requesting"
              ? { ...current, status: "tracking" as const }
              : current;
          }

          return {
            ...current,
            status: "tracking",
            points: merged,
            distanceMeters: calculateDistance(merged),
            errorMessage: undefined,
          };
        });
      },
      (error) => {
        stop();
        setSnapshot((current) => ({
          ...current,
          status: "error",
          errorMessage: error.message,
        }));
      },
      {
        enableHighAccuracy: true,
        // Stale cached positions often cause a big first jump when the real fix arrives.
        maximumAge: 0,
        timeout: 15000,
      },
    );

    return true;
  }, [startTimer, stop]);

  const runAnimatedDemo = useCallback(
    (demoWalk: DemoWalkDefinition) => {
      stop();
      const startedAt = new Date().toISOString();

      setSnapshot({
        status: "tracking",
        startedAt,
        elapsedSeconds: 0,
        distanceMeters: 0,
        points: [],
      });

      startTimer(startedAt);

      let index = 0;

      const scheduleNext = () => {
        if (index >= demoWalk.points.length) {
          return;
        }

        const nextPoint = {
          ...demoWalk.points[index],
          timestamp: new Date().toISOString(),
          sequenceIndex: index,
        };

        pushPoint(nextPoint);
        index += 1;

        if (index < demoWalk.points.length) {
          demoTimeoutRef.current = window.setTimeout(
            scheduleNext,
            demoWalk.pointIntervalMs,
          );
        }
      };

      scheduleNext();
    },
    [pushPoint, startTimer, stop],
  );

  const startDemoWalk = useCallback(() => {
    const demoWalk = options?.demoWalk;
    if (!demoWalk || demoWalk.points.length < 2) {
      return false;
    }
    runAnimatedDemo(demoWalk);
    return true;
  }, [options?.demoWalk, runAnimatedDemo]);

  const startDemoWalkFromDefinition = useCallback(
    (demoWalk: DemoWalkDefinition) => {
      if (!demoWalk.points.length || demoWalk.points.length < 2) {
        return false;
      }
      runAnimatedDemo(demoWalk);
      return true;
    },
    [runAnimatedDemo],
  );

  const finishWalk = useCallback(() => {
    stop();

    return {
      ...snapshot,
      elapsedSeconds:
        snapshot.startedAt === null
          ? snapshot.elapsedSeconds
          : recalculateElapsed(snapshot.startedAt),
    };
  }, [recalculateElapsed, snapshot, stop]);

  const canFinish = snapshot.points.length >= 2;
  const isTracking = snapshot.status === "tracking" || snapshot.status === "requesting";

  return useMemo(
    () => ({
      snapshot,
      isTracking,
      canFinish,
      startWalk,
      startDemoWalk,
      startDemoWalkFromDefinition,
      finishWalk,
      stop,
    }),
    [
      canFinish,
      finishWalk,
      isTracking,
      snapshot,
      startDemoWalk,
      startDemoWalkFromDefinition,
      startWalk,
      stop,
    ],
  );
}

// Made with Bob
