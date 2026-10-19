import { adminUser, bucket, database, snapshot } from "@/lib/server";
import { assetIsPublic } from "@/lib/content";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const asset = await database()
    .prepare("SELECT * FROM assets WHERE id = ?")
    .bind(id)
    .first<{
      id: string;
      object_key: string;
      name: string;
      mime: string;
      size: number;
      kind: string;
      target_id: string;
    }>();
  if (!asset) return new Response("File not found.", { status: 404 });
  const { document } = await snapshot();
  if (!assetIsPublic(document, asset) && !(await adminUser()))
    return new Response("File not found.", { status: 404 });
  const object = await bucket().get(asset.object_key);
  if (!object)
    return new Response("This file is unavailable.", { status: 404 });
  return new Response(object.body, {
    headers: {
      "Content-Type": asset.mime,
      "Content-Length": String(asset.size),
      "Content-Disposition": `${asset.kind === "image" ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(asset.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
