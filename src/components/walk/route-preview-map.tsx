"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { getDefaultMapStyle } from "@/lib/map/map-style";
import type { WalkLineString } from "@/types/geo";

interface RoutePreviewMapProps {
  route: WalkLineString;
  className?: string;
}

export function RoutePreviewMap({ route, className = "" }: RoutePreviewMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

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
      interactive: false, // Static preview - no user interaction
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Add route source
      map.addSource("route", {
        type: "geojson",
        data: route,
      });

      // Add route layer with same styling as main map
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#6f7cff",
          "line-width": 4,
          "line-opacity": 0.95,
          "line-blur": 0.2,
        },
      });

      // Fit map to route bounds with padding
      const coordinates = route.geometry.coordinates;
      if (coordinates.length > 0) {
        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord as [number, number]),
          new maplibregl.LngLatBounds(
            coordinates[0] as [number, number],
            coordinates[0] as [number, number]
          )
        );

        map.fitBounds(bounds, {
          padding: 40,
          animate: false,
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [route]);

  return (
    <div className={`relative h-[300px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

// Made with Bob
