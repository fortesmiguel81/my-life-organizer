import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";

import { IsOrganizationMember } from "../utils/is-organization-member";

const app = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      orgId: z.string().optional(),
    })
  ),
  clerkMiddleware(),
  async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const { orgId } = ctx.req.valid("query");

    if (orgId && !(await IsOrganizationMember(orgId, auth.userId))) {
      return ctx.json(
        { error: "User does not belong to the organization!" },
        400
      );
    }

    const data = await db
      .select()
      .from(categories)
      .where(
        and(
          orgId
            ? eq(categories.orgId, orgId)
            : eq(categories.userId, auth.userId)
        )
      );

    return ctx.json({ data });
  }
);

export default app;
