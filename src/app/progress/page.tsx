"use client";

import dynamic from "next/dynamic";

const ProgressDashboard = dynamic(
  () =>
    import("@/components/progress/progress-dashboard").then((mod) => ({
      default: mod.ProgressDashboard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-white/55">
        Loading progress…
      </div>
    ),
  },
);

export default function ProgressPage() {
  return <ProgressDashboard />;
}
