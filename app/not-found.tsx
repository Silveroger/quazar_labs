import { ButtonLink, Eyebrow } from "@/components/site";
export default function NotFound() {
  return (
    <section className="container error-page">
      <Eyebrow>404 / A SMALL DETOUR</Eyebrow>
      <h1>
        This page is
        <br />
        still off the map.
      </h1>
      <p>The link may have changed, or this content isn’t published yet.</p>
      <ButtonLink href="/courses">Back to the courses</ButtonLink>
    </section>
  );
}
