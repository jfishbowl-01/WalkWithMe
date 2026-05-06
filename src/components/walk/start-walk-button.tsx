"use client";

import { Play, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DemoWalkOption {
  label: string;
  onClick: () => void;
}

interface StartWalkButtonProps {
  isTracking: boolean;
  canFinish: boolean;
  onStart: () => void;
  onFinish: () => void;
  onDemoWalk: () => void;
  showDemoWalk: boolean;
  /** Extra scripted routes (dev). Primary “Demo walk” still uses `onDemoWalk`. */
  demoOptions?: DemoWalkOption[];
  /** Stronger surfaces for controls sitting on top of a light basemap. */
  highContrastOnMap?: boolean;
}

export function StartWalkButton({
  isTracking,
  canFinish,
  onStart,
  onFinish,
  onDemoWalk,
  showDemoWalk,
  demoOptions,
  highContrastOnMap = false,
}: StartWalkButtonProps) {
  const mapSecondary = highContrastOnMap
    ? "border border-white/35 bg-[#152032] text-white shadow-[0_4px_18px_rgba(0,0,0,0.5)] hover:bg-[#1a2a42]"
    : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {isTracking ? (
          <Button
            variant="danger"
            className={cn("min-w-[148px]", highContrastOnMap && "shadow-lg")}
            onClick={onFinish}
            disabled={!canFinish}
          >
            <Square className="mr-2 h-4 w-4" />
            Finish Walk
          </Button>
        ) : (
          <>
            <Button
              className={cn("min-w-[148px]", highContrastOnMap && "shadow-lg")}
              onClick={onStart}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Walk
            </Button>

            {showDemoWalk ? (
              <Button variant="secondary" className={mapSecondary} onClick={onDemoWalk}>
                <Sparkles className="mr-2 h-4 w-4" />
                Demo walk
              </Button>
            ) : null}
          </>
        )}
      </div>

      {!isTracking && showDemoWalk && demoOptions && demoOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {demoOptions.map((opt) => (
            <Button
              key={opt.label}
              variant="secondary"
              className={cn("text-left text-xs sm:text-sm", mapSecondary)}
              onClick={opt.onClick}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// Made with Bob
