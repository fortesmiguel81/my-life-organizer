import { createId } from "@paralleldrive/cuid2";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");

function extFromName(name: string) {
  const ext = path.extname(name);
  return ext.length <= 8 ? ext : "";
}

export async function saveUploadedFile(file: File) {
  await mkdir(UPLOADS_DIR, { recursive: true });

  const fileKey = `${createId()}${extFromName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, fileKey), buffer);

  return { fileKey, size: buffer.byteLength };
}

export async function readUploadedFile(fileKey: string) {
  return readFile(path.join(UPLOADS_DIR, fileKey));
}

export async function deleteUploadedFile(fileKey: string) {
  try {
    await unlink(path.join(UPLOADS_DIR, fileKey));
  } catch {
    // already gone; nothing to clean up
  }
}
