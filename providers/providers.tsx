"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider, useTheme } from "next-themes";

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
        <OtherProviders>{children}</OtherProviders>
      </ThemeColorProvider>
    </ThemeProvider>
  );
}

function OtherProviders({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
      }}
    >
      <QueryProvider>
        <Toaster />
        <SheetProvider />
        <SettingsModal />
        {children}
      </QueryProvider>
    </ClerkProvider>
  );
}
