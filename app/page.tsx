import {
  ArrowRight,
  Code2,
  Lightbulb,
  Shapes,
  Presentation,
  Plus,
} from "lucide-react";
import Link from "@/components/link";
import HeroLab from "@/components/hero-lab";
import {
  ButtonLink,
  CourseCard,
  Eyebrow,
  Founders,
  NextStep,
  TextArrow,
} from "@/components/site";
import { readPublic } from "@/lib/server";
export const dynamic = "force-dynamic";
const faqs = [
  [
    "Do I need to know how to code?",
    "You can start with curiosity. The Junior track introduces the basics step by step. The Senior track explores deeper technical workflows, with concepts explained along the way.",
  ],
  [
    "Are the recorded courses really free?",
    "Yes. Published recorded lessons and their teaching materials are free to access, with no student account required. Live teaching is arranged separately and is not booked through this website.",
  ],
  [
    "What will I need to get started?",
    "A laptop or desktop, an internet connection, and time to try things out. Individual lessons will explain any tools you need to set up.",
  ],
  [
    "When can I watch the lessons?",
    "We’re preparing our first recordings. The full learning path is available to explore now, and each lesson will become watchable as it is published.",
  ],
  [
    "Can I download the teaching slides?",
    "Yes. Where a published lesson includes slides, you can download the PPT, PPTX, or PDF files from that lesson’s page.",
  ],
  [
    "Is Quazar Labs running a hackathon?",
    "This course prepares you for hackathons through practical building and project presentation. We are not announcing or organising a hackathon through this programme.",
  ],
];
export default async function Home() {
  const data = await readPublic();
  const course = data.courses[0];
  const stages = [
    [Lightbulb, "A spark of an idea", "Find a problem worth solving.", "Project thinking"],
    [Shapes, "A first prototype", "Make a small version. Try it out.", "Developer tools & AI"],
    [Code2, "A working project", "Understand it. Improve it. Own it.", "APIs & data"],
    [Presentation, "A story to share", "Explain what you built and why.", "Confident pitching"],
  ] as const;
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <Eyebrow>BIG IDEAS START SMALL</Eyebrow>
            <h1>
              Turn your ideas <br />
              into{" "}
              <span className="highlight-word">
                working
                <svg
                  viewBox="0 0 410 17"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M4 11 Q180 -2 405 7 M19 15 Q200 4 386 12" />
                </svg>
              </span>
              <br />
              projects<span className="orange">.</span>
            </h1>
            <p>
              Learn to build with code, think with curiosity, and bring
              something of your own into the world.
            </p>
            <div className="hero-actions">
              <ButtonLink
                href={course ? `/courses/${course.slug}` : "/courses"}
              >
                Explore the course
              </ButtonLink>
              <Link href="/about" className="quiet-link">
                Meet your mentors <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-footnote">
              <span>
                <i />
                For students in Grades 7–10
              </span>
              <span className="footnote-divider" />
              <span>Free recorded learning</span>
            </div>
          </div>
          <HeroLab />
        </div>
      </section>
      <section className="section journey">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>THE WAY WE LEARN</Eyebrow>
              <h2>
                Less wondering.
                <br />
                More <span className="blue">“I made that.”</span>
              </h2>
            </div>
            <p>
              You don’t have to know everything to start.
              <br />
              You learn by making something, understanding it,
              <br className="desktop-only" /> and making it a little better.
            </p>
          </div>
          <div className="journey-steps">
            {stages.map(([Icon, title, text, skill], i) => (
              <div className="journey-step" key={title}>
                <div className="step-top">
                  <span className={`step-icon step-${i}`}>
                    <Icon size={26} />
                  </span>
                  <span className="step-number">0{i + 1}</span>
                  {i < 3 && <ArrowRight className="step-arrow" size={20} />}
                </div>
                <h3>{title}</h3>
                <p>{text}</p><span className="journey-skill">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section course-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>YOUR STARTING POINT</Eyebrow>
              <h2>
                A first course.
                <br />A whole new way to think.
              </h2>
            </div>
            {data.courses.length > 1 && (<TextArrow href="/courses">Explore all courses</TextArrow>)}
          </div>
          {course ? (
            <CourseCard course={course} />
          ) : (
            <div className="empty-state">
              New learning paths are in the works. Check back soon.
            </div>
          )}
        </div>
      </section>
      <section className="section founder-section">
        <div className="container founder-grid">
          <div>
            <Eyebrow>MEET YOUR MENTORS</Eyebrow>
            <h2>
              Students today.
              <br />
              Builders always.
            </h2>
            <p>
              We’re Eshan and Chirag, students at Punjab Engineering College.
              We’re building Quazar Labs to share a practical way into
              software—and the things we learn along the way.
            </p>
            <p>
              Approachable lessons. Ideas you can try.
              <br />
              And plenty of room to ask “what if?”
            </p>
            <TextArrow href="/about">A little more about us</TextArrow>
          </div>
          <Founders founders={data.founders} />
        </div>
      </section>
      <section className="section faq-section">
        <div className="container faq-grid">
          <div>
            <Eyebrow>A FEW GOOD QUESTIONS</Eyebrow>
            <h2>
              Curious about
              <br />
              the details?
            </h2>
            <p>Here’s a little more before you begin.</p>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={19} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <NextStep />
    </>
  );
}
