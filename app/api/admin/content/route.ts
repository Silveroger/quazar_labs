import { contentSchema } from "@/lib/content";
import {
  adminUser,
  boundedText,
  database,
  json,
  sameOrigin,
  snapshot,
} from "@/lib/server";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await adminUser()))
    return json({ error: "Administrator access required." }, 403);
  return json(await snapshot());
}
export async function PUT(request: Request) {
  if (!(await adminUser()))
    return json({ error: "Administrator access required." }, 403);
  if (!sameOrigin(request))
    return json({ error: "Invalid request origin." }, 403);
  try {
    const body = await boundedText(request);
    if (body.length > 1500000)
      return json({ error: "The content update is too large." }, 413);
    const input = JSON.parse(body);
    const parsed = contentSchema.safeParse(input.document);
    if (!parsed.success)
      return json(
        {
          error: parsed.error.issues
            .map((x) => `${x.path.join(".")}: ${x.message}`)
            .slice(0, 5)
            .join("\n"),
        },
        400,
      );
    if (!Number.isSafeInteger(input.revision) || input.revision < 0)
      return json({ error: "Invalid content revision." }, 400);
    const refs = parsed.data.courses.flatMap((c) =>
      c.tracks.flatMap((t) =>
        t.modules.flatMap((m) =>
          m.lessons.flatMap((l) =>
            l.resources.map((r) => ({ ...r, target: l.id, kind: "resource" })),
          ),
        ),
      ),
    );
    for (const ref of refs) {
      const asset = await database()
        .prepare(
          "SELECT id FROM assets WHERE id = ? AND target_id = ? AND kind = ? AND name = ? AND size = ? AND mime = ?",
        )
        .bind(ref.id, ref.target, ref.kind, ref.name, ref.size, ref.mime)
        .first();
      if (!asset)
        return json(
          {
            error:
              "A lesson references an invalid teaching file. Upload the file again.",
          },
          400,
        );
    }
    for (const founder of parsed.data.founders)
      if (founder.photoId) {
        const asset = await database()
          .prepare(
            "SELECT id FROM assets WHERE id = ? AND target_id = ? AND kind = ?",
          )
          .bind(founder.photoId, founder.id, "image")
          .first();
        if (!asset)
          return json(
            { error: "A founder photo is invalid. Upload the photo again." },
            400,
          );
      }
    const result = await database()
      .prepare(
        "INSERT INTO content (id, document, revision, updated_at) SELECT 1, ?, 1, ? WHERE ? = 0 ON CONFLICT(id) DO NOTHING",
      )
      .bind(
        JSON.stringify(parsed.data),
        new Date().toISOString(),
        input.revision,
      )
      .run();
    if (!result.meta.changes) {
      const update = await database()
        .prepare(
          "UPDATE content SET document = ?, revision = revision + 1, updated_at = ? WHERE id = 1 AND revision = ?",
        )
        .bind(
          JSON.stringify(parsed.data),
          new Date().toISOString(),
          input.revision,
        )
        .run();
      if (!update.meta.changes)
        return json(
          {
            error:
              "Another editor saved changes. Reload the editor before saving again.",
          },
          409,
        );
    }
    return json({ document: parsed.data, revision: input.revision + 1 });
  } catch (error) {
    if (error instanceof RangeError) return json({ error: error.message }, 413);
    if (error instanceof SyntaxError)
      return json({ error: "The content update was not valid JSON." }, 400);
    console.error("Content save failed", error);
    return json(
      { error: "Could not save your changes. Check the fields and try again." },
      500,
    );
  }
}
