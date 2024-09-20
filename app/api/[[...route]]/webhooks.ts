import { WebhookEvent } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { Webhook } from "svix";

import { db } from "@/db/drizzle";
import { memberships } from "@/db/schema";

const app = new Hono().post("/", async (c) => {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return c.json({ error: "Missing webhook secret" }, 400);
  }
  // Get the headers
  const svix_id = c.req.header("svix-id");
  const svix_signature = c.req.header("svix-signature");
  const svix_timestamp = c.req.header("svix-timestamp");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return c.json({ error: "Missing headers" }, 400);
  }

  const payload = await c.req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return c.json({ error: "Error verifying webhook" }, 400);
  }

  const eventType = evt.type;

  var data = null;

  switch (eventType) {
    case "organizationMembership.created":
      data = await db.insert(memberships).values({
        id: createId(),
        userId: evt.data.public_user_data.user_id,
        orgId: evt.data.organization.id,
        created_at: new Date(),
      });

      break;
    case "organizationMembership.updated":
      const membership = await db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.orgId, evt.data.organization.id),
            eq(memberships.userId, evt.data.public_user_data.user_id)
          )
        );

      if (membership.length > 0) {
        data = await db.insert(memberships).values({
          id: createId(),
          userId: evt.data.public_user_data.user_id,
          orgId: evt.data.organization.id,
          created_at: new Date(),
        });
      }

    case "organizationMembership.deleted":
      data = await db
        .delete(memberships)
        .where(
          and(
            eq(memberships.orgId, evt.data.organization.id),
            eq(memberships.userId, evt.data.public_user_data.user_id)
          )
        );
  }

  return c.json({}, 200);
});

export default app;
