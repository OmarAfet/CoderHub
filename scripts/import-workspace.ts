// Generates the challenge pages in content/docs from a local CoderHub workspace
// (the layout of the coderhub MCP: Challenges/<Level>/<Title>/ and
// Activities/<Activity>/<Title>/, each with challenge.json and solution.<ext>).
// Usage: npm run import:workspace -- <workspace-dir>
//
// Decisions (2026-10-19):
// - The workspace is the source. content/docs/challenges and
//   content/docs/activities are generated and rewritten on every run: edit
//   the workspace (solution files, NOTES.md), not the pages.
// - Only whitelisted challenge.json fields are read: the file also holds
//   attempt ids and account state.
// - A solution file that is still the start code is not published.
// - Slugs are ASCII: the first 8 hex digits of the challenge id, or the
//   English title when the platform has one. Arabic titles do not slugify,
//   and Unicode paths risk double encoding through the multi-zone rewrite.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { acceptedCount } from "../lib/ar.ts";

const DOCS = resolve(import.meta.dirname, "../content/docs");
const WEB = "https://coderhub.tuwaiq.edu.sa";

const EXT: Record<string, string> = {
  Python: "py",
  JavaScript: "js",
  Java: "java",
  "C#": "cs",
  "C++": "cpp",
  PHP: "php",
  Dart: "dart",
  Swift: "swift",
  Kotlin: "kt",
};
const FENCE: Record<string, string> = {
  Python: "python",
  JavaScript: "js",
  Java: "java",
  "C#": "csharp",
  "C++": "cpp",
  PHP: "php",
  Dart: "dart",
  Swift: "swift",
  Kotlin: "kotlin",
};
const LEVELS: Record<string, string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
};

// Activity titles -> slug. The start year is appended, because activities
// such as Ramadan Nights repeat every year.
const ACTIVITY_SLUGS: Record<string, string> = {
  "مسابقة ليالي رمضان": "ramadan-nights",
  "مسابقة اليوم الوطني السعودي 93": "saudi-national-day-93",
};

type Test = { inputs?: { name: string; value: unknown }[]; output?: unknown };
type ChallengeJson = {
  challenge?: {
    id?: string;
    title?: string;
    title_en?: string;
    description?: string;
    level?: string;
    points?: number;
    tests_example?: Test[];
  };
  listing?: { tags?: string[]; created?: string };
  activity?: {
    id?: string;
    title?: string;
    start_at?: string | null;
    position?: number | null;
  };
  languages?: Record<
    string,
    { status?: string | null; start_code?: string | null }
  >;
};

const stats = { pages: 0, solutions: 0, accepted: 0, stubs: 0 };
const languagesSeen = new Set<string>();
const slugsSeen = new Map<string, string>();

const yaml = (v: unknown) => JSON.stringify(v);

function subdirs(dir: string): string[] {
  return readdirSync(dir)
    .filter((n) => !n.startsWith(".") && statSync(join(dir, n)).isDirectory())
    .sort((a, b) => a.localeCompare(b));
}

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function writeMeta(dir: string, meta: Record<string, unknown>) {
  writeFileSync(join(dir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
}

function writeIndex(dir: string, title: string, description?: string) {
  const fm = [
    `title: ${yaml(title)}`,
    ...(description ? [`description: ${yaml(description)}`] : []),
  ];
  writeFileSync(join(dir, "index.mdx"), `---\n${fm.join("\n")}\n---\n`);
}

// Newer descriptions are HTML, older ones Markdown.
function htmlToMarkdown(s: string): string {
  if (!/<(p|h\d|ul|ol|li|div|br|strong|b|em|code|span)\b/i.test(s)) return s;
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<h\d[^>]*>([\s\S]*?)<\/h\d>/gi, "\n\n### $1\n\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|ul|ol)>/gi, "\n\n")
    .replace(/<(strong|b)\b[^>]*>\s*([\s\S]*?)\s*<\/\1>/gi, "**$2**")
    .replace(/<(em|i)\b[^>]*>\s*([\s\S]*?)\s*<\/\1>/gi, "*$2*")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n- \s*\n+/g, "\n- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// MDX reads { } < > as code and JSX. Escape them outside code spans/blocks.
function escapeMdx(s: string): string {
  return s
    .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
    .map((part, i) =>
      i % 2
        ? part
        : part
            .replace(/[{}]/g, (c) => `\\${c}`)
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;"),
    )
    .join("");
}

function inlineCode(v: string): string {
  const ticks = "`".repeat(
    Math.max(0, ...[...v.matchAll(/`+/g)].map((m) => m[0].length)) + 1,
  );
  const pad = v.startsWith("`") || v.endsWith("`") ? " " : "";
  return `${ticks}${pad}${v.replace(/\|/g, "\\|")}${pad}${ticks}`;
}

function fence(lang: string, code: string): string {
  const ticks = "`".repeat(
    Math.max(2, ...[...code.matchAll(/`+/g)].map((m) => m[0].length)) + 1,
  );
  return `${ticks}${FENCE[lang] ?? ""} tab=${yaml(lang)}\n${code.trimEnd()}\n${ticks}`;
}

// The start code with nothing filled in: compare without comments,
// imports and blank lines.
function isStub(code: string, start?: string | null): boolean {
  const norm = (s: string) =>
    s
      .split("\n")
      .map((l) => l.trim())
      .filter(
        (l) =>
          l &&
          !l.startsWith("#") &&
          !l.startsWith("//") &&
          !l.startsWith("from typing") &&
          l !== "}" &&
          l !== "{",
      )
      .join("\n");
  const body = norm(code);
  return !body || (start != null && body === norm(start));
}

function examples(tests: Test[]): string {
  if (!tests.length) return "";
  const rows = tests.map((t) => {
    const args = (t.inputs ?? [])
      .map((i) => inlineCode(`${i.name} = ${JSON.stringify(i.value)}`))
      .join("، ");
    return `| ${args} | ${inlineCode(JSON.stringify(t.output))} |`;
  });
  return `## أمثلة\n\n| المدخلات | المخرجات المتوقعة |\n| --- | --- |\n${rows.join("\n")}\n`;
}

function writeChallenge(
  src: string,
  outDir: string,
  activity: boolean,
): { slug: string; date?: string } | undefined {
  const file = join(src, "challenge.json");
  if (!existsSync(file)) return undefined;
  const m: ChallengeJson = JSON.parse(readFileSync(file, "utf8"));
  const c = m.challenge ?? {};
  if (!c.id || !c.title) return undefined;

  const slug = (c.title_en && slugify(c.title_en)) || c.id.slice(0, 8);
  const key = join(outDir, slug);
  if (slugsSeen.has(key))
    throw new Error(`slug ${key} used by ${slugsSeen.get(key)} and ${src}`);
  slugsSeen.set(key, src);

  const solutions: string[] = [];
  const languages: string[] = [];
  let solved = false;
  for (const [lang, ext] of Object.entries(EXT)) {
    const sol = join(src, `solution.${ext}`);
    if (!existsSync(sol)) continue;
    const code = readFileSync(sol, "utf8");
    const info = m.languages?.[lang] ?? {};
    if (isStub(code, info.start_code)) {
      stats.stubs++;
      continue;
    }
    solutions.push(fence(lang, code));
    languages.push(lang);
    languagesSeen.add(lang);
    stats.solutions++;
    if (info.status === "PASSED") {
      solved = true;
      stats.accepted++;
    }
  }
  const status = solved ? "solved" : activity ? "unsolved" : "pending";
  const date = activity
    ? m.activity?.start_at?.slice(0, 19)
    : m.listing?.created?.slice(0, 19);
  const level = c.level?.toLowerCase();

  const fm = [`title: ${yaml(c.title.trim())}`];
  if (level && level in LEVELS) fm.push(`level: ${yaml(level)}`);
  if (typeof c.points === "number") fm.push(`points: ${c.points}`);
  if (m.listing?.tags?.length) fm.push(`tags: ${yaml(m.listing.tags)}`);
  if (languages.length) fm.push(`languages: ${yaml(languages)}`);
  if (date) fm.push(`date: ${yaml(date)}`);
  fm.push(`status: ${yaml(status)}`);

  const body: string[] = [];
  const description = htmlToMarkdown(c.description ?? "").trim();
  if (description) body.push(`## الوصف\n\n${escapeMdx(description)}\n`);
  const ex = examples(c.tests_example ?? []);
  if (ex) body.push(ex);
  if (!activity)
    body.push(`[جرّب تحله في كودرهب](${WEB}/challenges/${c.id}/view)\n`);
  if (solutions.length) body.push(`## الحل\n\n${solutions.join("\n\n")}\n`);
  const notes = join(src, "NOTES.md");
  if (existsSync(notes))
    body.push(
      `## ملاحظات\n\n${escapeMdx(readFileSync(notes, "utf8").trim())}\n`,
    );

  writeFileSync(
    join(outDir, `${slug}.mdx`),
    `---\n${fm.join("\n")}\n---\n\n${body.join("\n")}`,
  );
  stats.pages++;
  return { slug, date };
}

const ws = process.argv[2];
if (!ws) {
  console.error("usage: npm run import:workspace -- <workspace-dir>");
  process.exit(2);
}
console.log(
  `$ node scripts/import-workspace.ts ${JSON.stringify(resolve(ws))}`,
);

// Challenges/<Level>/<Title>/
const chDir = join(DOCS, "challenges");
rmSync(chDir, { recursive: true, force: true });
mkdirSync(chDir, { recursive: true });
writeIndex(chDir, "التحديات");
writeMeta(chDir, {
  title: "التحديات",
  icon: "Code",
  pages: [...Object.keys(LEVELS), "..."],
});
for (const levelDir of existsSync(join(ws, "Challenges"))
  ? subdirs(join(ws, "Challenges"))
  : []) {
  const level = levelDir.toLowerCase();
  if (!(level in LEVELS)) throw new Error(`unknown level folder ${levelDir}`);
  const out = join(chDir, level);
  mkdirSync(out, { recursive: true });
  writeIndex(out, LEVELS[level]);
  writeMeta(out, { title: LEVELS[level] });
  for (const t of subdirs(join(ws, "Challenges", levelDir)))
    writeChallenge(join(ws, "Challenges", levelDir, t), out, false);
}

// Activities/<Activity>/<Title>/, in timeline order.
const acDir = join(DOCS, "activities");
rmSync(acDir, { recursive: true, force: true });
mkdirSync(acDir, { recursive: true });
writeIndex(acDir, "المسابقات");
writeMeta(acDir, { title: "المسابقات", icon: "Trophy" });
for (const a of existsSync(join(ws, "Activities"))
  ? subdirs(join(ws, "Activities"))
  : []) {
  const folders = subdirs(join(ws, "Activities", a)).map((t) => {
    const f = join(ws, "Activities", a, t, "challenge.json");
    const m: ChallengeJson = existsSync(f)
      ? JSON.parse(readFileSync(f, "utf8"))
      : {};
    return { t, m };
  });
  const first = folders[0]?.m.activity ?? {};
  const year = first.start_at?.slice(0, 4);
  const base = ACTIVITY_SLUGS[a.trim()] ?? `activity-${first.id?.slice(0, 8)}`;
  const slug = year && !base.includes(year) ? `${base}-${year}` : base;
  const title = year && !a.includes(year) ? `${a.trim()} ${year}` : a.trim();
  const out = join(acDir, slug);
  mkdirSync(out, { recursive: true });
  writeIndex(out, title);
  folders.sort(
    (x, y) => (x.m.activity?.position ?? 99) - (y.m.activity?.position ?? 99),
  );
  const pages = folders
    .map(({ t }) => writeChallenge(join(ws, "Activities", a, t), out, true))
    .filter((p) => p !== undefined)
    .map((p) => p.slug);
  writeMeta(out, { title, pages });
}

// Home page. "بـ" and not "بلغتي": without a fatha, "بلغتي" reads as "in my
// language" next to "حلولي" (Arabic review, 2026-10-19).
const langs = [...languagesSeen];
const inLangs = `بـ ${langs.slice(0, -1).join("، ")}${langs.length > 1 ? " و" : ""}${langs.at(-1)}`;
writeFileSync(
  join(DOCS, "index.mdx"),
  `---\ntitle: ${yaml("حلولي في كودرهب")}\ndescription: ${yaml(`${acceptedCount(stats.accepted)} ${inLangs}.`)}\n---\n\nاقرأ الحل بعد ما تحاول بنفسك.\n`,
);
writeMeta(DOCS, { pages: ["index", "challenges", "activities"] });

console.log(
  `wrote ${stats.pages} pages with ${stats.solutions} solutions (${stats.accepted} accepted); skipped ${stats.stubs} start-code stubs`,
);
