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
  return isAllowedAdmin(user, env.ADMIN_USER_IDS, env.ADMIN_EMAILS)
    ? user
    : null;
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
export const siteOrigin = () => env.SITE_URL || "http://localhost:5173";
