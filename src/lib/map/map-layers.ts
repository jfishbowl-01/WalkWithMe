export const MAP_SOURCES = {
  streetSegments: "street-segments",
  completedSegments: "completed-segments",
  currentWalk: "current-walk",
  userLocation: "user-location",
} as const;

export const MAP_LAYERS = {
  uncompletedSegments: "segments-uncompleted",
  completedSegments: "segments-completed",
  newlyCompletedSegments: "segments-newly-completed",
  currentWalkRoute: "current-walk-route",
  userLocationPulse: "user-location-pulse",
  userLocationDot: "user-location-dot",
} as const;

// Made with Bob
