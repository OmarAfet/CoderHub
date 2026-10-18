import { Callout } from "fumadocs-ui/components/callout";
import { CircleX, Hourglass } from "lucide-react";
import { ownerDiscord } from "@/lib/shared";

// Solve status of a challenge, from the `status` front matter (set by
// scripts/import-workspace.ts from the platform status in challenge.json).
// Same model as ctf-writeups:
// - pending: not solved yet, and CoderHub still accepts a solution.
// - unsolved: not solved, and the activity has ended.
// - solved: no badge.
export type Status = "solved" | "pending" | "unsolved";

export const statusStyle: Record<
  Exclude<Status, "solved">,
  { label: string; className: string; Icon: typeof Hourglass }
> = {
  pending: {
    label: "قيد الحل",
    className: "text-amber-600 dark:text-amber-400",
    Icon: Hourglass,
  },
  unsolved: {
    label: "غير محلول",
    className: "text-red-600 dark:text-red-400",
    Icon: CircleX,
  },
};

// Small badge after the page name in the sidebar and in folder cards.
export function sidebarBadge(status: string) {
  if (status !== "pending" && status !== "unsolved") return null;
  const s = statusStyle[status];
  return (
    <span
      className={`ms-auto shrink-0 rounded border px-1.5 text-[0.625rem] font-medium leading-4 ${s.className}`}
    >
      {s.label}
    </span>
  );
}

export function PendingNotice() {
  return (
    <Callout type="warn" title="قيد الحل">
      ما أرسلت هذا الحل للمنصة للحين.
    </Callout>
  );
}

export function UnsolvedNotice() {
  return (
    <Callout type="error" title="غير محلول">
      ما انحل هذا التحدي، والمسابقة انتهت. حليته؟{" "}
      <a href={ownerDiscord} target="_blank" rel="noreferrer">
        راسلني على Discord
      </a>
      .
    </Callout>
  );
}
