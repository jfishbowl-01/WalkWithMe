"use client";

import { AppShell } from "@/components/shell/app-shell";
import { JournalList } from "@/components/journal/journal-list";
import { walkRepository } from "@/lib/storage/repositories";

export default function JournalClient() {
  const walks = walkRepository.getAll();

  return (
    <AppShell
      title="Walk journal"
      subtitle="Saved walks and notes (this device only, for now)."
      activePath="/journal"
    >
      <JournalList walks={walks} />
    </AppShell>
  );
}
