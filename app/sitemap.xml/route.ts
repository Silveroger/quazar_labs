import { readPublic, siteOrigin } from "@/lib/server";
import { lessonPath, publishedLessons } from "@/lib/content";
export const dynamic = "force-dynamic";
export async function GET() {
  const { courses } = await readPublic();
  const paths = [
    "/",
    "/courses",
    "/about",
    "/privacy",
    ...courses.map((c) => `/courses/${c.slug}`),
    ...courses.flatMap((c) =>
      c.tracks.flatMap((t) =>
        publishedLessons(t).map((l) => lessonPath(c, t, l)),
      ),
    ),
  ];
  const origin = siteOrigin().replace(/\/$/, "");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${(origin + path).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</loc></url>`).join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
