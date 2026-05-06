"use client";

import { useEffect, useState } from "react";
import type { DistanceUnit } from "@/lib/geo/formatters";

const STORAGE_KEY = "distanceUnits";

function getDefaultUnits(): DistanceUnit {
  if (typeof window === "undefined") {
    return "metric";
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "metric" || saved === "imperial") {
    return saved;
  }

  return navigator.language.startsWith("en-US") ? "imperial" : "metric";
}

export function useUnitPreference() {
  // Match SSR (no storage): sync real preference after mount in useEffect.
  const [units, setUnits] = useState<DistanceUnit>("metric");

  useEffect(() => {
    queueMicrotask(() => {
      setUnits(getDefaultUnits());
    });
  }, []);

  useEffect(() => {
    const handleUnitsChange = (event: Event) => {
      const customEvent = event as CustomEvent<DistanceUnit>;
      if (customEvent.detail === "metric" || customEvent.detail === "imperial") {
        setUnits(customEvent.detail);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === "metric" || event.newValue === "imperial") {
        setUnits(event.newValue);
      }
    };

    window.addEventListener("unitsChange", handleUnitsChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("unitsChange", handleUnitsChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return units;
}
