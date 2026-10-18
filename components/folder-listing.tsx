import {
  type Folder,
  findPath,
  type Item,
  type Node,
  type Root,
} from "fumadocs-core/page-tree";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Code, Folder as FolderIcon } from "lucide-react";
import { challengeCount, levelLabel, pointCount } from "@/lib/ar";
import { source } from "@/lib/source";

// Folder pages list their children from the page tree at build time, so a new
// writeup shows up in every parent listing without editing an index file.

export function findFolder(tree: Root, url: string): Root | Folder | undefined {
  if (url === "/") return tree;
  const path = findPath(
    tree.children,
    (n) => n.type === "folder" && n.index?.url === url,
  );
  const last = path?.at(-1);
  return last?.type === "folder" ? last : undefined;
}

export function countChallenges(nodes: Node[]): number {
  let n = 0;
  for (const node of nodes) {
    if (node.type === "page" && node.url !== "/") n++;
    else if (node.type === "folder") n += countChallenges(node.children);
  }
  return n;
}

export { challengeCount };

function summary(item: Item) {
  const data = source.getNodePage(item)?.data;
  if (!data) return undefined;
  const parts = [
    data.level && levelLabel[data.level],
    data.points !== undefined && pointCount(data.points),
    data.languages?.join(" و"),
  ].filter(Boolean);
  return parts.length ? parts.join("، ") : undefined;
}

export function FolderListing({
  folder,
  url,
}: {
  folder: Root | Folder;
  url: string;
}) {
  const cards = folder.children.flatMap((node) => {
    if (node.type === "folder" && node.index) {
      return (
        <Card
          key={node.index.url}
          href={node.index.url}
          icon={node.icon ?? <FolderIcon />}
          title={node.name}
          description={challengeCount(countChallenges(node.children))}
        />
      );
    }
    if (node.type === "page" && node.url !== url) {
      return (
        <Card
          key={node.url}
          href={node.url}
          icon={<Code />}
          title={node.name}
          description={summary(node)}
        />
      );
    }
    return [];
  });
  return cards.length > 0 ? <Cards>{cards}</Cards> : null;
}
