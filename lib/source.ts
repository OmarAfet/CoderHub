import { llms, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { statusBadgesPlugin } from "fumadocs-core/source/status-badges";
import { applyMdxPreset } from "fumadocs-mdx/config";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";
import { sidebarBadge } from "@/components/status";
import { docsRoute } from "./shared";
import { sortByDatePlugin } from "./sort-by-date";

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      level: z.enum(["easy", "medium", "hard"]).optional(),
      points: z.number().optional(),
      tags: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      // CoderHub creation date (activity start for activity challenges);
      // orders the sidebar (lib/sort-by-date.ts). An unquoted YAML date
      // parses as a Date, so normalize it to ISO text.
      // Solve status (components/status.tsx), set by scripts/import-workspace.ts.
      status: z.enum(["solved", "pending", "unsolved"]).optional(),
      date: z.preprocess(
        (v) => (v instanceof Date ? v.toISOString() : v),
        z.string().optional(),
      ),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
    // Why (2026-11-02): a problem statement embeds an image from i.ibb.co;
    // when that host times out, fetching its size failed the whole build on
    // Vercel. Such an image is now left out of that build instead. The
    // preset keeps every other default plugin.
    mdxOptions: applyMdxPreset({
      remarkImageOptions: { onError: "hide", external: { timeout: 10_000 } },
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [
    lucideIconsPlugin(),
    sortByDatePlugin(),
    statusBadgesPlugin({ renderBadge: sidebarBadge }),
  ],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText("processed")}`,
});
