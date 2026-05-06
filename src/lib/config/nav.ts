import type { LucideIcon } from "lucide-react";
import { BarChart3, BookOpen, Map, Settings } from "lucide-react";

export interface MainNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Primary app destinations — single source for bottom tabs and any future nav. */
export const MAIN_NAV_ITEMS: readonly MainNavItem[] = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
