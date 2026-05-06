"use client";

import dynamic from "next/dynamic";

const JournalClient = dynamic(() => import("./journal-client"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-white/55">
      Loading journal…
    </div>
  ),
});

export default function JournalPage() {
  return <JournalClient />;
}
