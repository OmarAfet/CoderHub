# CoderHub Solutions

My accepted solutions to [CoderHub](https://coderhub.sa) challenges, built with
[Fumadocs](https://fumadocs.dev) (Next.js), in Arabic (RTL).

- Live: https://omarafet.vercel.app/coderhub
- Please try a challenge yourself before you read its solution.

From 2022 to 2023 this repo held the solution files as `challenges/<Language>/<Level>/<title>.<ext>`.
On 2026-10-19 it became this site; the old files are in the git history.

## Layout

```
content/docs/
  index.mdx                                   home page
  challenges/<level>/<id8>.mdx                general challenges (easy, medium, hard)
  activities/<activity>-<year>/<slug>.mdx     activity (competition) challenges, in timeline order
```

One `.mdx` page per challenge: the problem text, the example tests, and the solution code with one tab per
language. Front matter: `title`, `level`, `points`, `tags`, `languages`, `date` (CoderHub creation date, or the
activity start) and `status`.

## Source of the pages

The pages are generated from the CoderHub workspace (`~/Personal/VSCode/CoderHub`), which the
[coderhub MCP](https://github.com/OmarAfet/coderhub-mcp) fills from the platform. Decisions (2026-10-19):

- `content/docs/challenges` and `content/docs/activities` are rewritten on every import. Edit the workspace,
  not the pages: `solution.<ext>` holds the code, and an optional `NOTES.md` is shown under the solution.
- Only whitelisted `challenge.json` fields reach the site (the file also holds attempt ids and account state).
- A solution file that is still the start code is not published.
- Slugs are ASCII: the first 8 hex digits of the challenge id, or the English title when the platform has one.
  Arabic titles do not slugify, and Unicode paths risk double encoding through the multi-zone rewrite.

## Status

`status` comes from the platform result in `challenge.json`: `solved` (no badge), `pending` ("قيد الحل": not
accepted yet, CoderHub still accepts a solution) or `unsolved` ("غير محلول": an activity challenge that was not
solved before the activity ended; the page asks solvers to message the owner on Discord).

## Arabic copy

Register (decided 2026-10-19): mixed. Titles, questions and buttons in white Saudi dialect; numbers, facts
and labels in simple MSA. The UI strings are in `lib/ar.ts` (with the number agreement of counted nouns:
5 نقاط، 20 نقطة، 184 تحديًا). The problem statements stay as CoderHub wrote them.

## Order

Entries are listed newest first by `date` (`lib/sort-by-date.ts`, same rule as ctf-writeups). The levels and
the challenges of an activity keep the order in their `meta.json`.

## Commands

| Command | Does |
|---|---|
| `coderhub pull` | (coderhub-mcp CLI) Refreshes the workspace from the platform; never overwrites a solution file |
| `npm run import:workspace -- ~/Personal/VSCode/CoderHub` | Regenerates the pages from the workspace |
| `npm run dev` | Dev server at http://localhost:3000/coderhub |
| `npm run build` | Production build |

## Hosting

The site is a Next.js [multi-zone](https://nextjs.org/docs/app/guides/multi-zones) app with
`basePath: '/coderhub'` (see `next.config.mjs`). It deploys as its own Vercel project, and the personal site
(`omarafet.vercel.app`) rewrites `/coderhub/*` to it (`CODERHUB_ORIGIN` there). Pages are indexed
(`indexable: true`, decided 2026-10-19).

## Local files

`/challenges/` is git-ignored: it holds 15 Python files that were never committed in the 2023 repo. 10 equal
the workspace solutions; 5 are other versions of solved challenges. Delete them when you no longer need them.

## License

Code: MIT (see `LICENSE`).
