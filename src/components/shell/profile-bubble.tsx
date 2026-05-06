"use client";

import Link from "next/link";

function initialsFromDisplayName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface ProfileBubbleProps {
  displayName: string;
  /** `href` defaults to settings */
  href?: string;
}

export function ProfileBubble({ displayName, href = "/settings" }: ProfileBubbleProps) {
  const initials = initialsFromDisplayName(displayName);

  return (
    <Link
      href={href}
      title="Open settings"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-white/18 to-white/8 text-[13px] font-semibold tracking-tight text-white shadow-inner ring-1 ring-white/10 transition hover:border-white/25 hover:from-white/22 hover:to-white/10"
    >
      <span aria-hidden>{initials}</span>
      <span className="sr-only">Profile and settings</span>
    </Link>
  );
}
