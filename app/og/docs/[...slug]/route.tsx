import { generateOGImage } from "fumadocs-ui/og";
import { notFound } from "next/navigation";
import { getPageImageUrl } from "@/lib/shared";
import { source } from "@/lib/source";

export const revalidate = false;

// The OG renderer cannot shape Arabic yet ("lookupType: 5 - substFormat: 3 is
// not yet supported" at build time, seen in ctf-writeups), so the image uses
// Latin text: the title when it is Latin, else the level and points.
const latin = (s?: string) =>
  s && /^[\u0020-\u024F]*$/.test(s) ? s : undefined;
const capital = (s: string) => s[0].toUpperCase() + s.slice(1);

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/docs/[...slug]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const { level, points } = page.data;
  return generateOGImage({
    title:
      latin(page.data.title) ??
      (level ? `${capital(level)} challenge` : "CoderHub solutions"),
    description:
      latin(page.data.description) ??
      (points !== undefined ? `${points} points` : undefined),
    site: "Omar Afet",
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}
