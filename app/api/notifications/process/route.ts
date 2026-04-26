import { createClerkClient } from "@clerk/backend";
import { and, eq, gte, lte } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { Resend } from "resend";

import { db } from "@/db/drizzle";
import { documents, events, habitLogs, habits } from "@/db/schema";
import { decryptField } from "@/lib/encryption";

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

  // Document expiry notifications (30-day window)
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringDocs = await db
    .select()
    .from(documents)
    .where(
      and(
        gte(documents.expiryDate, now),
        lte(documents.expiryDate, in30Days),
        eq(documents.expiryNotified, false)
      )
    );

  let docsSent = 0;

  for (const doc of expiringDocs) {
    const userId = doc.userId;
    if (!userId) continue;

    try {
      const user = await clerk.users.getUser(userId);
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      const name = (await decryptField(doc.name)) ?? doc.name;
      const daysLeft = Math.ceil(
        (doc.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "no-reply@mylifeorganizer.app",
        to: email,
        subject: `Document expiring soon: ${name}`,
        html: `
          <h2>Document Expiry Reminder</h2>
          <p>Your document <strong>${name}</strong> expires in <strong>${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong> (${doc.expiryDate!.toLocaleDateString()}).</p>
          <p>Log in to review or renew it.</p>
        `,
      });

      await db
        .update(documents)
        .set({ expiryNotified: true })
        .where(eq(documents.id, doc.id));

      docsSent++;
    } catch {
      // Skip on error; will retry on next cron run
    }
  }

  // Habit reminders — fire if reminderTime falls within the current 15-min window and not yet completed today
  const utcHour = now.getUTCHours().toString().padStart(2, "0");
  const utcMin = now.getUTCMinutes();
  const windowStart = `${utcHour}:${String(Math.floor(utcMin / 15) * 15).padStart(2, "0")}`;
  const windowEndMin = Math.floor(utcMin / 15) * 15 + 15;
  const windowEnd =
    windowEndMin >= 60
      ? `${String(now.getUTCHours() + 1).padStart(2, "0")}:00`
      : `${utcHour}:${String(windowEndMin).padStart(2, "0")}`;

  const today = now.toISOString().split("T")[0];

  const allHabits = await db
    .select()
    .from(habits)
    .where(and(gte(habits.reminderTime, windowStart), lte(habits.reminderTime, windowEnd)));

  let habitsSent = 0;

  for (const habit of allHabits) {
    const userId = habit.userId;
    if (!userId) continue;

    // Check if already completed today
    const [log] = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habit.id),
          eq(habitLogs.date, today),
          eq(habitLogs.completed, true)
        )
      );

    if (log) continue; // already done

    try {
      const user = await clerk.users.getUser(userId);
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "no-reply@mylifeorganizer.app",
        to: email,
        subject: `Habit reminder: ${habit.icon ?? "✅"} ${habit.title}`,
        html: `
          <h2>${habit.icon ?? "✅"} ${habit.title}</h2>
          <p>Don't forget to complete your habit today!</p>
          ${habit.description ? `<p>${habit.description}</p>` : ""}
        `,
      });

      habitsSent++;
    } catch {
      // Skip on error
    }
  }

  return Response.json({
    events: { processed: sent, total: upcoming.length },
    documents: { processed: docsSent, total: expiringDocs.length },
    habits: { processed: habitsSent, total: allHabits.length },
  });
}
