"use client";

import { useEffect, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { ThemeColorToggle } from "@/components/theme-color-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditProfile } from "@/features/profiles/api/use-edit-profile";
import { useGetCurrentProfile } from "@/features/profiles/api/use-get-current-profile";
import { useSettings } from "@/hooks/use-settings";

export default function SettingsModal() {
  const settings = useSettings();
  const { data: profile } = useGetCurrentProfile();
  const editProfile = useEditProfile();

  const [ntfyTopic, setNtfyTopic] = useState("");

  useEffect(() => {
    setNtfyTopic(profile?.ntfyTopic ?? "");
  }, [profile?.ntfyTopic]);

  const handleSaveTopic = () => {
    if (!profile) return;
    editProfile.mutate({ id: profile.id, values: { ntfyTopic: ntfyTopic || null } });
  };

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.OnClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-xl font-medium">My Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          <h3 className="text-lg font-medium mb-3">Appearance</h3>
          <div className="flex items-center justify-between mb-4 pl-2">
            <div className="flex flex-col gap-y-1">
              <Label>Dark/Light Mode</Label>
              <span className="text-[0.8rem] text-muted-foreground">
                Change the dark/light mode
              </span>
            </div>
            <ModeToggle />
          </div>
          <div className="flex items-center justify-between mb-4 pl-2">
            <div className="flex flex-col gap-y-1">
              <Label>Color Theme</Label>
              <span className="text-[0.8rem] text-muted-foreground">
                Customize the color theme
              </span>
            </div>
            <ThemeColorToggle />
          </div>

          <h3 className="text-lg font-medium mb-3 mt-2">Notifications</h3>
          <div className="flex flex-col gap-2 mb-2 pl-2">
            <Label>ntfy topic</Label>
            <span className="text-[0.8rem] text-muted-foreground">
              Subscribe to this topic in the ntfy app on your phone to receive
              reminders. Leave blank to disable notifications.
            </span>
            <div className="flex gap-2">
              <Input
                value={ntfyTopic}
                onChange={(e) => setNtfyTopic(e.target.value)}
                placeholder="e.g. miguel-life-organizer"
              />
              <Button onClick={handleSaveTopic} disabled={editProfile.isPending}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
