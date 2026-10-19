import { siteOrigin } from "@/lib/server";
export async function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\nDisallow: /*?preview=1\nSitemap: ${siteOrigin()}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain" } },
  );
}
