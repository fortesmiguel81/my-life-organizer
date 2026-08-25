import { type NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { documents } from "@/db/schema";
import { INLINE_RENDERABLE_MIME_TYPES } from "@/lib/allowed-mime-types";
import { getServerAuth } from "@/lib/local-auth";
import { readUploadedFile } from "@/lib/local-storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const auth = await getServerAuth();
  if (!auth?.userId) return new Response("Unauthorized", { status: 401 });

  const { key } = await params;
  const fileUrl = `/api/documents/file/${key}`;

  const [doc] = await db
    .select({ mimeType: documents.mimeType, userId: documents.userId })
    .from(documents)
    .where(eq(documents.fileUrl, fileUrl));

  if (!doc || doc.userId !== auth.userId) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await readUploadedFile(key);

  const isRenderable = INLINE_RENDERABLE_MIME_TYPES.has(doc.mimeType);
  const headers: HeadersInit = {
    "Content-Type": isRenderable ? doc.mimeType : "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  };
  if (!isRenderable) {
    headers["Content-Disposition"] = "attachment";
  }

  return new Response(buffer, { headers });
}
