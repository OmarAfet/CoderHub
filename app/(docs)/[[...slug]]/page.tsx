import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallengeBadges } from "@/components/challenge-badges";
import {
  challengeCount,
  countChallenges,
  FolderListing,
  findFolder,
} from "@/components/folder-listing";
import { getMDXComponents } from "@/components/mdx";
import { PendingNotice, UnsolvedNotice } from "@/components/status";
import {
  getPageImageUrl,
  getPageMarkdownUrl,
  gitConfig,
  repoPublic,
} from "@/lib/shared";
import { source } from "@/lib/source";

export default async function Page(props: PageProps<"/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const folder = findFolder(source.getPageTree(), page.url);
  const description =
    page.data.description ??
    (folder ? challengeCount(countChallenges(folder.children)) : undefined);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{description}</DocsDescription>
      <ChallengeBadges
        level={page.data.level}
        points={page.data.points}
        tags={page.data.tags}
        languages={page.data.languages}
        status={page.data.status}
      />
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={
            repoPublic
              ? `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`
              : undefined
          }
        />
      </div>
      <DocsBody>
        {page.data.status === "pending" && <PendingNotice />}
        {page.data.status === "unsolved" && <UnsolvedNotice />}
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
        {folder && <FolderListing folder={folder} url={page.url} />}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    // The home page title is the site name; skip the "%s | site" template there.
    title: page.url === "/" ? { absolute: page.data.title } : page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
