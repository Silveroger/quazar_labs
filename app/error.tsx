"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container error-page">
      <p className="eyebrow">A SMALL INTERRUPTION</p>
      <h1>Let’s try that again.</h1>
      <p>
        We couldn’t load this page. Your learning path will be here when the
        connection is back.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
