"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { WalkSummary } from "@/components/walk/walk-summary";
import {
  buildProgressStats,
  walkRepository,
} from "@/lib/storage/repositories";

interface WalkDetailClientProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WalkDetailClient({ params }: WalkDetailClientProps) {
  const router = useRouter();
  const { id } = use(params);
  const walk = walkRepository.getById(id);

  if (!walk) {
    return (
      <AppShell
        title="Walk not found"
        subtitle="This local prototype could not find that saved walk."
        activePath="/journal"
      >
        <div className="glass-panel rounded-[2rem] p-6 text-white/75">
          The walk may have been removed when local prototype data was reset.
        </div>
      </AppShell>
    );
  }

  const completionPercentage = buildProgressStats().completionPercentage;

  return (
    <AppShell
      title={walk.title}
      subtitle={new Date(walk.startedAt).toLocaleString()}
      activePath="/journal"
    >
      <WalkSummary
        walk={walk}
        completionPercentage={completionPercentage}
        onSave={(updates) => {
          walkRepository.update(walk.id, updates);
          router.push("/journal");
        }}
      />
    </AppShell>
  );
}
