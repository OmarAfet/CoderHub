import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { ArrowRight } from "lucide-react";
import { appName, gitConfig, homeUrl, repoPublic } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    githubUrl: repoPublic
      ? `https://github.com/${gitConfig.user}/${gitConfig.repo}`
      : undefined,
    links: [
      {
        type: "custom",
        // A plain <a>: the personal site is another Next.js zone, so a client-side
        // <Link> navigation would not work across zones. "Back" points right in RTL.
        children: (
          <a
            href={homeUrl}
            className="inline-flex items-center gap-2 rounded-md p-2 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            <ArrowRight className="size-4" />
            <bdi>Omar Afet</bdi>
          </a>
        ),
      },
    ],
  };
}
