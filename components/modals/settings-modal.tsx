"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { ThemeColorToggle } from "@/components/theme-color-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";

export default function SettingsModal() {
  const settings = useSettings();

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
