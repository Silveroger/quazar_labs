import Link from "@/components/link";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Terminal,
  GitBranch,
  Layers,
  Code2,
  Braces,
  Globe,
  Check,
  FileCode2,
} from "lucide-react";
import type { Founder, Course } from "@/lib/content";
import { publishedLessons } from "@/lib/content";

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      quazar<span className="wordmark-labs">labs</span>
      <span className="brand-dot">.</span>
    </span>
  );
}
export function Header() {
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link href="/" aria-label="Quazar Labs home">
          <Wordmark />
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/courses">Courses</Link>
          <Link href="/about">Our story</Link>
          <Link className="nav-cta" href="/courses/hackathon-foundations">
            Explore the course <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div>
          <Link href="/" aria-label="Quazar Labs home">
            <Wordmark />
          </Link>
          <p>A little curiosity. A lot of possibility.</p>
        </div>
        <div className="footer-links">
          <Link href="/courses">Courses</Link>
          <Link href="/about">Our story</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Quazar Labs</span>
        <span>
          Made for the next generation of builders{" "}
          <span className="orange">✳</span>
        </span>
      </div>
    </footer>
  );
}
export function ButtonLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      className={`button ${secondary ? "button-secondary" : ""}`}
      href={href}
    >
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function Eyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}>
      <span />
      {children}
    </p>
  );
}
export const moduleIcons = [
  Terminal,
  Sparkles,
  Layers,
  Braces,
  GitBranch,
  FileCode2,
];
export function StatusPill({ available = false }: { available?: boolean }) {
  return (
    <span className={`status-pill ${available ? "available" : ""}`}>
      <span />
      {available ? "Lessons available" : "Recordings coming soon"}
    </span>
  );
}
export function CourseArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`course-art ${compact ? "compact" : ""}`}
      aria-hidden="true"
    >
      <div className="art-grid" />
      <span className="art-coordinate">QUAZAR / BUILD_01</span>
      <div className="art-code">
        <Code2 />
        <span>idea.tsx</span>
        <span className="art-line" />
        <div>
          <span className="code-purple">const</span> future ={" "}
          <span className="code-yellow">build</span>(idea);
        </div>
      </div>
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-block block-one">
        <Terminal size={32} />
      </div>
      <div className="art-block block-two">
        <Braces size={35} />
      </div>
      <span className="art-star">✳</span>
      <span className="art-bottom">THINK IT. MAKE IT.</span>
      <span className="art-arrow">↗</span>
    </div>
  );
}
export function CourseCard({ course }: { course: Course }) {
  const available = course.tracks.some((t) => publishedLessons(t).length);
  return (
    <article className="featured-course">
      <Link
        href={`/courses/${course.slug}`}
        className="featured-art"
        aria-label={`Explore ${course.title}`}
      >
        <CourseArtwork />
      </Link>
      <div className="featured-copy">
        <div className="course-kicker">
          <span>THE QUAZAR CURRICULUM</span>
          <StatusPill available={available} />
        </div>
        <h3>
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>
        <p>{course.description}</p>
        <div className="course-facts">
          <span>
            <Layers size={16} />
            {course.tracks.length} learning tracks
          </span>
          <span>
            <Code2 size={16} />
            Beginner friendly
          </span>
          <span>
            <Globe size={16} />
            Free recorded lessons
          </span>
        </div>
        <ButtonLink href={`/courses/${course.slug}`}>
          Explore the curriculum
        </ButtonLink>
      </div>
    </article>
  );
}
export function Founders({
  founders,
  full = false,
}: {
  founders: Founder[];
  full?: boolean;
}) {
  return (
    <div className={`founders ${full ? "founders-full" : ""}`}>
      {founders.map((f, i) => (
        <article className="founder" key={f.id}>
          <div className={`founder-photo founder-photo-${i % 2}`}>
            {f.photoId ? (
              <img src={`/api/files/${f.photoId}`} alt={f.name} />
            ) : (
              <>
                <span className="portrait-orbit" />
                <span className="founder-initials">{f.initials}</span>
                <span className="portrait-label">
                  THE PEOPLE BEHIND THE LAB
                </span>
                <span className="portrait-spark" aria-hidden="true">
                  {i % 2 ? "↗" : "✳"}
                </span>
              </>
            )}
          </div>
          <div className="founder-text">
            <h3>{f.name}</h3>
            <p className="founder-role">{f.role}</p>
            {full && <p>{f.bio}</p>}
            <span className="pec-label">
              Student at Punjab Engineering College
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
export function OutcomeList({ outcomes }: { outcomes: string[] }) {
  return (
    <ul className="outcome-list">
      {outcomes.map((item) => (
        <li key={item}>
          <span>
            <Check size={15} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
export function NextStep() {
  return (
    <section className="next-step">
      <div className="container next-step-inner">
        <div>
          <Eyebrow light>YOUR NEXT CHAPTER</Eyebrow>
          <h2>
            Every builder starts
            <br />
            with a first project.
          </h2>
        </div>
        <ButtonLink href="/courses/hackathon-foundations">
          Find your starting point
        </ButtonLink>
        <span className="next-star" aria-hidden="true">
          ✳
        </span>
      </div>
    </section>
  );
}
export function TextArrow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowRight size={18} />
    </Link>
  );
}
