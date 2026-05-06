"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS } from "@/lib/config/nav";

export interface AppBottomTabsProps {
  activePath: string;
  /** `fixed` for scrollable pages; `absolute` inside full-bleed map container */
  position?: "fixed" | "absolute";
  className?: string;
}

export function AppBottomTabs({
  activePath,
  position = "fixed",
  className,
}: AppBottomTabsProps) {
  const positionClass =
    position === "fixed"
      ? "fixed left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2"
      : "absolute left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2";

  return (
    <nav
      className={cn(
        "pointer-events-auto rounded-2xl border border-white/10 bg-[#0b1526]/90 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur",
        positionClass,
        className,
      )}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
    >
      <ul className="grid grid-cols-4 gap-1">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition",
                  isActive
                    ? "bg-white/16 text-white"
                    : "text-white/70 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
