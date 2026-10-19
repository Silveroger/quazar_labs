import {
  adminUser,
  bucket,
  database,
  json,
  sameOrigin,
  snapshot,
} from "@/lib/server";
import { MAX_FILE_SIZE, validateUpload } from "@/lib/uploads";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!(await adminUser()))
    return json({ error: "Administrator access required." }, 403);
  if (!sameOrigin(request))
    return json({ error: "Invalid request origin." }, 403);
  try {
    const limit = MAX_FILE_SIZE + 64 * 1024;
    if (Number(request.headers.get("content-length")) > limit)
      return json({ error: "Choose a file of 25 MB or less." }, 413);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Choose a file to upload." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        return json({ error: "Choose a file of 25 MB or less." }, 413);
      }
      chunks.push(value);
    }
    const joined = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      joined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const form = await new Response(joined, {
      headers: { "Content-Type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file");
    const kind = String(form.get("kind"));
    const target = String(form.get("targetId"));
    if (
      !file ||
      typeof file === "string" ||
      !["image", "resource"].includes(kind)
    )
      return json({ error: "Choose a supported file and destination." }, 400);
    const { document } = await snapshot();
    const exists =
      kind === "image"
        ? document.founders.some((f) => f.id === target)
        : document.courses.some((c) =>
            c.tracks.some((t) =>
              t.modules.some((m) => m.lessons.some((l) => l.id === target)),
            ),
          );
    if (!exists)
      return json(
        { error: "Save this lesson or founder before uploading a file." },
        400,
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    let validated;
    try {
      validated = validateUpload(file.name, bytes, kind);
    } catch (error) {
      return json({ error: (error as Error).message }, 400);
    }
    const id = crypto.randomUUID();
    const key = `${kind}/${id}.${validated.extension}`;
    await bucket().put(key, bytes, {
      httpMetadata: { contentType: validated.mime },
    });
    try {
      await database()
        .prepare(
          "INSERT INTO assets (id, object_key, name, mime, size, kind, target_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          id,
          key,
          validated.name,
          validated.mime,
          bytes.length,
          kind,
          target,
          new Date().toISOString(),
        )
        .run();
    } catch (error) {
      await bucket().delete(key);
      throw error;
    }
    return json(
      { id, name: validated.name, mime: validated.mime, size: bytes.length },
      201,
    );
  } catch (error) {
    console.error("Upload failed", error);
    return json(
      { error: "The upload failed. Please choose the file again and retry." },
      500,
    );
  }
}
