"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { PlusIcon } from "lucide-react";

import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateProfile } from "@/features/profiles/api/use-create-profile";
import { useGetProfiles } from "@/features/profiles/api/use-get-profiles";
import { useSwitchProfile } from "@/features/profiles/api/use-switch-profile";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { cn } from "@/lib/utils";

const EMOJI_OPTIONS = [
  "🙂",
  "🧑",
  "👩",
  "👨",
  "🧔",
  "👵",
  "👴",
  "👧",
  "👦",
  "🐱",
  "🐶",
  "🦊",
];
const COLOR_OPTIONS = [
  "#6366f1",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export default function SelectProfilePage() {
  return (
    <Suspense fallback={<Spinner size="lg" />}>
      <SelectProfileContent />
    </Suspense>
  );
}

function SelectProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = safeRedirectPath(
    searchParams.get("redirect_url"),
    "/dashboard"
  );

  const { data: profiles, isLoading } = useGetProfiles();
  const switchProfile = useSwitchProfile();

  const [createOpen, setCreateOpen] = useState(false);

  const handleSelect = (id: string) => {
    switchProfile.mutate(id, {
      onSuccess: () => router.push(redirectUrl),
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/logo.svg" alt="Life Organizer" width={64} height={64} />
        <h1 className="text-2xl font-bold">Who&apos;s using Life Organizer?</h1>
        <p className="text-muted-foreground">Pick your profile to continue.</p>
      </div>

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {profiles?.map((profile) => (
            <button
              key={profile.id}
              type="button"
              disabled={switchProfile.isPending}
              onClick={() => handleSelect(profile.id)}
              className="flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: profile.color }}
              >
                {profile.emoji}
              </div>
              <span className="text-sm font-medium">{profile.name}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:text-foreground">
              <PlusIcon className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Add profile
            </span>
          </button>
        </div>
      )}

      <CreateProfileDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleSelect}
      />
    </div>
  );
}

function CreateProfileDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const createProfile = useCreateProfile();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProfile.mutate(
      { name: name.trim(), emoji, color, ntfyTopic: null },
      {
        onSuccess: ({ data }) => {
          if (!data) return;
          setName("");
          onOpenChange(false);
          onCreated(data.id);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Icon</p>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border text-lg",
                    emoji === e && "border-primary ring-2 ring-primary/30"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    color === c && "ring-2 ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Card className="flex items-center gap-3 p-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
              style={{ backgroundColor: color }}
            >
              {emoji}
            </div>
            <span className="font-medium">{name || "Preview"}</span>
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || createProfile.isPending}
          >
            Create profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
