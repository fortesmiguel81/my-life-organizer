import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { Hono } from "hono";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { documents, insertDocumentSchema } from "@/db/schema";
import { decryptField, encryptField } from "@/lib/encryption";

const utapi = new UTApi();

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        category: z
          .enum(["legal", "insurance", "medical", "household", "financial", "other"])
          .optional(),
        tag: z.string().optional(),
        expiring: z.coerce.number().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { category, tag, expiring } = ctx.req.valid("query");
      const userFilter = auth.orgId
        ? eq(documents.orgId, auth.orgId)
        : eq(documents.userId, auth.userId);

      const conditions: Parameters<typeof and>[0][] = [userFilter];
      if (category) conditions.push(eq(documents.category, category));
      if (tag) conditions.push(sql`${documents.tags} @> ARRAY[${tag}]::text[]`);
      if (expiring) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + expiring);
        conditions.push(lte(documents.expiryDate, cutoff));
        conditions.push(gte(documents.expiryDate, new Date()));
      }

      const rows = await db
        .select()
        .from(documents)
        .where(and(...conditions))
        .orderBy(documents.created_at);

      const data = await Promise.all(
        rows.map(async (doc) => ({
          ...doc,
          name: (await decryptField(doc.name)) ?? doc.name,
          description: await decryptField(doc.description),
        }))
      );

      return ctx.json({ data });
    }
  )
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = auth.orgId
        ? eq(documents.orgId, auth.orgId)
        : eq(documents.userId, auth.userId);

      const [doc] = await db
        .select()
        .from(documents)
        .where(and(eq(documents.id, id), userFilter));

      if (!doc) return ctx.json({ error: "Document not found" }, 404);

      return ctx.json({
        data: {
          ...doc,
          name: (await decryptField(doc.name)) ?? doc.name,
          description: await decryptField(doc.description),
        },
      });
    }
  )
  .get(
    "/:id/download",
    zValidator("param", z.object({ id: z.string() })),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = auth.orgId
        ? eq(documents.orgId, auth.orgId)
        : eq(documents.userId, auth.userId);

      const [doc] = await db
        .select({ fileUrl: documents.fileUrl })
        .from(documents)
        .where(and(eq(documents.id, id), userFilter));

      if (!doc) return ctx.json({ error: "Document not found" }, 404);
      return ctx.redirect(doc.fileUrl);
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertDocumentSchema.omit({
        id: true,
        userId: true,
        orgId: true,
        expiryNotified: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const values = ctx.req.valid("json");
      const now = new Date();

      const [data] = await db
        .insert(documents)
        .values({
          id: createId(),
          ...values,
          name: (await encryptField(values.name)) ?? values.name,
          description: await encryptField(values.description ?? null),
          userId: auth.orgId ? null : auth.userId,
          orgId: auth.orgId ?? null,
          created_at: now,
          created_by: auth.userId,
          updated_at: now,
          updated_by: auth.userId,
        })
        .returning();

      return ctx.json({ data }, 201);
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      insertDocumentSchema
        .omit({
          id: true,
          userId: true,
          orgId: true,
          fileUrl: true,
          fileKey: true,
          mimeType: true,
          fileSize: true,
          expiryNotified: true,
          created_at: true,
          created_by: true,
          updated_at: true,
          updated_by: true,
        })
        .partial()
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");
      const userFilter = auth.orgId
        ? eq(documents.orgId, auth.orgId)
        : eq(documents.userId, auth.userId);

      const [existing] = await db
        .select({ expiryDate: documents.expiryDate })
        .from(documents)
        .where(and(eq(documents.id, id), userFilter));

      if (!existing) return ctx.json({ error: "Document not found" }, 404);

      const expiryChanged =
        values.expiryDate !== undefined &&
        values.expiryDate?.toISOString() !== existing.expiryDate?.toISOString();

      const [data] = await db
        .update(documents)
        .set({
          ...values,
          name: values.name ? ((await encryptField(values.name)) ?? values.name) : undefined,
          description: values.description !== undefined ? await encryptField(values.description) : undefined,
          expiryNotified: expiryChanged ? false : undefined,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(documents.id, id))
        .returning();

      return ctx.json({ data });
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { id } = ctx.req.valid("param");
      const userFilter = auth.orgId
        ? eq(documents.orgId, auth.orgId)
        : eq(documents.userId, auth.userId);

      const [doc] = await db
        .select({ fileKey: documents.fileKey })
        .from(documents)
        .where(and(eq(documents.id, id), userFilter));

      if (!doc) return ctx.json({ error: "Document not found" }, 404);

      await utapi.deleteFiles(doc.fileKey);

      const [data] = await db
        .delete(documents)
        .where(eq(documents.id, id))
        .returning();

      return ctx.json({ data });
    }
  );

export default app;
