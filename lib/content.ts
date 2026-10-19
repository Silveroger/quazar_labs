import { z } from "zod";

const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
const slug = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const title = z.string().trim().min(1).max(160);
const description = z.string().trim().max(6000);
const status = z.enum(["draft", "upcoming", "published"]);
const list = z
  .array(z.string().trim().max(500))
  .max(20)
  .transform((items) => items.filter(Boolean));
const resourceSchema = z.object({
  id,
  name: title,
  size: z.number().int().positive(),
  mime: z.string().max(100),
});
const lessonSchema = z
  .object({
    id,
    slug,
    title,
    description,
    objectives: list,
    status,
    youtubeId: z.string().regex(/^$|^[a-zA-Z0-9_-]{11}$/),
    resources: z.array(resourceSchema).max(20),
  })
  .refine((l) => l.status !== "published" || !!l.youtubeId, {
    message: "Published lessons need a valid YouTube video.",
    path: ["youtubeId"],
  });
const moduleSchema = z.object({
  id,
  title,
  description,
  status,
  lessons: z.array(lessonSchema).max(100),
});
const trackSchema = z.object({
  id,
  slug,
  title,
  grades: title,
  approach: title,
  description,
  status,
  modules: z.array(moduleSchema).max(50),
});
const courseSchema = z.object({
  id,
  slug,
  title,
  subtitle: title,
  description,
  prerequisites: description,
  outcomes: list,
  status,
  tracks: z.array(trackSchema).max(10),
});
const founderSchema = z.object({
  id,
  name: title,
  role: title,
  bio: description,
  initials: z.string().min(1).max(3),
  photoId: z.string().max(100),
});
export const contentSchema = z
  .object({
    courses: z.array(courseSchema).max(50),
    founders: z.array(founderSchema).max(10),
  })
  .superRefine((doc, ctx) => {
    const ids = new Set<string>();
    const checkId = (value: string) => {
      if (ids.has(value))
        ctx.addIssue({
          code: "custom",
          message: "Content IDs must be unique.",
        });
      ids.add(value);
    };
    const checkSlugs = (items: { slug: string }[]) => {
      if (new Set(items.map((x) => x.slug)).size !== items.length)
        ctx.addIssue({
          code: "custom",
          message: "Slugs must be unique within their parent.",
        });
    };
    checkSlugs(doc.courses);
    for (const c of doc.courses) {
      checkId(c.id);
      checkSlugs(c.tracks);
      for (const t of c.tracks) {
        checkId(t.id);
        checkSlugs(t.modules.flatMap((m) => m.lessons));
        for (const m of t.modules) {
          checkId(m.id);
          m.lessons.forEach((l) => checkId(l.id));
        }
      }
    }
    doc.founders.forEach((f) => checkId(f.id));
  });
export type Content = z.infer<typeof contentSchema>;
export type Course = Content["courses"][number];
export type Track = Course["tracks"][number];
export type Module = Track["modules"][number];
export type Lesson = Module["lessons"][number];
export type Resource = Lesson["resources"][number];
export type Founder = Content["founders"][number];
export type Snapshot = { document: Content; revision: number };

export function parseYouTube(value: string): string {
  const input = value.trim();
  if (!input) return "";
  if (/^[\w-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (!["https:", "http:"].includes(url.protocol)) return "";
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const video =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(
              host,
            )
          ? url.pathname === "/watch"
            ? url.searchParams.get("v")
            : /^\/(embed|shorts|live)\//.test(url.pathname)
              ? url.pathname.split("/")[2]
              : ""
          : "";
    return video && /^[\w-]{11}$/.test(video) ? video : "";
  } catch {
    return "";
  }
}
export const publishedLessons = (track: Track) =>
  track.modules
    .filter((m) => m.status !== "draft")
    .flatMap((m) => m.lessons)
    .filter((l) => l.status === "published" && !!l.youtubeId);
export const lessonPath = (course: Course, track: Track, lesson: Lesson) =>
  `/courses/${course.slug}/${track.slug}/${lesson.slug}`;
export const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
export function publicContent(doc: Content): Content {
  return {
    founders: doc.founders,
    courses: doc.courses
      .filter((c) => c.status !== "draft")
      .map((c) => ({
        ...c,
        tracks: c.tracks
          .filter((t) => t.status !== "draft")
          .map((t) => ({
            ...t,
            modules: t.modules
              .filter((m) => m.status !== "draft")
              .map((m) => ({
                ...m,
                lessons: m.lessons
                  .filter((l) => l.status !== "draft")
                  .map((l) =>
                    l.status === "published"
                      ? l
                      : { ...l, youtubeId: "", resources: [] },
                  ),
              })),
          })),
      })),
  };
}
export function assetIsPublic(
  doc: Content,
  asset: { id: string; kind: string; target_id: string },
) {
  const visible = publicContent(doc);
  if (asset.kind === "image")
    return visible.founders.some(
      (f) => f.id === asset.target_id && f.photoId === asset.id,
    );
  return visible.courses.some((c) =>
    c.tracks.some((t) =>
      t.modules.some((m) =>
        m.lessons.some(
          (l) =>
            l.id === asset.target_id &&
            l.status === "published" &&
            l.resources.some((r) => r.id === asset.id),
        ),
      ),
    ),
  );
}
export function isAllowedAdmin(
  user: { userId: string; email: string } | null,
  ids = "",
  emails = "",
) {
  if (!user) return false;
  const values = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return (
    values(ids).includes(user.userId) ||
    values(emails.toLowerCase()).includes(user.email.toLowerCase())
  );
}
