"use client";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import SearchDialog from "@/components/search";
import { uiTranslations } from "@/lib/ar";

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      dir="rtl"
      i18n={{ locale: "ar", translations: uiTranslations }}
      search={{ SearchDialog }}
      theme={{ defaultTheme: "dark" }}
    >
      {children}
    </RootProvider>
  );
}
