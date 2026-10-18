import { Code, Gauge, Star, Tag } from "lucide-react";
import type { ReactNode } from "react";
import { levelLabel, pointCount, tagLabel } from "@/lib/ar";
import { type Status, statusStyle } from "./status";

const levelColor: Record<string, string> = {
  easy: "text-green-600 dark:text-green-400",
  medium: "text-amber-600 dark:text-amber-400",
  hard: "text-red-600 dark:text-red-400",
};

function Badge({
  icon,
  children,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border bg-fd-card px-2 py-0.5 text-xs font-medium ${className ?? ""}`}
    >
      {icon}
      {children}
    </span>
  );
}

export function ChallengeBadges({
  level,
  points,
  tags,
  languages,
  status,
}: {
  level?: string;
  points?: number;
  tags?: string[];
  languages?: string[];
  status?: Status;
}) {
  const s = status && status !== "solved" ? statusStyle[status] : undefined;
  if (!level && points === undefined && !tags?.length && !s) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {s && (
        <Badge icon={<s.Icon className="size-3" />} className={s.className}>
          {s.label}
        </Badge>
      )}
      {level && (
        <Badge
          icon={<Gauge className="size-3" />}
          className={levelColor[level] ?? ""}
        >
          {levelLabel[level] ?? level}
        </Badge>
      )}
      {points !== undefined && (
        <Badge icon={<Star className="size-3" />}>{pointCount(points)}</Badge>
      )}
      {tags?.map((t) => (
        <Badge key={t} icon={<Tag className="size-3" />}>
          {tagLabel[t] ?? t}
        </Badge>
      ))}
      {languages?.map((l) => (
        <Badge key={l} icon={<Code className="size-3" />}>
          <bdi>{l}</bdi>
        </Badge>
      ))}
    </div>
  );
}
