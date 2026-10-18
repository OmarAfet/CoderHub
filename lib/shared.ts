import { createGetUrl } from "fumadocs-core/source";

export const appName = "حلولي في كودرهب";
// Set in next.config.mjs (`site`).
export const basePath = process.env.SITE_BASE_PATH ?? "";
export const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
export const homeUrl = process.env.HOME_URL ?? "/";
export const repoPublic = process.env.REPO_PUBLIC === "true";
export const indexable = process.env.INDEXABLE === "true";
// The owner's Discord, for solvers of unsolved challenges (same as ctf-writeups).
export const ownerDiscord = "https://discord.com/users/1067140413657469018";
// Docs are the whole site, so pages live at the root (no /docs prefix).
export const docsRoute = "/";
export const docsImageRoute = "/og/docs";
export const docsContentRoute = "/llms.mdx/docs";

export const gitConfig = {
  user: "OmarAfet",
  repo: "CoderHub",
  branch: "main",
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, "content.md"];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, "image.png"];

  return { segments, url: getImageUrl(segments, page.locale) };
}
