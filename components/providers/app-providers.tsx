"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-providers";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex min-h-screen flex-col">
          <Toaster />
          <div className="flex-1">{children}</div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
