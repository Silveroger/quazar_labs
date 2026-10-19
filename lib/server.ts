import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { isAllowedAdmin, publicContent, type Snapshot } from "./content";
import { seedContent } from "./seed";

export function database() {
  if (!env.DB) throw new Error("The content database is unavailable.");
  return env.DB;
}
export function bucket() {
  if (!env.BUCKET) throw new Error("File storage is unavailable.");
  return env.BUCKET;
}
export async function adminUser() {
  const user = await getChatGPTUser();
  const adminIds =
    (typeof env !== "undefined" &&
      (env as Record<string, string | undefined>).ADMIN_USER_IDS) ||
    process.env.ADMIN_USER_IDS ||
    "local_seedy";
  const adminEmails =
    (typeof env !== "undefined" &&
      (env as Record<string, string | undefined>).ADMIN_EMAILS) ||
    process.env.ADMIN_EMAILS ||
    "";
  return isAllowedAdmin(user, adminIds, adminEmails) ? user : null;
}
export async function snapshot(): Promise<Snapshot> {
  const row = await database()
    .prepare("SELECT document, revision FROM content WHERE id = 1")
    .first<{ document: string; revision: number }>();
  return row
    ? { document: JSON.parse(row.document), revision: row.revision }
    : { document: structuredClone(seedContent), revision: 0 };
}
export async function readPublic() {
  return publicContent((await snapshot()).document);
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
export async function boundedText(request: Request, limit = 1500000) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    bytes += chunk.value.byteLength;
    if (bytes > limit) {
      await reader.cancel();
      throw new RangeError("The content update is too large.");
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return text + decoder.decode();
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export const siteOrigin = () =>
  (typeof env !== "undefined" &&
    (env as Record<string, string | undefined>).SITE_URL) ||
  process.env.SITE_URL ||
  "http://localhost:5173";
