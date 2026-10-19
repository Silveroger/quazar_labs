import test from "node:test";
import assert from "node:assert/strict";
import {
  contentSchema,
  publicContent,
  parseYouTube,
  assetIsPublic,
  isAllowedAdmin,
  publishedLessons,
} from "../lib/content.ts";
import { seedContent } from "../lib/seed.ts";
import { validateUpload, MAX_FILE_SIZE } from "../lib/uploads.ts";

test("launch has two distinct tracks with six modules and twelve upcoming lessons each", () => {
  assert.equal(contentSchema.safeParse(seedContent).success, true);
  assert.equal(seedContent.courses.length, 1);
  assert.equal(seedContent.courses[0].tracks.length, 2);
  for (const track of seedContent.courses[0].tracks) {
    assert.equal(track.modules.length, 6);
    assert.equal(track.modules.flatMap((m) => m.lessons).length, 12);
    assert.equal(publishedLessons(track).length, 0);
  }
  assert.notEqual(
    seedContent.courses[0].tracks[0].modules[0].lessons[0].title,
    seedContent.courses[0].tracks[1].modules[0].lessons[0].title,
  );
});
test("only genuine YouTube URLs or video IDs are accepted", () => {
  for (const url of [
    "https://youtu.be/M7lc1UVf-VE?t=10",
    "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    "https://www.youtube.com/embed/M7lc1UVf-VE",
    "https://youtube.com/shorts/M7lc1UVf-VE",
    "M7lc1UVf-VE",
  ])
    assert.equal(parseYouTube(url), "M7lc1UVf-VE");
  for (const url of [
    "https://youtube.com.attacker.test/watch?v=M7lc1UVf-VE",
    "javascript:alert(1)",
    "https://example.org/M7lc1UVf-VE",
    "https://youtube.com/watch?v=invalid",
  ])
    assert.equal(parseYouTube(url), "");
});
test("public projections strip draft hierarchies, upcoming videos, and resources", () => {
  const doc = structuredClone(seedContent);
  const c = doc.courses[0];
  const t = c.tracks[0];
  const l = t.modules[0].lessons[0];
  l.youtubeId = "M7lc1UVf-VE";
  l.resources = [
    { id: "asset", name: "slides.pdf", size: 10, mime: "application/pdf" },
  ];
  let visible = publicContent(doc);
  assert.equal(
    visible.courses[0].tracks[0].modules[0].lessons[0].youtubeId,
    "",
  );
  assert.equal(
    visible.courses[0].tracks[0].modules[0].lessons[0].resources.length,
    0,
  );
  l.status = "published";
  assert.equal(
    assetIsPublic(doc, { id: "asset", kind: "resource", target_id: l.id }),
    true,
  );
  l.status = "draft";
  assert.equal(
    assetIsPublic(doc, { id: "asset", kind: "resource", target_id: l.id }),
    false,
  );
  l.status = "published";
  t.modules[0].status = "draft";
  assert.equal(
    assetIsPublic(doc, { id: "asset", kind: "resource", target_id: l.id }),
    false,
  );
  t.modules[0].status = "upcoming";
  t.status = "draft";
  assert.equal(
    assetIsPublic(doc, { id: "asset", kind: "resource", target_id: l.id }),
    false,
  );
  t.status = "upcoming";
  c.status = "draft";
  assert.equal(publicContent(doc).courses.length, 0);
});
test("published lessons require a video and route slugs must be unique", () => {
  const doc = structuredClone(seedContent);
  doc.courses[0].tracks[0].modules[0].lessons[0].status = "published";
  assert.equal(contentSchema.safeParse(doc).success, false);
  doc.courses[0].tracks[0].modules[0].lessons[0].youtubeId = "M7lc1UVf-VE";
  assert.equal(contentSchema.safeParse(doc).success, true);
  doc.courses[0].tracks[0].modules[1].lessons[0].slug = "lesson-1";
  assert.equal(contentSchema.safeParse(doc).success, false);
});
test("founder access defaults to denied and requires an explicitly allowed identity", () => {
  const user = { userId: "founder1", email: "founder@example.com" };
  assert.equal(isAllowedAdmin(null, "founder1"), false);
  assert.equal(isAllowedAdmin(user), false);
  assert.equal(isAllowedAdmin(user, "someone-else"), false);
  assert.equal(isAllowedAdmin(user, "founder1"), true);
  assert.equal(isAllowedAdmin(user, "", "FOUNDER@example.com"), true);
});
test("uploads reject executable, disguised, empty, and oversized content", () => {
  assert.equal(
    validateUpload(
      "slides.pdf",
      new TextEncoder().encode("%PDF-1.4\n%%EOF"),
      "resource",
    ).mime,
    "application/pdf",
  );
  assert.throws(() =>
    validateUpload(
      "slides.pdf",
      new TextEncoder().encode("<html>bad</html>"),
      "resource",
    ),
  );
  assert.throws(() =>
    validateUpload("slides.exe", new Uint8Array([77, 90]), "resource"),
  );
  assert.throws(() =>
    validateUpload("picture.svg", new TextEncoder().encode("<svg/>"), "image"),
  );
  assert.throws(() =>
    validateUpload("slides.pdf", new Uint8Array(0), "resource"),
  );
  assert.throws(() =>
    validateUpload("slides.pdf", new Uint8Array(MAX_FILE_SIZE + 1), "resource"),
  );
});
