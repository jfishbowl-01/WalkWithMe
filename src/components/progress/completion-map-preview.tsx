"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildSegmentCollectionWithStatus } from "@/lib/geo/segment-status";
import { CAMBRIDGE_SEGMENTS } from "@/lib/mock-data/cambridge-segments";
import { CAMBRIDGE_VIEWPORT, getDefaultMapStyle } from "@/lib/map/map-style";
import { MAP_LAYERS, MAP_SOURCES } from "@/lib/map/map-layers";
import type { CompletedSegmentRecord } from "@/types/segments";

interface CompletionMapPreviewProps {
  completedSegments: CompletedSegmentRecord[];
  /** When > 0 but completedSegments is empty, show “mock Cambridge” guidance. */
  walksLogged: number;
}

export function CompletionMapPreview({
  completedSegments,
  walksLogged,
}: CompletionMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Build segment collection with status, same as map-view
  const segmentData = buildSegmentCollectionWithStatus(
    CAMBRIDGE_SEGMENTS,
    completedSegments,
    [],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Get saved map style preference
    const savedStyle =
      (typeof window !== "undefined"
        ? (localStorage.getItem("mapStylePreset") as
            | "dataviz-dark"
            | "openstreetmap"
            | "streets"
            | "outdoor"
            | "basic"
            | "satellite-hybrid")
        : null) || "dataviz-dark";

    // Initialize map
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getDefaultMapStyle(savedStyle),
      center: CAMBRIDGE_VIEWPORT.center,
      zoom: CAMBRIDGE_VIEWPORT.zoom - 0.5, // Slightly zoomed out for overview
      interactive: false, // Static map, no interaction
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Add street segments source
      map.addSource(MAP_SOURCES.streetSegments, {
        type: "geojson",
        data: segmentData,
      });

      // Show only completed segments (hide uncompleted for clean preview)
      map.addLayer({
        id: MAP_LAYERS.completedSegments,
        type: "line",
        source: MAP_SOURCES.streetSegments,
        filter: ["==", ["get", "status"], "completed"],
        paint: {
          "line-color": "#6f7cff",
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            2.5,
            15,
            3.5,
            18,
            5,
          ],
          "line-opacity": 0.95,
          "line-blur": 0.2,
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [segmentData]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/8 bg-white/6">
      <div ref={containerRef} className="h-full w-full" />
      {completedSegments.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <p className="max-w-sm text-center text-sm leading-relaxed text-white/65">
            {walksLogged === 0 ? (
              "Finish a walk to see completed streets light up on this preview map."
            ) : (
              <>
                Your walks are saved, but{" "}
                <span className="text-white/85">none of them crossed</span> the preview
                streets near Cambridge, MA yet. That often happens at home on a laptop.
                For a fair test, try{" "}
                <strong className="font-medium text-white/90">a phone outside</strong>
                {" "}in that area, or{" "}
                <strong className="font-medium text-white/90">Demo Walk</strong> when the
                app is running in development mode.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
