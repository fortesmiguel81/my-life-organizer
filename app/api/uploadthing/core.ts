import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({
    "image/jpeg": { maxFileSize: "16MB" },
    "image/png": { maxFileSize: "16MB" },
    "image/webp": { maxFileSize: "16MB" },
    "application/pdf": { maxFileSize: "16MB" },
    "application/msword": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB" },
    "application/vnd.ms-excel": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "16MB" },
  })
    .middleware(async () => {
      const { userId, orgId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId, orgId: orgId ?? null };
    })
    .onUploadComplete(async ({ file }) => {
      return { fileUrl: file.ufsUrl, fileKey: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
