import assert from "node:assert/strict";
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:5173";
if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname))
  throw new Error(
    "Integration tests only run against a local development server.",
  );
const request = (path, options = {}) => fetch(origin + path, options);
const denied = await request("/api/admin/content");
assert.equal(denied.status, 403);
const login = await request("/signin-with-chatgpt?return_to=/admin", {
  redirect: "manual",
});
const cookie = login.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie, "Local sign-in cookie should be issued");
const headers = {
  Cookie: cookie,
  Origin: origin,
  "Content-Type": "application/json",
};
const get = async () => {
  const r = await request("/api/admin/content", {
    headers: { Cookie: cookie },
  });
  assert.equal(r.status, 200);
  return r.json();
};
let current = await get();
const original = structuredClone(current.document);
let asset;
async function save(document, revision = current.revision) {
  const r = await request("/api/admin/content", {
    method: "PUT",
    headers,
    body: JSON.stringify({ document, revision }),
  });
  if (r.ok) current = await r.json();
  return r;
}
try {
  let response = await request("/api/admin/content", {
    method: "PUT",
    headers: { ...headers, Origin: "https://untrusted.example" },
    body: JSON.stringify(current),
  });
  assert.equal(response.status, 403);
  const invalid = structuredClone(original);
  invalid.courses[0].tracks[0].modules[0].lessons[0].status = "published";
  response = await save(invalid);
  assert.equal(response.status, 400);
  response = await save(original);
  assert.equal(response.status, 200);
  response = await save(original, current.revision - 1);
  assert.equal(response.status, 409);
  const lessonId = original.courses[0].tracks[0].modules[0].lessons[0].id;
  const file = new FormData();
  file.append("kind", "resource");
  file.append("targetId", lessonId);
  file.append(
    "file",
    new Blob(["%PDF-1.4\n% local integration fixture\n%%EOF"], {
      type: "application/pdf",
    }),
    "test-slides.pdf",
  );
  response = await request("/api/admin/upload", {
    method: "POST",
    headers: { Cookie: cookie, Origin: origin },
    body: file,
  });
  assert.equal(response.status, 201);
  asset = await response.json();
  response = await request("/api/files/" + asset.id);
  assert.equal(response.status, 404);
  const published = structuredClone(current.document);
  const lesson = published.courses[0].tracks[0].modules[0].lessons[0];
  lesson.youtubeId = "M7lc1UVf-VE";
  lesson.status = "published";
  lesson.resources = [asset];
  response = await save(published);
  assert.equal(response.status, 200);
  response = await request("/courses/hackathon-foundations/junior/lesson-1");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes("Load video player"));
  assert.ok(html.includes("test-slides.pdf"));
  response = await request("/api/files/" + asset.id);
  assert.equal(response.status, 200);
  assert.ok(
    response.headers.get("content-disposition").startsWith("attachment"),
  );
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  const draft = structuredClone(current.document);
  draft.courses[0].tracks[0].modules[0].lessons[0].status = "draft";
  response = await save(draft);
  assert.equal(response.status, 200);
  response = await request("/api/files/" + asset.id);
  assert.equal(response.status, 404);
  response = await request("/courses/hackathon-foundations/junior/lesson-1");
  assert.equal(response.status, 404);
  response = await request(
    "/courses/hackathon-foundations/junior/lesson-1?preview=1",
  );
  assert.equal(response.status, 404);
  response = await request(
    "/courses/hackathon-foundations/junior/lesson-1?preview=1",
    { headers: { Cookie: cookie } },
  );
  assert.equal(response.status, 200);
  const forged = structuredClone(original);
  forged.courses[0].tracks[1].modules[0].lessons[0].resources = [asset];
  response = await save(forged);
  assert.equal(response.status, 400);
  console.log(
    "PASS: admin authentication, origin protection, publication validation, revision conflicts, uploads, public downloads, unpublishing, draft preview, resource ownership.",
  );
} finally {
  current = await get();
  const restored = await save(original);
  assert.equal(restored.status, 200, "Restore original curriculum");
  console.log(
    "Original upcoming curriculum restored; test upload is unreferenced and private.",
  );
}
