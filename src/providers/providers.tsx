"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TenstackProvider } from "./TenstackProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TenstackProvider>{children}</TenstackProvider>
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  );
}
