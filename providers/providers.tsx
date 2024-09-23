"use client";

import { useEffect, useState } from "react";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider, useTheme } from "next-themes";

import SettingsModal from "@/components/modals/settings-modal";

import { QueryProvider } from "./query-provider";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
      }}
    >
      <QueryProvider>
        <SettingsModal />
        {children}
      </QueryProvider>
    </ClerkProvider>
  );
}
