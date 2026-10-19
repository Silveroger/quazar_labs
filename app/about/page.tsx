import type { Metadata } from "next";
import { Eyebrow, Founders, NextStep } from "@/components/site";
import { readPublic } from "@/lib/server";
export const metadata: Metadata = { title: "Our story" };
export const dynamic = "force-dynamic";
export default async function About() {
  const { founders } = await readPublic();
  return (
    <>
      <section className="container page-intro about-intro">
        <Eyebrow>THE PEOPLE BEHIND THE LAB</Eyebrow>
        <h1>
          Still learning.
          <br />
          Always <span className="blue">building.</span>
        </h1>
        <p>
          Quazar Labs began with a simple idea: learning to build software
          should feel like opening a door.
        </p>
        <span className="about-star" aria-hidden="true">
          ✳
        </span>
      </section>
      <section className="container about-story">
        <div>
          <span className="large-label">01 / OUR WHY</span>
          <h2>
            The best way to understand
            <br />
            an idea is to try building it.
          </h2>
        </div>
        <div>
          <p>
            We’re Eshan Sharma and Chirag Dhama, students at Punjab Engineering
            College. We’re creating a place where younger students can explore
            how software works, experiment with modern tools, and turn a small
            idea into a real project.
          </p>
          <p>
            Our first course, Hackathon Foundations, brings together practical
            app building, thoughtful use of AI, teamwork, and the confidence to
            explain your work.
          </p>
          <p>
            We’ll share recorded lessons and teaching materials here for free,
            so you can revisit a concept, follow along, and learn at your own
            pace.
          </p>
        </div>
      </section>
      <section className="container about-founders">
        <Founders founders={founders} full />
      </section>
      <section className="section philosophy">
        <div className="container">
          <Eyebrow>HOW WE APPROACH LEARNING</Eyebrow>
          <h2>
            Make room for the
            <br />
            “let me try that” moments.
          </h2>
          <div className="philosophy-grid">
            <article>
              <span>01</span>
              <h3>Start with something real.</h3>
              <p>
                A useful button. A small quiz. An everyday problem. Give every
                concept something concrete to connect to.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Understand your tools.</h3>
              <p>
                Use AI to help draft and explore. Read the result, test the
                behaviour, and understand what you change.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Learn to tell the story.</h3>
              <p>
                A project is more useful when you can explain its purpose, its
                moving parts, and the decisions behind it.
              </p>
            </article>
          </div>
        </div>
      </section>
      <NextStep />
    </>
  );
}
