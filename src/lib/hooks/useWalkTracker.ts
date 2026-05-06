"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateDistance } from "@/lib/geo/calculateDistance";
import type { WalkPoint } from "@/types/geo";
import type { ActiveWalkSnapshot, DemoWalkDefinition } from "@/types/walk";

interface UseWalkTrackerOptions {
  demoWalk?: DemoWalkDefinition;
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
          const point = toCoordinatePoint(position.coords, current.points.length);
          const points = [...current.points, point];

          return {
            ...current,
            status: "tracking",
            points,
            distanceMeters: calculateDistance(points),
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
        maximumAge: 3000,
        timeout: 10000,
      },
    );

    return true;
  }, [startTimer, stop]);

  const startDemoWalk = useCallback(() => {
    const demoWalk = options?.demoWalk;

    if (!demoWalk) {
      return false;
    }

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
    return true;
  }, [options?.demoWalk, pushPoint, startTimer, stop]);

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
      finishWalk,
      stop,
    }),
    [canFinish, finishWalk, isTracking, snapshot, startDemoWalk, startWalk, stop],
  );
}

// Made with Bob
