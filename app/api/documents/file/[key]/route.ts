import { type NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { documents } from "@/db/schema";
import { getServerAuth } from "@/lib/local-auth";
import { readUploadedFile } from "@/lib/local-storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  const auth = getServerAuth();
  if (!auth?.userId) return new Response("Unauthorized", { status: 401 });

  const fileUrl = `/api/documents/file/${params.key}`;

  const [doc] = await db
    .select({ mimeType: documents.mimeType, userId: documents.userId })
    .from(documents)
    .where(eq(documents.fileUrl, fileUrl));

  if (!doc || doc.userId !== auth.userId) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await readUploadedFile(params.key);

  return new Response(buffer, {
    headers: { "Content-Type": doc.mimeType },
  });
}
