"use client";
import { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Save,
  ExternalLink,
  Upload,
  X,
  BookOpen,
} from "lucide-react";
import {
  type Content,
  type Course,
  type Track,
  type Module,
  type Lesson,
  type Founder,
  type Snapshot,
  type Resource,
  parseYouTube,
  formatBytes,
  lessonPath,
} from "@/lib/content";
type Kind = "course" | "track" | "module" | "lesson" | "founder";
type Selection = { kind: Kind; id: string };
type Entity = Course | Track | Module | Lesson | Founder;
type Found = {
  entity: Entity;
  siblings: Entity[];
  course?: Course;
  track?: Track;
  module?: Module;
};
function locate(doc: Content, selection: Selection): Found | null {
  if (selection.kind === "founder") {
    const founder = doc.founders.find((f) => f.id === selection.id);
    return founder ? { entity: founder, siblings: doc.founders } : null;
  }
  for (const course of doc.courses) {
    if (selection.kind === "course" && course.id === selection.id)
      return { entity: course, siblings: doc.courses, course };
    for (const track of course.tracks) {
      if (selection.kind === "track" && track.id === selection.id)
        return { entity: track, siblings: course.tracks, course, track };
      for (const module of track.modules) {
        if (selection.kind === "module" && module.id === selection.id)
          return {
            entity: module,
            siblings: track.modules,
            course,
            track,
            module,
          };
        const lesson = module.lessons.find((l) => l.id === selection.id);
        if (selection.kind === "lesson" && lesson)
          return {
            entity: lesson,
            siblings: module.lessons,
            course,
            track,
            module,
          };
      }
    }
  }
  return null;
}
function Field({
  label,
  value,
  onChange,
  multiline = false,
  hint = "",
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
  rows?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}{" "}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Status({
  value,
  onChange,
  lesson = false,
}: {
  value: string;
  onChange: (v: string) => void;
  lesson?: boolean;
}) {
  return (
    <label className="field">
      <span>Visibility</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="draft">Draft — private</option>
        <option value="upcoming">Upcoming — public outline</option>
        <option value="published">
          Published{lesson ? " — playable video" : " — public"}
        </option>
      </select>
      <small>
        {lesson
          ? "A published lesson needs a YouTube video. Upcoming lessons show an outline only."
          : "A draft parent also hides every lesson and file inside it."}
      </small>
    </label>
  );
}
export default function AdminEditor({
  initial,
  displayName,
  signOutPath,
}: {
  initial: Snapshot;
  displayName: string;
  signOutPath: string;
}) {
  const [doc, setDoc] = useState(initial.document);
  const [revision, setRevision] = useState(initial.revision);
  const [selection, setSelection] = useState<Selection>({
    kind: "course",
    id: initial.document.courses[0]?.id || "",
  });
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [videoInput, setVideoInput] = useState("");
  const found = locate(doc, selection);
  const entity = found?.entity;
  useEffect(() => {
    if (selection.kind === "lesson")
      setVideoInput(
        (locate(doc, selection)?.entity as Lesson)?.youtubeId || "",
      );
  }, [selection.id]);
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function change(mutator: (next: Content) => void) {
    setDoc((current) => {
      const next = structuredClone(current);
      mutator(next);
      return next;
    });
    setDirty(true);
    setMessage("");
  }
  function field(name: string, value: unknown) {
    change((next) => {
      const target = locate(next, selection)?.entity;
      if (target) Object.assign(target, { [name]: value });
    });
  }
  function move(target: Selection, direction: number) {
    change((next) => {
      const current = locate(next, target);
      if (!current) return;
      const index = current.siblings.findIndex((s) => s.id === target.id);
      const other = index + direction;
      if (other < 0 || other >= current.siblings.length) return;
      [current.siblings[index], current.siblings[other]] = [
        current.siblings[other],
        current.siblings[index],
      ];
    });
  }
  async function persist(
    document: Content,
    expected = revision,
  ): Promise<Snapshot> {
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document, revision: expected }),
    });
    const result = (await response.json()) as Snapshot & { error?: string };
    if (!response.ok)
      throw new Error(result.error || "Could not save your changes.");
    setRevision(result.revision);
    setDoc(result.document);
    setDirty(false);
    return result;
  }
  async function save() {
    setBusy(true);
    setError(false);
    setMessage("");
    try {
      await persist(doc);
      setMessage("Saved. Public content has been updated.");
    } catch (e) {
      setError(true);
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function preview() {
    if (!found?.course) return;
    setBusy(true);
    setMessage("");
    setError(false);
    const previewTab = window.open("about:blank", "_blank");
    if (previewTab) previewTab.opener = null;
    try {
      if (dirty) await persist(doc);
      const url =
        selection.kind === "lesson" && found.track
          ? lessonPath(found.course, found.track, entity as Lesson) +
            "?preview=1"
          : `/courses/${found.course.slug}?preview=1${found.track ? `&track=${found.track.slug}` : ""}`;
      if (previewTab) previewTab.location.href = url;
      else {
        window.location.href = url;
      }
    } catch (e) {
      setError(true);
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function add(kind: Kind) {
    const id = crypto.randomUUID();
    const slug = `${kind}-${id.slice(0, 8)}`;
    change((next) => {
      const parent = locate(next, selection);
      if (kind === "course")
        next.courses.push({
          id,
          slug,
          title: "New course",
          subtitle: "A new learning path.",
          description: "",
          prerequisites: "",
          outcomes: [],
          status: "draft",
          tracks: [],
        });
      if (kind === "track" && parent?.course)
        parent.course.tracks.push({
          id,
          slug,
          title: "New track",
          grades: "Grades 7–10",
          approach: "Build → Understand → Modify",
          description: "",
          status: "draft",
          modules: [],
        });
      if (kind === "module" && parent?.track)
        parent.track.modules.push({
          id,
          title: "New module",
          description: "",
          status: "draft",
          lessons: [],
        });
      if (kind === "lesson" && parent?.module)
        parent.module.lessons.push({
          id,
          slug,
          title: "New lesson",
          description: "",
          objectives: [],
          status: "draft",
          youtubeId: "",
          resources: [],
        });
    });
    setSelection({ kind, id });
    if (kind === "lesson") setVideoInput("");
  }
  async function upload(file: File | undefined, kind: "image" | "resource") {
    if (!file || !entity) return;
    setBusy(true);
    setError(false);
    setMessage("");
    try {
      if (file.size > 25 * 1024 * 1024)
        throw new Error("Choose a file of 25 MB or less.");
      const saved = await persist(doc);
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      form.append("targetId", entity.id);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as Resource & { error?: string };
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      const updated = structuredClone(saved.document);
      const target = locate(updated, selection)!.entity;
      if (kind === "image") (target as Founder).photoId = result.id;
      else (target as Lesson).resources.push(result as Resource);
      setDoc(updated);
      setDirty(true);
      await persist(updated, saved.revision);
      setMessage("Uploaded and saved.");
    } catch (e) {
      setError(true);
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function treeButton(target: Selection, title: string, status?: string) {
    return (
      <button
        disabled={busy}
        className={`tree-button ${selection.id === target.id ? "active" : ""}`}
        onClick={() => setSelection(target)}
      >
        <span>{title}</span>
        {status === "draft" && <small>draft</small>}
      </button>
    );
  }
  const children: { kind: Kind; items: Entity[] } | null =
    entity && selection.kind === "course"
      ? { kind: "track", items: (entity as Course).tracks }
      : entity && selection.kind === "track"
        ? { kind: "module", items: (entity as Track).modules }
        : entity && selection.kind === "module"
          ? { kind: "lesson", items: (entity as Module).lessons }
          : null;
  const lesson = selection.kind === "lesson" ? (entity as Lesson) : null;
  const founder = selection.kind === "founder" ? (entity as Founder) : null;
  return (
    <section className="container admin-shell">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">
            <span />
            THE FOUNDER WORKSPACE
          </p>
          <h1>Keep the learning growing.</h1>
          <p>
            Signed in as {displayName} · Courses, lessons, and the people behind
            them.
          </p>
        </div>
        <div className="admin-controls">
          <span className="admin-badge">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <button className="button" disabled={busy || !dirty} onClick={save}>
            <Save size={15} />
            {busy ? "Working…" : "Save changes"}
          </button>
          <a className="admin-signout" href={signOutPath} target="_top">
            Sign out
          </a>
        </div>
      </div>
      {message && (
        <div
          role={error ? "alert" : "status"}
          className={`admin-message ${error ? "error" : ""}`}
        >
          {message}
        </div>
      )}
      <div className="admin-layout">
        <aside className="admin-tree">
          <div className="tree-heading">
            COURSES
            <button
              className="icon-button"
              title="Add course"
              aria-label="Add course"
              disabled={busy}
              onClick={() => add("course")}
            >
              <Plus size={14} />
            </button>
          </div>
          {doc.courses.map((c) => (
            <div key={c.id}>
              {treeButton({ kind: "course", id: c.id }, c.title, c.status)}
              <div className="tree-children">
                {c.tracks.map((t) => (
                  <div key={t.id}>
                    {treeButton({ kind: "track", id: t.id }, t.title, t.status)}
                    <div className="tree-children">
                      {t.modules.map((m, i) => (
                        <div key={m.id}>
                          {treeButton(
                            { kind: "module", id: m.id },
                            `${i + 1}. ${m.title}`,
                            m.status,
                          )}
                          {found?.module?.id === m.id && (
                            <div className="tree-children">
                              {m.lessons.map((l) => (
                                <div key={l.id}>
                                  {treeButton(
                                    { kind: "lesson", id: l.id },
                                    l.title,
                                    l.status,
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="tree-founders">
            <div className="tree-heading">FOUNDERS</div>
            {doc.founders.map((f) => (
              <div key={f.id}>
                {treeButton({ kind: "founder", id: f.id }, f.name)}
              </div>
            ))}
          </div>
        </aside>
        <div className="admin-form">
          {!entity ? (
            <div className="empty-state">
              <BookOpen size={25} />
              <p>Select a course or create your first learning path.</p>
            </div>
          ) : (
            <fieldset
              disabled={busy}
              style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
            >
              <p className="editor-type">
                {selection.kind.toUpperCase()} EDITOR
              </p>
              <div className="editor-title">
                <h2>{"title" in entity ? entity.title : entity.name}</h2>
                <div className="editor-actions">
                  <button
                    className="icon-button"
                    aria-label="Move up"
                    title="Move up"
                    disabled={!found || found.siblings[0].id === entity.id}
                    onClick={() => move(selection, -1)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Move down"
                    title="Move down"
                    disabled={!found || found.siblings.at(-1)?.id === entity.id}
                    onClick={() => move(selection, 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
              <div className="editor-fields">
                <Field
                  label={founder ? "Name" : "Title"}
                  value={founder ? founder.name : (entity as Course).title}
                  onChange={(v) => field(founder ? "name" : "title", v)}
                />
                {"slug" in entity && (
                  <Field
                    label="URL slug"
                    value={entity.slug}
                    onChange={(v) => field("slug", v)}
                    hint="Lowercase letters, numbers, and hyphens. Changing this changes the public link."
                  />
                )}
                {"status" in entity && (
                  <Status
                    value={entity.status}
                    onChange={(v) => field("status", v)}
                    lesson={!!lesson}
                  />
                )}
                {selection.kind === "course" && (
                  <>
                    <Field
                      label="Subtitle"
                      value={(entity as Course).subtitle}
                      onChange={(v) => field("subtitle", v)}
                    />
                    <Field
                      label="Prerequisites"
                      value={(entity as Course).prerequisites}
                      onChange={(v) => field("prerequisites", v)}
                      multiline
                    />
                    <Field
                      label="Project outcomes"
                      value={(entity as Course).outcomes.join("\n")}
                      onChange={(v) => field("outcomes", v.split("\n"))}
                      multiline
                      hint="One outcome per line."
                    />
                  </>
                )}
                {selection.kind === "track" && (
                  <>
                    <div className="field-inline">
                      <Field
                        label="Grade range"
                        value={(entity as Track).grades}
                        onChange={(v) => field("grades", v)}
                      />
                      <Field
                        label="Learning approach"
                        value={(entity as Track).approach}
                        onChange={(v) => field("approach", v)}
                      />
                    </div>
                  </>
                )}
                {!founder && (
                  <Field
                    label="Description"
                    value={(entity as Course).description}
                    onChange={(v) => field("description", v)}
                    multiline
                  />
                )}
                {lesson && (
                  <>
                    <Field
                      label="Learning objectives"
                      value={lesson.objectives.join("\n")}
                      onChange={(v) => field("objectives", v.split("\n"))}
                      multiline
                      hint="One objective per line."
                    />
                    <Field
                      label="YouTube video link or ID"
                      value={videoInput}
                      onChange={(v) => {
                        setVideoInput(v);
                        field("youtubeId", parseYouTube(v));
                      }}
                      hint={
                        videoInput && !parseYouTube(videoInput)
                          ? "This is not a recognised YouTube video link. Use a watch, share, Shorts, or embed URL."
                          : "Videos must allow embedding. A link can be added while the lesson is still a draft."
                      }
                    />
                  </>
                )}
                {founder && (
                  <>
                    <div className="field-inline">
                      <Field
                        label="Role"
                        value={founder.role}
                        onChange={(v) => field("role", v)}
                      />
                      <Field
                        label="Placeholder initials"
                        value={founder.initials}
                        onChange={(v) => field("initials", v)}
                      />
                    </div>
                    <Field
                      label="Bio"
                      value={founder.bio}
                      onChange={(v) => field("bio", v)}
                      multiline
                    />
                  </>
                )}
              </div>
              {found?.course && (
                <div className="editor-section">
                  <button className="button button-secondary" onClick={preview}>
                    <ExternalLink size={14} />
                    Save & preview privately
                  </button>
                  <p className="editor-hint">
                    Drafts can only be previewed by an authorised founder. A
                    parent set to Draft hides its children.
                  </p>
                </div>
              )}
              {children && (
                <div className="editor-section">
                  <h3>
                    {children.kind === "track"
                      ? "Learning tracks"
                      : children.kind === "module"
                        ? "Modules"
                        : "Lessons"}
                  </h3>
                  {children.items.map((item, i) => (
                    <div className="editor-child" key={item.id}>
                      <button
                        onClick={() =>
                          setSelection({ kind: children.kind, id: item.id })
                        }
                      >
                        {"title" in item ? item.title : item.name}
                      </button>
                      {"status" in item && <small>{item.status}</small>}
                      <button
                        aria-label={`Move ${"title" in item ? item.title : item.name} up`}
                        className="icon-button"
                        disabled={i === 0}
                        onClick={() =>
                          move({ kind: children.kind, id: item.id }, -1)
                        }
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        aria-label={`Move ${"title" in item ? item.title : item.name} down`}
                        className="icon-button"
                        disabled={i === children.items.length - 1}
                        onClick={() =>
                          move({ kind: children.kind, id: item.id }, 1)
                        }
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="button button-secondary"
                    onClick={() => add(children.kind)}
                  >
                    <Plus size={14} />
                    Add {children.kind}
                  </button>
                </div>
              )}
              {lesson && (
                <div className="editor-section">
                  <h3>Teaching materials</h3>
                  <p>
                    Upload PDF, PPT, or PPTX files up to 25 MB. Files are public
                    only while this lesson and its parent curriculum are public
                    and the lesson is published.
                  </p>
                  <label className="upload-label">
                    <Upload size={15} />
                    Upload teaching file
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onChange={(e) => {
                        void upload(e.target.files?.[0], "resource");
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <div className="upload-list">
                    {lesson.resources.map((r) => (
                      <div className="upload-item" key={r.id}>
                        <a href={`/api/files/${r.id}`} download>
                          {r.name}
                        </a>
                        <small>{formatBytes(r.size)}</small>
                        <button
                          aria-label={`Remove ${r.name}`}
                          className="icon-button"
                          onClick={() =>
                            field(
                              "resources",
                              lesson.resources.filter((x) => x.id !== r.id),
                            )
                          }
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {founder && (
                <div className="editor-section">
                  <h3>Founder photo</h3>
                  {founder.photoId && (
                    <img
                      className="editor-photo"
                      src={`/api/files/${founder.photoId}`}
                      alt={founder.name}
                    />
                  )}
                  <label className="upload-label">
                    <Upload size={15} />
                    Upload JPG, PNG, or WebP
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        void upload(e.target.files?.[0], "image");
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {founder.photoId && (
                    <button
                      className="button button-secondary"
                      style={{ marginTop: 12 }}
                      onClick={() => field("photoId", "")}
                    >
                      Use initials placeholder
                    </button>
                  )}
                </div>
              )}
              <div className="editor-section">
                <button className="button" disabled={!dirty} onClick={save}>
                  <Save size={15} />
                  Save changes
                </button>
              </div>
            </fieldset>
          )}
        </div>
      </div>
    </section>
  );
}
