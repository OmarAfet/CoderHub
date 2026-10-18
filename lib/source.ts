import { llms, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { statusBadgesPlugin } from "fumadocs-core/source/status-badges";
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
