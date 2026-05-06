"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { getDefaultMapStyle } from "@/lib/map/map-style";
import type { WalkLineString } from "@/types/geo";

interface WalkRouteThumbnailProps {
  route: WalkLineString;
  className?: string;
}

export function WalkRouteThumbnail({ route, className = "" }: WalkRouteThumbnailProps) {
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
      interactive: false,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: route,
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#6f7cff",
          "line-width": 3,
          "line-opacity": 0.95,
        },
      });

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
          padding: 20,
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
    <div className={`relative h-32 w-full overflow-hidden rounded-xl border border-white/8 bg-[#0a1628] ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

// Made with Bob
