"use client";

import { ThemeProvider } from "next-themes";

import SettingsModal from "@/components/modals/settings-modal";
import { Toaster } from "@/components/ui/sonner";

import { QueryProvider } from "./query-provider";
import SheetProvider from "./sheet-provider";
import ThemeColorProvider from "./theme-color-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="my-life-organizer-theme"
    >
      <ThemeColorProvider>
        <QueryProvider>
          <Toaster />
          <SheetProvider />
          <SettingsModal />
          {children}
        </QueryProvider>
      </ThemeColorProvider>
    </ThemeProvider>
  );
}
