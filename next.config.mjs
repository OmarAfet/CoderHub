import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

// Where the site is served. It is a Next.js zone (multi-zones) under
// /coderhub on the personal site: omarafet.vercel.app rewrites /coderhub/*
// to this app (CODERHUB_ORIGIN there). When it moves to its own domain, set
// basePath to '' and siteUrl to the new origin.
const site = {
  basePath: "/coderhub",
  siteUrl: "https://omarafet.vercel.app",
  homeUrl: "https://omarafet.vercel.app",
  // The repo is public (OmarAfet/CoderHub), so the GitHub links work.
  repoPublic: true,
  // Indexed from the first deploy: the pages hold accepted code, not
  // placeholders (user, 2026-10-19).
  indexable: true,
};

/** @type {import('next').NextConfig} */
const config = {
  basePath: site.basePath,
  env: {
    SITE_BASE_PATH: site.basePath,
    SITE_URL: site.siteUrl,
    HOME_URL: site.homeUrl,
    REPO_PUBLIC: String(site.repoPublic),
    INDEXABLE: String(site.indexable),
  },
  reactStrictMode: true,
  async headers() {
    // Covers every response (pages, llms.txt, images); the robots meta tag in
    // app/layout.tsx covers HTML for crawlers that ignore headers.
    return site.indexable
      ? []
      : [
          {
            source: "/:path*",
            headers: [{ key: "X-Robots-Tag", value: "noindex" }],
          },
        ];
  },
  async redirects() {
    // The deployment's own root URL would otherwise be a bare 404.
    return site.basePath
      ? [
          {
            source: "/",
            destination: site.basePath,
            basePath: false,
            permanent: false,
          },
        ]
      : [];
  },
};

export default withMDX(config);
