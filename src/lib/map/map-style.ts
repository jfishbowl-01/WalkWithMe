import type { StyleSpecification } from "maplibre-gl";
import { getMapEnv } from "@/lib/config/env";
import type { GeoBounds } from "@/types/geo";

export const CAMBRIDGE_VIEWPORT: GeoBounds = {
  center: [-71.1034, 42.3706],
  zoom: 13.25,
  pitch: 24,
  bearing: -8,
};

export type MapStylePreset =
  | "dataviz-dark" // Dark analytical (default)
  | "openstreetmap" // Classic OSM bright
  | "streets" // Neutral streets
  | "outdoor" // Topographic
  | "basic" // Minimal
  | "satellite-hybrid"; // Satellite with labels

export const MAP_STYLE_PRESETS: Record<
  MapStylePreset,
  {
    name: string;
    description: string;
    mapTilerPath: string;
  }
> = {
  "dataviz-dark": {
    name: "Dataviz Dark",
    description: "Dark analytical style - perfect for tracking",
    mapTilerPath: "dataviz-dark",
  },
  openstreetmap: {
    name: "OpenStreetMap",
    description: "Classic bright OSM with detailed streets",
    mapTilerPath: "openstreetmap",
  },
  streets: {
    name: "Streets",
    description: "Neutral street map with balanced colors",
    mapTilerPath: "streets-v2",
  },
  outdoor: {
    name: "Outdoor",
    description: "Topographic style with terrain details",
    mapTilerPath: "outdoor-v2",
  },
  basic: {
    name: "Basic",
    description: "Minimal clean style",
    mapTilerPath: "basic-v2",
  },
  "satellite-hybrid": {
    name: "Satellite",
    description: "Satellite imagery with street labels",
    mapTilerPath: "hybrid",
  },
};

export const FALLBACK_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "WalkWithMe Dark Fallback",
  sources: {
    osm: {
      type: "raster",
      tiles: [
        // Use multiple subdomains for better performance
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 18, // Limit max zoom to avoid errors
      minzoom: 0,
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#0a1628", // Dark background to match UI
      },
    },
    {
      id: "osm-base",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 18,
      paint: {
        "raster-opacity": 0.5, // Dimmed for dark mode
        "raster-saturation": -0.6, // More desaturated
        "raster-contrast": 0.2,
        "raster-brightness-min": 0,
        "raster-brightness-max": 0.6, // Darker overall
        "raster-fade-duration": 200, // Smooth tile loading
      },
    },
  ],
};

export function getDefaultMapStyle(
  preset: MapStylePreset = "dataviz-dark",
): string | StyleSpecification {
  const { mapTilerKey, isMapTilerConfigured } = getMapEnv();

  if (isMapTilerConfigured && mapTilerKey) {
    const styleConfig = MAP_STYLE_PRESETS[preset];
    return `https://api.maptiler.com/maps/${styleConfig.mapTilerPath}/style.json?key=${mapTilerKey}`;
  }

  // Fallback if no API key
  console.warn(
    "MapTiler key not configured. Using OSM fallback with rate limits. " +
      "Get free key: https://cloud.maptiler.com/",
  );
  return FALLBACK_MAP_STYLE;
}
