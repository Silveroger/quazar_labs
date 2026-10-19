import Link from "@/components/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  ChevronDown,
  Play,
  Clock3,
} from "lucide-react";
import { adminUser, readPublic, snapshot } from "@/lib/server";
import { formatBytes, lessonPath, publishedLessons } from "@/lib/content";
import { OutcomeList } from "@/components/site";
import VideoPlayer from "@/components/video-player";
type Props = {
  params: Promise<{ course: string; track: string; lesson: string }>;
  searchParams: Promise<{ preview?: string }>;
};
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const p = await params;
  const q = await searchParams;
  const c = (await readPublic()).courses.find((c) => c.slug === p.course);
  const lesson = c?.tracks
    .find((t) => t.slug === p.track)
    ?.modules.flatMap((m) => m.lessons)
    .find((l) => l.slug === p.lesson);
  return {
    title: lesson?.title || "Lesson",
    description: lesson?.description,
    robots: q.preview ? { index: false, follow: false } : undefined,
  };
}
export default async function LessonPage({ params, searchParams }: Props) {
  const p = await params;
  const q = await searchParams;
  const preview = q.preview === "1";
  if (preview && !(await adminUser())) notFound();
  const doc = preview ? (await snapshot()).document : await readPublic();
  const course = doc.courses.find((c) => c.slug === p.course);
  const track = course?.tracks.find((t) => t.slug === p.track);
  const lesson = track?.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.slug === p.lesson);
  if (!course || !track || !lesson) notFound();
  const available = publishedLessons(track);
  const index = available.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? available[index - 1] : undefined;
  const next = index >= 0 ? available[index + 1] : undefined;
  const suffix = preview ? "?preview=1" : "";
  return (
    <>
      {preview && (
        <div className="preview-banner">
          Private lesson preview · {lesson.status}
          <Link href="/admin">Back to editor →</Link>
        </div>
      )}
      <div className="container lesson-page">
        <Link
          className="back-link"
          href={`/courses/${course.slug}?track=${track.slug}${preview ? "&preview=1" : ""}`}
        >
          <ArrowLeft size={15} />
          {course.title} / {track.title}
        </Link>
        <div className="lesson-layout">
          <div className="lesson-main">
            {lesson.youtubeId && (lesson.status === "published" || preview) ? (
              <VideoPlayer id={lesson.youtubeId} title={lesson.title} />
            ) : (
              <div className="lesson-coming">
                <Clock3 size={32} />
                <h2>This lesson is on its way.</h2>
                <p>The recording will appear here when it’s ready.</p>
              </div>
            )}
            <p className="eyebrow">
              <span />
              {track.grades} · {track.title}
            </p>
            <h1>{lesson.title}</h1>
            <p className="lesson-description">{lesson.description}</p>
            <h2>In this lesson</h2>
            <OutcomeList outcomes={lesson.objectives} />
            <section className="resources">
              <h2>Teaching materials</h2>
              {lesson.resources.length ? (
                lesson.resources.map((r) => (
                  <a
                    className="resource"
                    key={r.id}
                    href={`/api/files/${r.id}`}
                    download
                  >
                    <FileText size={22} />
                    <span>
                      <strong>{r.name}</strong>
                      <small>
                        {r.name.split(".").pop()?.toUpperCase()} ·{" "}
                        {formatBytes(r.size)}
                      </small>
                    </span>
                    <Download size={20} />
                  </a>
                ))
              ) : (
                <p className="muted">
                  No teaching files have been added to this lesson yet.
                </p>
              )}
            </section>
            <div className="lesson-pagination">
              {prev ? (
                <Link href={lessonPath(course, track, prev) + suffix}>
                  <ArrowLeft size={18} />
                  <span>
                    <small>PREVIOUS LESSON</small>
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={lessonPath(course, track, next) + suffix}>
                  <span>
                    <small>NEXT LESSON</small>
                    {next.title}
                  </span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link
                  href={`/courses/${course.slug}?track=${track.slug}${preview ? "&preview=1" : ""}`}
                >
                  <span>Back to the curriculum</span>
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
          <aside className="lesson-sidebar">
            <details open>
              <summary>
                <span>Course lessons</span>
                <ChevronDown size={18} />
              </summary>
              <div className="sidebar-track">
                {track.title} <span>{track.grades}</span>
              </div>
              {track.modules.map((m, i) => (
                <div className="sidebar-module" key={m.id}>
                  <h3>
                    {String(i + 1).padStart(2, "0")} / {m.title}
                  </h3>
                  {m.lessons.map((l) =>
                    l.status === "published" || preview ? (
                      <Link
                        aria-current={l.id === lesson.id ? "page" : undefined}
                        className={l.id === lesson.id ? "active" : ""}
                        key={l.id}
                        href={lessonPath(course, track, l) + suffix}
                      >
                        <Play size={13} />
                        <span>{l.title}</span>
                      </Link>
                    ) : (
                      <div className="sidebar-upcoming" key={l.id}>
                        <Clock3 size={13} />
                        <span>
                          {l.title}
                          <small>Coming soon</small>
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ))}
            </details>
          </aside>
        </div>
      </div>
    </>
  );
}
