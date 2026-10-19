import Link from "@/components/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen, Layers, Monitor, Check } from "lucide-react";
import { adminUser, readPublic, snapshot } from "@/lib/server";
import {
  CourseArtwork,
  Eyebrow,
  OutcomeList,
  StatusPill,
} from "@/components/site";
import { publishedLessons } from "@/lib/content";
import Curriculum from "@/components/curriculum";
type Props = {
  params: Promise<{ course: string }>;
  searchParams: Promise<{ track?: string; preview?: string }>;
};
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const p = await params;
  const q = await searchParams;
  const c = (await readPublic()).courses.find((c) => c.slug === p.course);
  return {
    title: c?.title || "Course",
    description: c?.description,
    robots: q.preview ? { index: false, follow: false } : undefined,
  };
}
export default async function CoursePage({ params, searchParams }: Props) {
  const p = await params;
  const q = await searchParams;
  const preview = q.preview === "1";
  if (preview && !(await adminUser())) notFound();
  const data = preview ? (await snapshot()).document : await readPublic();
  const course = data.courses.find((c) => c.slug === p.course);
  if (!course) notFound();
  return (
    <>
      {preview && (
        <div className="preview-banner">
          Private content preview <Link href="/admin">Back to editor →</Link>
        </div>
      )}
      <section className="course-hero">
        <div className="container">
          <Link href="/courses" className="back-link">
            <ArrowLeft size={15} />
            All courses
          </Link>
          <div className="course-hero-grid">
            <div>
              <Eyebrow>FROM CURIOUS TO CAPABLE</Eyebrow>
              <h1>
                {course.title}
                <span className="orange">.</span>
              </h1>
              <h2>{course.subtitle}</h2>
              <p>{course.description}</p>
              <StatusPill
                available={course.tracks.some(
                  (t) => publishedLessons(t).length > 0,
                )}
              />
              <div className="course-hero-facts">
                <span>
                  <Layers size={16} />
                  {course.tracks.length} tracks
                </span>
                <span>
                  <BookOpen size={16} />
                  Learn at your pace
                </span>
                <span>
                  <Check size={16} />
                  Free recordings
                </span>
              </div>
            </div>
            <CourseArtwork />
          </div>
        </div>
      </section>
      <div className="container course-body">
        <div className="course-about">
          <div>
            <Eyebrow>WHAT YOU’LL WORK TOWARDS</Eyebrow>
            <h2>
              An idea you can
              <br />
              actually show.
            </h2>
            <p>
              Build practical skills as you work towards a set of connected
              project outputs.
            </p>
            <OutcomeList outcomes={course.outcomes} />
          </div>
          <aside className="prerequisite-card">
            <Monitor size={28} />
            <h3>
              Bring your curiosity.
              <br />
              And your laptop.
            </h3>
            <p>{course.prerequisites}</p>
            <div className="instructor-small">
              {data.founders.slice(0, 2).map((f) => (
                <span key={f.id}>{f.initials}</span>
              ))}
              <p>
                Taught by Eshan & Chirag
                <br />
                <Link href="/about">Meet your instructors ↗</Link>
              </p>
            </div>
          </aside>
        </div>
        <Curriculum course={course} initialTrack={q.track} preview={preview} />
        <div className="course-endnote">
          <span>✳</span>
          <p>
            Learning to build is a process.
            <br />
            <strong>Give yourself room to experiment.</strong>
          </p>
        </div>
      </div>
    </>
  );
}
