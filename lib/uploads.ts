export const MAX_FILE_SIZE = 25 * 1024 * 1024;
export function validateUpload(name: string, bytes: Uint8Array, kind: string) {
  if (!bytes.length || bytes.length > MAX_FILE_SIZE)
    throw new Error("Choose a non-empty file of 25 MB or less.");
  const ext = name.split(".").pop()?.toLowerCase();
  const begins = (signature: number[]) =>
    signature.every((v, i) => bytes[i] === v);
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  let mime = "";
  if (kind === "image") {
    if (["jpg", "jpeg"].includes(ext || "") && begins([255, 216, 255]))
      mime = "image/jpeg";
    if (ext === "png" && begins([137, 80, 78, 71, 13, 10, 26, 10]))
      mime = "image/png";
    if (ext === "webp" && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP")
      mime = "image/webp";
    if (!mime) throw new Error("Choose a valid JPG, PNG, or WebP image.");
  } else {
    if (ext === "pdf" && ascii(0, 5) === "%PDF-") mime = "application/pdf";
    if (ext === "ppt" && begins([208, 207, 17, 224, 161, 177, 26, 225]))
      mime = "application/vnd.ms-powerpoint";
    if (ext === "pptx" && begins([80, 75, 3, 4])) {
      const names = new TextDecoder("latin1").decode(bytes);
      if (
        names.includes("[Content_Types].xml") &&
        names.includes("ppt/presentation.xml")
      )
        mime =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
    if (!mime)
      throw new Error("Choose a valid PDF, PPT, or PPTX teaching file.");
  }
  return {
    mime,
    name: name.replace(/[\x00-\x1f\x7f/\\"<>]/g, "_").slice(0, 150),
    extension: ext,
  };
}
