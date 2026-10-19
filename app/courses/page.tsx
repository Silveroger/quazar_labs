import type { Metadata } from "next";
import { CourseCard, Eyebrow } from "@/components/site";
import { readPublic } from "@/lib/server";
export const metadata: Metadata = { title: "Courses" };
export const dynamic = "force-dynamic";
export default async function Courses() {
  const data = await readPublic();
  return (
    <>
      <section className="page-intro container">
        <Eyebrow>THE QUAZAR LAB</Eyebrow>
        <h1>
          A little learning.
          <br />A lot of <span className="blue">possibility.</span>
        </h1>
        <p>
          Practical paths for curious minds. Explore the curriculum, choose your
          track, and build something that’s yours.
        </p>
        <div className="intro-meta">
          <span>Grades 7–10</span>
          <span>Free recorded lessons</span>
          <span>No account needed</span>
        </div>
      </section>
      <section className="container library">
        <div className="library-label">
          <span>OUR LEARNING PATHS</span>
          <span>
            {data.courses.length.toString().padStart(2, "0")}{" "}
            {data.courses.length === 1 ? "COURSE" : "COURSES"}
          </span>
        </div>
        {data.courses.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
        {!data.courses.length && (
          <div className="empty-state">
            Our next learning path is being prepared. Check back soon.
          </div>
        )}
        <div className="library-note">
          <span aria-hidden="true">✳</span>
          <p>
            Good things take a little building.
            <br />
            <strong>More learning paths will grow here.</strong>
          </p>
        </div>
      </section>
    </>
  );
}
