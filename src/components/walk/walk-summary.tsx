"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, PenSquare, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { RoutePreviewMap } from "@/components/walk/route-preview-map";
import { formatDurationMinutes, formatMeters } from "@/lib/geo/formatters";
import { useUnitPreference } from "@/lib/hooks/useUnitPreference";
import type { WalkRecord } from "@/types/walk";

interface WalkSummaryProps {
  walk: WalkRecord;
  completionPercentage: number;
  onSave: (updates: { title: string; notes: string; photoUrls: string[] }) => void;
}

export function WalkSummary({
  walk,
  completionPercentage,
  onSave,
}: WalkSummaryProps) {
  const units = useUnitPreference();
  const [title, setTitle] = useState(walk.title);
  const [notes, setNotes] = useState(walk.notes);
  const [photoUrls, setPhotoUrls] = useState<string[]>(walk.photoUrls || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      event.target.value = "";
      return;
    }

    Promise.all(
      imageFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((urls) => {
        const validUrls = urls.filter((url) => url.length > 0);
        if (validUrls.length > 0) {
          setPhotoUrls((prev) => [...prev, ...validUrls]);
        }
      })
      .catch(() => {
        // Ignore failed reads and keep existing photos untouched.
      })
      .finally(() => {
        // Allow selecting the same file again.
        event.target.value = "";
      });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="rounded-[2rem] p-6">
        <CardTitle>Walk summary</CardTitle>
        <CardDescription className="mt-2">
          Route preview, new completion impact, and journal details for this walk.
        </CardDescription>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Distance</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatMeters(walk.distanceMeters, units)}
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Duration</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatDurationMinutes(walk.durationSeconds)}
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">New streets</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {walk.newlyCompletedSegmentIds.length}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <RoutePreviewMap route={walk.route} />
        </div>
      </Card>

      <Card className="rounded-[2rem] p-6">
        <CardTitle>Journal details</CardTitle>
        <CardDescription className="mt-2">
          Edit your title, notes, and future photo attachments.
        </CardDescription>

        <label className="mt-6 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
            <PenSquare className="h-4 w-4 text-completed" />
            Title
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/35"
            placeholder="Evening loop through Central Square"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-white/80">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={6}
            className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/35"
            placeholder="What did this walk feel like? Any memorable streets, paths, or views?"
          />
        </label>

        <div className="mt-4 rounded-3xl border border-white/8 bg-white/6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Camera className="h-4 w-4 text-active-route" />
              Walk photos
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
            >
              Add Photos
            </button>
          </div>

          {photoUrls.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-white/60">
              No photos yet. Click &ldquo;Add Photos&rdquo; to upload images from this walk.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {photoUrls.map((url, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border border-white/8"
                >
                  <Image
                    src={url}
                    alt={`Walk photo ${index + 1}`}
                    width={300}
                    height={128}
                    className="h-32 w-full object-cover"
                    unoptimized
                  />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-3xl border border-white/8 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Sample map progress
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {completionPercentage.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            Share of the Cambridge-area preview streets. Low here doesn’t mean your walk
            didn’t save.
          </p>
        </div>

        <Button className="mt-6 w-full" onClick={() => onSave({ title, notes, photoUrls })}>
          <Save className="mr-2 h-4 w-4" />
          Save / Done
        </Button>
      </Card>
    </div>
  );
}

// Made with Bob
