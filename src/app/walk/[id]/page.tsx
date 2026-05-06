"use client";

import dynamic from "next/dynamic";

const WalkDetailClient = dynamic(() => import("./walk-detail-client"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-white/55">
      Loading walk…
    </div>
  ),
});

interface WalkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WalkPage({ params }: WalkPageProps) {
  return <WalkDetailClient params={params} />;
}
