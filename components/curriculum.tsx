"use client";
import { useState } from "react";
import Link from "@/components/link";
import { ArrowUpRight, ChevronDown, CirclePlay, Clock3 } from "lucide-react";
import { type Course, lessonPath, publishedLessons } from "@/lib/content";
import { moduleIcons } from "./site";
export default function Curriculum({
  course,
  initialTrack,
  preview = false,
}: {
  course: Course;
  initialTrack?: string;
  preview?: boolean;
}) {
  const [selected, setSelected] = useState(
    initialTrack || course.tracks[0]?.slug,
  );
  const track =
    course.tracks.find((t) => t.slug === selected) || course.tracks[0];
  if (!track)
    return (
      <div className="empty-state">
        This course’s learning tracks are being prepared.
      </div>
    );
  const playable = publishedLessons(track);
  return (
    <div id="curriculum" className="curriculum">
      <div className="curriculum-heading">
        <div>
          <p className="eyebrow">
            <span />
            THE LEARNING PATH
          </p>
          <h2>Your learning path.</h2>
        </div>
        <div
          className="track-switch"
          role="group"
          aria-label="Choose your learning track"
        >
          {course.tracks.map((t) => (
            <button
              key={t.id}
              aria-pressed={track.id === t.id}
              onClick={() => {
                setSelected(t.slug);
                const url = new URL(window.location.href);
                url.searchParams.set("track", t.slug);
                window.history.replaceState(null, "", url);
              }}
            >
              <strong>{t.title}</strong>
              <span>{t.grades}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="track-summary">
        <div>
          <h3>{track.approach}</h3>
          <p>{track.description}</p>
        </div>
        <span>
          {track.modules.length} modules <i>·</i>{" "}
          {track.modules.reduce((n, m) => n + m.lessons.length, 0)} planned
          lessons
        </span>
      </div>
      {playable.length > 0 ? (
        <Link
          className="button start-learning"
          href={
            lessonPath(course, track, playable[0]) +
            (preview ? "?preview=1" : "")
          }
        >
          Start learning
          <ArrowUpRight size={18} />
        </Link>
      ) : track.modules[0]?.lessons[0] ? (
        <Link
          className="button start-learning"
          href={
            lessonPath(course, track, track.modules[0].lessons[0]) +
            (preview ? "?preview=1" : "")
          }
        >
          Preview lesson 01
          <ArrowUpRight size={18} />
        </Link>
      ) : (
        <div className="upcoming-notice">
          <Clock3 size={20} />
          <p>
            <strong>Recordings coming soon.</strong> Explore the path now. Watch
            each lesson here as it’s published.
          </p>
        </div>
      )}
      <div className="modules" key={track.id}>
        {track.modules.map((m, i) => {
          const Icon = moduleIcons[i % moduleIcons.length];
          return (
            <details key={m.id} className="module" open={i === 0}>
              <summary>
                <span className="module-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="module-icon">
                  <Icon size={22} />
                </span>
                <span className="module-summary">
                  <strong>{m.title}</strong>
                  <span>{m.description}</span>
                </span>
                <span className="module-count">{m.lessons.length} lessons</span>
                <ChevronDown className="chevron" size={19} />
              </summary>
              <div className="lesson-rows">
                {m.lessons.map((l, j) => {
                  const ready = l.status === "published" && !!l.youtubeId;
                  const content = (
                    <>
                      <CirclePlay size={19} />
                      <span>
                        <small>
                          LESSON{" "}
                          {String(
                            track.modules
                              .slice(0, i)
                              .reduce((n, mod) => n + mod.lessons.length, 0) +
                              j +
                              1,
                          ).padStart(2, "0")}
                        </small>
                        <strong>{l.title}</strong>
                      </span>
                      <span className={`lesson-state ${ready ? "ready" : ""}`}>
                        {preview && l.status === "draft"
                          ? "Draft preview"
                          : ready
                            ? "Watch lesson"
                            : "Coming soon"}
                        <ArrowUpRight size={15} style={{ opacity: ready ? 1 : 0.6 }} />
                      </span>
                    </>
                  );
                  return (
                    <Link
                      key={l.id}
                      className={`lesson-row ${ready ? "" : "upcoming"}`}
                      href={
                        lessonPath(course, track, l) +
                        (preview ? "?preview=1" : "")
                      }
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
