"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { useLocalSession } from "@/lib/hooks/useLocalSession";
import { AppBottomTabs } from "@/components/shell/app-bottom-tabs";
import { ProfileBubble } from "@/components/shell/profile-bubble";

interface AppShellProps {
  title: string;
  subtitle?: string;
  activePath: string;
  children: ReactNode;
}

export function AppShell({
  title,
  subtitle,
  activePath,
  children,
}: AppShellProps) {
  const { session, isHydrated } = useLocalSession();
  const displayName = session.user?.displayName ?? "Walker";

  return (
    <div
      className="relative min-h-screen px-4 pt-4 sm:px-6"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5.75rem)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Card className="flex flex-row items-start justify-between gap-3 rounded-[2rem] px-4 py-4 sm:px-5 sm:py-5">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              WalkWithMe
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-sm leading-snug text-white/62">{subtitle}</p>
            ) : null}
          </div>

          {isHydrated ? (
            <ProfileBubble displayName={displayName} />
          ) : (
            <div
              className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-white/10"
              aria-hidden
            />
          )}
        </Card>

        <main>{children}</main>
      </div>

      <AppBottomTabs activePath={activePath} position="fixed" />
    </div>
  );
}
