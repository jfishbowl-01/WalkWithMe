"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  privacyRepository,
  prototypeRepository,
  sessionRepository,
} from "@/lib/storage/repositories";
import { MAP_STYLE_PRESETS, type MapStylePreset } from "@/lib/map/map-style";
import { getMapEnv } from "@/lib/config/env";
import { cn } from "@/lib/utils";
import type { DistanceUnit } from "@/lib/geo/formatters";
import type { PrivacySettings } from "@/types/progress";

function readInitialMapStyle(): MapStylePreset {
  return (localStorage.getItem("mapStylePreset") as MapStylePreset) || "dataviz-dark";
}

function readInitialUnits(): DistanceUnit {
  const saved = localStorage.getItem("distanceUnits");
  if (saved === "metric" || saved === "imperial") {
    return saved;
  }
  return navigator.language.startsWith("en-US") ? "imperial" : "metric";
}

export default function SettingsClient() {
  const router = useRouter();
  const [privacy, setPrivacy] = useState<PrivacySettings>(() => privacyRepository.get());
  const [mapStyle, setMapStyle] = useState<MapStylePreset>(() => readInitialMapStyle());
  const [units, setUnits] = useState<DistanceUnit>(() => readInitialUnits());
  const modeStatus = prototypeRepository.getModeStatus();
  const { isMapTilerConfigured } = getMapEnv();
  const isDev = process.env.NODE_ENV !== "production";

  const handleSavePrivacy = () => {
    privacyRepository.save(privacy);
  };

  const handleMapStyleChange = (style: MapStylePreset) => {
    setMapStyle(style);
    localStorage.setItem("mapStylePreset", style);
    window.dispatchEvent(new CustomEvent("mapStyleChange", { detail: style }));
  };

  const handleUnitsChange = (nextUnits: DistanceUnit) => {
    setUnits(nextUnits);
    localStorage.setItem("distanceUnits", nextUnits);
    window.dispatchEvent(new CustomEvent("unitsChange", { detail: nextUnits }));
  };

  const handleReset = () => {
    prototypeRepository.resetAll();
    router.push("/login");
  };

  const handleSignOut = () => {
    sessionRepository.signOut();
    router.push("/login");
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Map look, units, privacy, and your account."
      activePath="/settings"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Card className="rounded-[2rem] p-5 sm:p-6">
          <CardTitle>Map style</CardTitle>
          <CardDescription className="mt-1">
            Basemap theme. Best with a MapTiler key; otherwise OSM fallback.
          </CardDescription>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(
              Object.entries(MAP_STYLE_PRESETS) as [
                MapStylePreset,
                (typeof MAP_STYLE_PRESETS)[MapStylePreset],
              ][]
            ).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleMapStyleChange(key)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-all sm:p-4",
                  mapStyle === key
                    ? "border-completed bg-completed/10"
                    : "border-white/10 bg-white/6 hover:border-white/20",
                )}
              >
                <p className="font-medium text-white">{preset.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-white/55">{preset.description}</p>
              </button>
            ))}
          </div>

          {!isMapTilerConfigured && (
            <div className="mt-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3">
              <p className="text-sm text-orange-200">
                No MapTiler key — using OSM tiles (can be rate-limited).{" "}
                <a
                  href="https://cloud.maptiler.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Free key
                </a>
              </p>
            </div>
          )}
        </Card>

        <Card className="rounded-[2rem] p-5 sm:p-6">
          <CardTitle>Distance units</CardTitle>
          <CardDescription className="mt-1">How distances appear in stats and the journal.</CardDescription>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleUnitsChange("imperial")}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                units === "imperial"
                  ? "border-completed bg-completed/10"
                  : "border-white/10 bg-white/6 hover:border-white/20",
              )}
            >
              <p className="font-medium text-white">Imperial</p>
              <p className="mt-0.5 text-xs text-white/55">Miles & feet</p>
            </button>

            <button
              type="button"
              onClick={() => handleUnitsChange("metric")}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                units === "metric"
                  ? "border-completed bg-completed/10"
                  : "border-white/10 bg-white/6 hover:border-white/20",
              )}
            >
              <p className="font-medium text-white">Metric</p>
              <p className="mt-0.5 text-xs text-white/55">Kilometers & meters</p>
            </button>
          </div>
        </Card>

        <Card className="rounded-[2rem] p-5 sm:p-6">
          <CardTitle>Privacy</CardTitle>
          <CardDescription className="mt-1">
            Home radius and route visibility for future sharing features.
          </CardDescription>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-white/80">
              Home privacy radius (meters)
            </span>
            <input
              type="number"
              min={50}
              step={25}
              value={privacy.homePrivacyRadiusMeters}
              onChange={(event) =>
                setPrivacy((current) => ({
                  ...current,
                  homePrivacyRadiusMeters: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-sm font-medium text-white/80">Route visibility</span>
            <select
              value={privacy.routeVisibility}
              onChange={(event) =>
                setPrivacy((current) => ({
                  ...current,
                  routeVisibility: event.target.value as "private" | "shared",
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-[#101a2b] px-4 py-3 text-white outline-none"
            >
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>
          </label>

          <Button className="mt-4 w-full sm:w-auto" onClick={handleSavePrivacy}>
            Save privacy
          </Button>
        </Card>

        <Card className="rounded-[2rem] p-5 sm:p-6">
          <CardTitle>Account</CardTitle>
          <CardDescription className="mt-1">Session and local data (prototype).</CardDescription>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="w-full sm:flex-1" onClick={handleSignOut}>
              Sign out
            </Button>
            <Button variant="danger" className="w-full sm:flex-1" onClick={handleReset}>
              Reset all local data
            </Button>
          </div>
        </Card>

        {isDev ? (
          <Card className="rounded-[2rem] border border-dashed border-white/20 p-4 sm:p-5">
            <CardTitle className="text-base">Developer</CardTitle>
            <CardDescription className="mt-1">Shown only in development builds.</CardDescription>
            <dl className="mt-3 grid gap-2 text-sm text-white/70">
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Persistence</dt>
                <dd className="font-medium text-white">{modeStatus.persistence}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Auth</dt>
                <dd className="font-medium text-white">{modeStatus.auth}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Supabase</dt>
                <dd className="font-medium text-white">
                  {modeStatus.supabaseConfigured ? "Configured" : "Off"}
                </dd>
              </div>
            </dl>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
