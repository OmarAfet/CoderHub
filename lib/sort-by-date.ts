import type { Node } from "fumadocs-core/page-tree";
import type { LoaderPlugin } from "fumadocs-core/source";

// Sidebar and folder cards list entries newest first by the `date` front
// matter (the FlagYard createdAt of a challenge). Decided by the user 2026-10-18:
// a lab or event folder sorts by its newest challenge, not by its own creation
// date, so a lab with recent challenges stays on top.
// - A folder whose meta.json lists `pages` keeps that order (the platform's
//   sections and the Easy/Medium/Hard/Insane levels).
// - Undated entries go last, in their original order.
export function sortByDatePlugin(): LoaderPlugin {
  return {
    name: "sort-by-date",
    transformPageTree: {
      folder(node, _folderPath, metaPath) {
        const storage = this.storage;
        const meta = metaPath ? storage.read(metaPath) : undefined;
        if (meta?.format === "meta" && meta.data.pages) return node;

        const pageDate = (ref?: string) => {
          const file = ref ? storage.read(ref) : undefined;
          return file?.format === "page"
            ? (file.data as { date?: string }).date
            : undefined;
        };
        const dateOf = (n: Node): string | undefined => {
          if (n.type === "page") return pageDate(n.$ref);
          if (n.type !== "folder") return undefined;
          return n.children
            .map(dateOf)
            .filter((d) => d !== undefined)
            .sort()
            .at(-1);
        };

        const entries = node.children.map((n, i) => ({ n, i, d: dateOf(n) }));
        entries.sort((a, b) => {
          if (a.d && b.d && a.d !== b.d) return b.d.localeCompare(a.d);
          if (a.d && !b.d) return -1;
          if (!a.d && b.d) return 1;
          return a.i - b.i;
        });
        node.children = entries.map((e) => e.n);
        return node;
      },
    },
  };
}
