"use client";

import { Play, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StartWalkButtonProps {
  isTracking: boolean;
  canFinish: boolean;
  onStart: () => void;
  onFinish: () => void;
  onDemoWalk: () => void;
  showDemoWalk: boolean;
}

export function StartWalkButton({
  isTracking,
  canFinish,
  onStart,
  onFinish,
  onDemoWalk,
  showDemoWalk,
}: StartWalkButtonProps) {
  return (
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
              Demo Walk
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

// Made with Bob
