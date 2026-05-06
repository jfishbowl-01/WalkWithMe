"use client";

import { useRouter } from "next/navigation";
import { Compass, MapPinned, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useLocalSession } from "@/lib/hooks/useLocalSession";

export default function LoginPage() {
  const router = useRouter();
  const { session, isHydrated, signIn } = useLocalSession();

  const handleSignIn = async () => {
    const nextSession = await Promise.resolve(signIn());

    if (nextSession.isAuthenticated) {
      router.replace("/map");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[2rem] p-8 sm:p-10">
            <p className="text-xs uppercase tracking-[0.4em] text-white/45">
              WalkWithMe
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Turn walks into a light-up street map game.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Record a path, save it, and see how much of our{" "}
              <strong className="font-medium text-white/88">sample</strong> Cambridge-area
              map you’ve covered. Your journal keeps every walk—even when the “percent
              complete” number stays low.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/8 bg-white/6 p-4">
                <Compass className="h-5 w-5 text-completed" />
                <p className="mt-3 font-medium text-white">Street completion game</p>
                <p className="mt-1 text-sm text-white/60">
                  Streets light up as you walk most of their length.
                </p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/6 p-4">
                <MapPinned className="h-5 w-5 text-active-route" />
                <p className="mt-3 font-medium text-white">Sample map area</p>
                <p className="mt-1 text-sm text-white/60">
                  Preview streets near Cambridge, MA today—expandable to more places later.
                </p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/6 p-4">
                <Shield className="h-5 w-5 text-success" />
                <p className="mt-3 font-medium text-white">Privacy-aware by design</p>
                <p className="mt-1 text-sm text-white/60">
                  Home privacy radius and route visibility are part of the model from day one.
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[2rem] p-8">
            <CardTitle>Try the preview</CardTitle>
            <CardDescription className="mt-2">
              Sign-in is a simple local placeholder. Everything you save lives in{" "}
              <strong className="font-medium text-white/85">this browser on this device</strong>
              . Clearing website data or switching devices means your walks won’t appear
              until we add online backup.
            </CardDescription>

            <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-100">Beta expectations</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-amber-100/85">
                <li>GPS works best on a phone outdoors; laptops can be inaccurate.</li>
                <li>
                  The big “percent complete” number only counts overlap with the{" "}
                  <em>sample</em> Cambridge-area map—not your whole city.
                </li>
                <li>
                  The app can’t follow you in the background; keep the screen on while
                  walking.
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-3xl border border-white/8 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                Current mode
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {!isHydrated
                  ? "Loading…"
                  : session.isAuthenticated
                    ? "You’re in"
                    : "Tap below to continue"}
              </p>
              <p className="mt-1 text-sm text-white/60">
                Online accounts and sync are planned next.
              </p>
            </div>

            <Button
              className="mt-6 w-full justify-center py-3"
              onClick={handleSignIn}
              disabled={!isHydrated}
            >
              Enter WalkWithMe
            </Button>

            {process.env.NODE_ENV !== "production" ? (
              <p className="mt-4 text-sm leading-6 text-white/55">
                Development tip: after signing in, use Demo Walk on the map if live GPS
                is unavailable.
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </main>
  );
}
