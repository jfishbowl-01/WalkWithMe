import { distance, point } from "@turf/turf";
import { CAMBRIDGE_SEGMENTS } from "@/lib/mock-data/cambridge-segments";
import { buildWalkPointsFromSegmentChain } from "@/lib/mock-data/buildDemoWalkAlongSegments";
import type { DemoWalkDefinition } from "@/types/walk";

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tight graph: looser values create bogus graph edges and chord-like “random” routes. */
const ENDPOINT_JOIN_M = 18;

/**
 * Random walk on a graph of sample segments (endpoints within ~25 m).
 */
export function generateProceduralDemoWalk(seed: number = Date.now()): DemoWalkDefinition {
  const rand = mulberry32(seed >>> 0);
  const features = CAMBRIDGE_SEGMENTS.features;
  const n = features.length;
  const adj: number[][] = features.map(() => []);

  for (let i = 0; i < n; i++) {
    const ci = features[i].geometry.coordinates as [number, number][];
    const a0 = ci[0];
    const a1 = ci[ci.length - 1];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const cj = features[j].geometry.coordinates as [number, number][];
      const b0 = cj[0];
      const b1 = cj[cj.length - 1];
      const d = Math.min(
        distance(point(a0), point(b0), { units: "meters" }),
        distance(point(a0), point(b1), { units: "meters" }),
        distance(point(a1), point(b0), { units: "meters" }),
        distance(point(a1), point(b1), { units: "meters" }),
      );
      if (d <= ENDPOINT_JOIN_M) {
        adj[i].push(j);
      }
    }
  }

  let start = Math.floor(rand() * n);
  for (let tries = 0; tries < n && adj[start].length === 0; tries++) {
    start = (start + 1) % n;
  }

  const chain: string[] = [];
  const seen = new Set<number>();
  let cur = start;
  const targetLen = 2 + Math.floor(rand() * 4);

  while (chain.length < targetLen) {
    if (seen.has(cur)) break;
    seen.add(cur);
    chain.push(features[cur].properties.id);
    const neighbors = adj[cur].filter((j) => !seen.has(j));
    if (neighbors.length === 0) break;
    cur = neighbors[Math.floor(rand() * neighbors.length)]!;
  }

  if (chain.length < 2) {
    chain.length = 0;
    chain.push("mass-ave-central-1", "mass-ave-mit-1");
  }

  const points = buildWalkPointsFromSegmentChain(chain, {
    stepMeters: 14,
    baseTimestampMs: Date.now(),
  });

  return {
    id: `procedural-${seed}`,
    title: `Random route (${chain.length} segments)`,
    pointIntervalMs: 2600,
    points,
  };
}
