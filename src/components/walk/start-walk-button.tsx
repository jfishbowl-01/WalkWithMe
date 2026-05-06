"use client";

import { Play, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

export function StartWalkButton({
  isTracking,
  canFinish,
  onStart,
  onFinish,
  onDemoWalk,
  showDemoWalk,
  demoOptions,
}: StartWalkButtonProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {isTracking ? (
          <Button
            variant="danger"
            className="min-w-[148px]"
            onClick={onFinish}
            disabled={!canFinish}
          >
            <Square className="mr-2 h-4 w-4" />
            Finish Walk
          </Button>
        ) : (
          <>
            <Button className="min-w-[148px]" onClick={onStart}>
              <Play className="mr-2 h-4 w-4" />
              Start Walk
            </Button>

            {showDemoWalk ? (
              <Button variant="secondary" onClick={onDemoWalk}>
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
              className="text-xs sm:text-sm"
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
