import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Provider } from "@/components/provider";
import { appName, basePath, indexable, siteUrl } from "@/lib/shared";
import "./global.css";

// Same family as the personal site: one voice for Arabic and Latin.
const sans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}${basePath}/`),
  title: { template: `%s | ${appName}`, default: appName },
  description: "حلولي المقبولة لتحديات كودرهب بلغتي Python وJavaScript.",
  robots: indexable ? undefined : { index: false },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={sans.className}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
