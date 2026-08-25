import { type NextRequest } from "next/server";

import { ALLOWED_DOCUMENT_MIME_TYPES } from "@/lib/allowed-mime-types";
import { getServerAuth } from "@/lib/local-auth";
import { saveUploadedFile } from "@/lib/local-storage";

const MAX_SIZE = 16 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = getServerAuth();
  if (!auth?.userId) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File exceeds 16MB limit" }, { status: 400 });
  }

  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.type)) {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const { fileKey, size } = await saveUploadedFile(file);

  return Response.json({
    data: {
      fileUrl: `/api/documents/file/${fileKey}`,
      fileKey,
      name: file.name,
      size,
      type: file.type,
    },
  });
}
