import { Card, CardTitle } from "@/components/ui/card";
import { SAMPLE_MAP_MAP_CARD } from "@/lib/config/user-facing-copy";

interface MapControlsCardProps {
  completionPercentage: number;
  walksLogged: number;
}

export function MapControlsCard({
  completionPercentage,
  walksLogged,
}: MapControlsCardProps) {
  return (
    <Card className="w-full max-w-sm rounded-[1.5rem] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            WalkWithMe
          </p>
          <CardTitle className="mt-2 text-lg">Your walk</CardTitle>
          <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-white/55">
            {SAMPLE_MAP_MAP_CARD}
          </p>
        </div>

        <div
          className="metric-ring h-16 w-16 rounded-full"
          style={
            {
              "--ring-progress": `${Math.max(
                4,
                Math.min(completionPercentage, 100),
              )}%`,
            } as React.CSSProperties
          }
        >
          <span className="text-sm font-semibold">
            {completionPercentage.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/8 bg-white/6 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Walks logged</p>
          <p className="mt-1 text-lg font-semibold">{walksLogged}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/6 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Sample area</p>
          <p className="mt-1 text-sm font-medium text-white/80">Cambridge, MA preview</p>
        </div>
      </div>
    </Card>
  );
}

// Made with Bob
