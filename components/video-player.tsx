"use client";
import { useState } from "react";
import { Play, ArrowUpRight } from "lucide-react";
export default function VideoPlayer({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div>
      <div className="video-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0`}
            title={title}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button className="video-cover" onClick={() => setPlaying(true)}>
            <span className="video-brand">QUAZAR LABS / CLASSROOM</span>
            <span className="play-circle">
              <Play size={30} fill="currentColor" />
            </span>
            <strong>{title}</strong>
            <span>Load video player</span>
            <small>Loads an embedded player from YouTube</small>
          </button>
        )}
      </div>
      <p className="video-fallback">
        Trouble playing the lesson?{" "}
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch on YouTube <ArrowUpRight size={13} />
        </a>
      </p>
    </div>
  );
}
