"use client";

import dynamic from "next/dynamic";

const SettingsClient = dynamic(() => import("./settings-client"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-white/55">
      Loading settings…
    </div>
  ),
});

export default function SettingsPage() {
  return <SettingsClient />;
}
