import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { categories, insertCategorySchema } from "@/db/schema";

import { canUserSeeCategory } from "../utils/can-user-see-category";

const app = new Hono()
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const data = await db
      .select({
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        description: categories.description,
        userId: categories.userId,
        orgId: categories.orgId,
      })
      .from(categories)
      .where(
        and(
          auth?.orgId
            ? eq(categories.orgId, auth?.orgId)
            : eq(categories.userId, auth.userId)
        )
      );

    return ctx.json({ data });
  })
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Category Id is required!" }, 400);
      }

      const { canSeeCategory, data } = await canUserSeeCategory(
        id,
        auth.userId
      );

      if (!canSeeCategory) {
        return ctx.json(
          { error: `Category with the id: ${id} not found` },
          404
        );
      }

      return ctx.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertCategorySchema.omit({
        id: true,
        userId: true,
        orgId: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(categories)
        .values({
          id: createId(),
          ...values,
          orgId: auth?.orgId,
          userId: auth?.orgId ? null : auth.userId,
          created_at: new Date(),
          created_by: auth.userId,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .returning();

      return ctx.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    zValidator(
      "json",
      insertCategorySchema.omit({
        id: true,
        userId: true,
        orgId: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Category Id is required!" }, 400);
      }

      const values = ctx.req.valid("json");

      const { canSeeCategory } = await canUserSeeCategory(id, auth.userId);

      if (!canSeeCategory) {
        return ctx.json(
          { error: `Category with the id: ${id} not found` },
          404
        );
      }

      const [data] = await db
        .update(categories)
        .set({
          ...values,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .returning();

      return ctx.json({ data });
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Transaction Id is required!" }, 400);
      }

      const { canSeeCategory } = await canUserSeeCategory(id, auth.userId);

      if (!canSeeCategory) {
        return ctx.json(
          { error: `Category with the id: ${id} not found` },
          404
        );
      }

      const [data] = await db
        .delete(categories)
        .where(eq(categories.id, id))
        .returning();

      if (!data) {
        return ctx.json(
          { error: `Category with the id: ${id} not found` },
          404
        );
      }

      return ctx.json({ data });
    }
  );

export default app;
