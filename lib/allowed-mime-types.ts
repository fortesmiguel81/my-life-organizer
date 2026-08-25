/** Every type the documents module will accept an upload as. */
export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

/**
 * Subset safe to serve with their real Content-Type and rendered inline.
 * Everything else (including anything not in ALLOWED_DOCUMENT_MIME_TYPES at
 * all, e.g. a spoofed/legacy row) is served as application/octet-stream with
 * Content-Disposition: attachment so a browser never executes it.
 */
export const INLINE_RENDERABLE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
