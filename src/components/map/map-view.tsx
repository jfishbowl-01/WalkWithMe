"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import { buildSegmentCollectionWithStatus } from "@/lib/geo/segment-status";
import { CAMBRIDGE_SEGMENTS } from "@/lib/mock-data/cambridge-segments";
import { CAMBRIDGE_VIEWPORT, getDefaultMapStyle } from "@/lib/map/map-style";
import { MAP_LAYERS, MAP_SOURCES } from "@/lib/map/map-layers";
import type { WalkLineString, WalkPoint } from "@/types/geo";
import type { CompletedSegmentRecord } from "@/types/segments";

// Extend MapLibreMap type to include our custom pulse interval property
interface MapWithPulse extends MapLibreMap {
  userLocationPulseInterval?: NodeJS.Timeout;
}

interface MapViewProps {
  completedSegments: CompletedSegmentRecord[];
  newlyCompletedSegmentIds?: string[];
  currentRoute: WalkLineString | null;
  currentPosition?: WalkPoint | null;
  isTracking?: boolean;
}

export function MapView({
  completedSegments,
  newlyCompletedSegmentIds = [],
  currentRoute,
  currentPosition = null,
  isTracking = false,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const segmentData = useMemo(
    () =>
      buildSegmentCollectionWithStatus(
        CAMBRIDGE_SEGMENTS,
        completedSegments,
        newlyCompletedSegmentIds,
      ),
    [completedSegments, newlyCompletedSegmentIds],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    // Get saved map style preference
    const savedStyle =
      (typeof window !== "undefined"
        ? (localStorage.getItem("mapStylePreset") as import("@/lib/map/map-style").MapStylePreset)
        : null) || "dataviz-dark";

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getDefaultMapStyle(savedStyle),
      center: CAMBRIDGE_VIEWPORT.center,
      zoom: CAMBRIDGE_VIEWPORT.zoom,
      pitch: CAMBRIDGE_VIEWPORT.pitch ?? 0,
      bearing: CAMBRIDGE_VIEWPORT.bearing ?? 0,
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    // Helper function to add all map layers
    const addMapLayers = () => {
      if (!map.isStyleLoaded()) return;

      // Add street segments source and layers
      if (!map.getSource(MAP_SOURCES.streetSegments)) {
        map.addSource(MAP_SOURCES.streetSegments, {
          type: "geojson",
          data: segmentData,
        });

        // Uncompleted segments: Hidden by default for cleaner Apple Maps-like aesthetic
        // Uncomment to show subtle gray lines for all available streets
        map.addLayer({
          id: MAP_LAYERS.uncompletedSegments,
          type: "line",
          source: MAP_SOURCES.streetSegments,
          filter: ["==", ["get", "status"], "uncompleted"],
          paint: {
            "line-color": "#a8b4c4",
            "line-width": 1,
            "line-opacity": 0, // Hidden by default - set to 0.12 to show subtly
          },
        });

        map.addLayer({
          id: MAP_LAYERS.completedSegments,
          type: "line",
          source: MAP_SOURCES.streetSegments,
          filter: ["==", ["get", "status"], "completed"],
          paint: {
            "line-color": "#6f7cff",
            "line-width": 5,
            "line-opacity": 0.95,
            "line-blur": 0.2, // Subtle glow for premium feel
          },
        });

        map.addLayer({
          id: MAP_LAYERS.newlyCompletedSegments,
          type: "line",
          source: MAP_SOURCES.streetSegments,
          filter: ["==", ["get", "status"], "newly-completed"],
          paint: {
            "line-color": "#ae88ff",
            "line-width": 6,
            "line-opacity": 1,
            "line-blur": 0.3,
          },
        });
      }

      // Add current walk route if exists
      if (currentRoute && currentRoute.geometry.coordinates.length >= 2) {
        if (!map.getSource(MAP_SOURCES.currentWalk)) {
          map.addSource(MAP_SOURCES.currentWalk, {
            type: "geojson",
            data: currentRoute,
          });

          map.addLayer({
            id: MAP_LAYERS.currentWalkRoute,
            type: "line",
            source: MAP_SOURCES.currentWalk,
            paint: {
              "line-color": "#ff8a5b",
              "line-width": 5,
              "line-opacity": 0.96,
            },
          });
        }
      }

      // Re-add user location marker if exists
      if (currentPosition) {
        const positionFeature = {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [currentPosition.longitude, currentPosition.latitude],
          },
          properties: {
            timestamp: Date.now(),
          },
        };

        if (!map.getSource(MAP_SOURCES.userLocation)) {
          map.addSource(MAP_SOURCES.userLocation, {
            type: "geojson",
            data: positionFeature,
          });

          // Outer pulsing ring with animation
          map.addLayer({
            id: MAP_LAYERS.userLocationPulse,
            type: "circle",
            source: MAP_SOURCES.userLocation,
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                12, 18,
                15, 25,
                18, 35,
              ],
              "circle-color": "#6f7cff",
              "circle-opacity": 0.3,
              "circle-blur": 0.5,
            },
          });

          // Inner solid dot with white border
          map.addLayer({
            id: MAP_LAYERS.userLocationDot,
            type: "circle",
            source: MAP_SOURCES.userLocation,
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                12, 6,
                15, 8,
                18, 10,
              ],
              "circle-color": "#6f7cff",
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 2.5,
            },
          });

          // Start pulse animation
          let pulsePhase = 0;
          const pulseInterval = setInterval(() => {
            if (!map.getLayer(MAP_LAYERS.userLocationPulse)) {
              clearInterval(pulseInterval);
              return;
            }
            pulsePhase = (pulsePhase + 0.05) % 1;
            const opacity = 0.15 + 0.25 * Math.abs(Math.sin(pulsePhase * Math.PI));
            map.setPaintProperty(MAP_LAYERS.userLocationPulse, "circle-opacity", opacity);
          }, 50);

          (map as MapWithPulse).userLocationPulseInterval = pulseInterval;
        }
      }
    };

    // Call on initial load
    map.on("load", addMapLayers);

    // Re-add layers when style changes (e.g., user switches map style in Settings)
    map.on("styledata", () => {
      if (map.isStyleLoaded()) {
        addMapLayers();
      }
    });

    // Listen for style change events from Settings
    const handleStyleChange = () => {
      const savedStyle =
        (typeof window !== "undefined"
          ? (localStorage.getItem("mapStylePreset") as import("@/lib/map/map-style").MapStylePreset)
          : null) || "dataviz-dark";

      map.setStyle(getDefaultMapStyle(savedStyle));
    };

    window.addEventListener("mapStyleChange", handleStyleChange);

    return () => {
      window.removeEventListener("mapStyleChange", handleStyleChange);
      const mapWithPulse = map as MapWithPulse;
      if (mapWithPulse.userLocationPulseInterval) {
        clearInterval(mapWithPulse.userLocationPulseInterval);
      }
      map.remove();
      mapRef.current = null;
    };
  }, [currentRoute, segmentData, currentPosition]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const source = map.getSource(MAP_SOURCES.streetSegments) as GeoJSONSource | undefined;
    source?.setData(segmentData);
  }, [segmentData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    const existingSource = map.getSource(MAP_SOURCES.currentWalk) as GeoJSONSource | undefined;
    const hasRoute = Boolean(currentRoute && currentRoute.geometry.coordinates.length >= 2);

    if (hasRoute && currentRoute) {
      if (existingSource) {
        existingSource.setData(currentRoute);
      } else {
        map.addSource(MAP_SOURCES.currentWalk, {
          type: "geojson",
          data: currentRoute,
        });

        map.addLayer({
          id: MAP_LAYERS.currentWalkRoute,
          type: "line",
          source: MAP_SOURCES.currentWalk,
          paint: {
            "line-color": "#ff8a5b",
            "line-width": 5,
            "line-opacity": 0.96,
          },
        });
      }

      return;
    }

    if (map.getLayer(MAP_LAYERS.currentWalkRoute)) {
      map.removeLayer(MAP_LAYERS.currentWalkRoute);
    }

    if (map.getSource(MAP_SOURCES.currentWalk)) {
      map.removeSource(MAP_SOURCES.currentWalk);
    }
  }, [currentRoute]);

  // User location marker effect - just update position data
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !currentPosition) {
      return;
    }

    const existingSource = map.getSource(MAP_SOURCES.userLocation) as GeoJSONSource | undefined;

    if (existingSource) {
      // Just update the position data, layers already exist
      const positionFeature = {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [currentPosition.longitude, currentPosition.latitude],
        },
        properties: {
          timestamp: Date.now(),
        },
      };
      existingSource.setData(positionFeature);
    }
  }, [currentPosition]);

  // Auto-follow user location during active walks
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !currentPosition || !isTracking) {
      return;
    }

    // Smoothly pan map to keep user centered
    map.easeTo({
      center: [currentPosition.longitude, currentPosition.latitude],
      duration: 1200, // 1.2 second smooth animation
      essential: true, // Animation continues even if user interacts
      padding: { bottom: 100 }, // Keep dot slightly above center (avoids UI overlap)
    });
  }, [currentPosition, isTracking]);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[#0a1628]">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

// Made with Bob
