import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy" };
export default function Privacy() {
  return (
    <article className="container prose-page">
      <p className="eyebrow">
        <span />
        THE DETAILS
      </p>
      <h1>Your privacy</h1>
      <p>
        Quazar Labs provides free recorded learning without requiring a student
        account. This version of the website does not collect enquiries, accept
        payments, run advertising, or use an analytics service.
      </p>
      <h2>Watching lessons</h2>
      <p>
        Videos are hosted on YouTube. A YouTube player is loaded only when you
        choose to load a lesson video. We use the privacy-enhanced embed domain.
        Once loaded, YouTube receives information needed to deliver its player,
        including network and device information, and its own policies apply.
      </p>
      <p>
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read Google’s privacy policy ↗
        </a>
      </p>
      <h2>Website hosting</h2>
      <p>
        Hosting providers process technical request information, such as IP
        addresses and requested pages, to deliver and protect the website.
        Teaching materials are stored by our hosting provider and downloaded
        when you request them.
      </p>
      <h2>Founder administration</h2>
      <p>
        The private editor uses ChatGPT sign-in to identify authorised founders.
        The site checks their account identity before allowing changes. Students
        do not need to use this sign-in.
      </p>
      <h2>Files and recordings</h2>
      <p>
        Published lessons and their downloadable resources are publicly
        accessible. Quazar Labs does not store student learning histories or
        track course completion.
      </p>
    </article>
  );
}
