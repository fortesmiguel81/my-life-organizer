import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";

import { canUserSeeAccount } from "../utils/can-user-see-account";

const app = new Hono()
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
        userId: accounts.userId,
        orgId: accounts.orgId,
      })
      .from(accounts)
      .where(
        and(
          auth?.orgId
            ? eq(accounts.orgId, auth?.orgId)
            : eq(accounts.userId, auth.userId)
        )
      );

    return ctx.json({ data });
  })
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
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

      const { canSeeAccount, data } = await canUserSeeAccount(id, auth.userId);

      if (!canSeeAccount) {
        return ctx.json({ error: `Account with the id: ${id} not found` }, 404);
      }

      return ctx.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertAccountSchema.omit({
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
        .insert(accounts)
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
        id: z.string().optional(),
      })
    ),
    zValidator(
      "json",
      insertAccountSchema.omit({
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
        return ctx.json({ error: "Account Id is required!" }, 400);
      }

      const values = ctx.req.valid("json");

      const { canSeeAccount } = await canUserSeeAccount(id, auth.userId);

      if (!canSeeAccount) {
        return ctx.json({ error: `Account with the id: ${id} not found` }, 404);
      }

      const [data] = await db
        .update(accounts)
        .set({
          ...values,
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(accounts.id, id))
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
        id: z.string().optional(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Account Id is required!" }, 400);
      }

      const { canSeeAccount } = await canUserSeeAccount(id, auth.userId);

      if (!canSeeAccount) {
        return ctx.json({ error: `Account with the id: ${id} not found` }, 404);
      }

      const [data] = await db
        .delete(accounts)
        .where(eq(accounts.id, id))
        .returning();

      if (!data) {
        return ctx.json({ error: `Account with the id: ${id} not found` }, 404);
      }

      return ctx.json({ data });
    }
  );

export default app;
