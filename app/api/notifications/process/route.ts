import { createClerkClient } from "@clerk/backend";
import { and, eq, gte, lte } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { Resend } from "resend";

import { db } from "@/db/drizzle";
import { events } from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  // Look for events starting in the next 60 minutes
  const lookAhead = new Date(now.getTime() + 60 * 60 * 1000);

  const upcoming = await db
    .select()
    .from(events)
    .where(
      and(
        gte(events.startDate, now),
        lte(events.startDate, lookAhead),
        eq(events.notified, false)
      )
    );

  let sent = 0;

  for (const event of upcoming) {
    const userId = event.userId;
    if (!userId) continue;

    try {
      const user = await clerk.users.getUser(userId);
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      const startStr = event.allDay
        ? event.startDate.toLocaleDateString()
        : event.startDate.toLocaleString();

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "no-reply@mylifeorganizer.app",
        to: email,
        subject: `Reminder: ${event.title}`,
        html: `
          <h2>${event.title}</h2>
          <p><strong>When:</strong> ${startStr}</p>
          ${event.location ? `<p><strong>Where:</strong> ${event.location}</p>` : ""}
          ${event.description ? `<p>${event.description}</p>` : ""}
        `,
      });

      await db
        .update(events)
        .set({ notified: true })
        .where(eq(events.id, event.id));

      sent++;
    } catch {
      // Skip this event on error; will retry on next cron run
    }
  }

  return Response.json({ processed: sent, total: upcoming.length });
}
