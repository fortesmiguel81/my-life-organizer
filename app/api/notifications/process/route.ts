import { type NextRequest } from "next/server";

import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db/drizzle";
import {
  assets,
  documents,
  events,
  habitLogs,
  habits,
  profiles,
} from "@/db/schema";
import { decryptField } from "@/lib/encryption";

const NTFY_URL = process.env.NTFY_URL ?? "http://ntfy:80";

async function pushNotification(topic: string, title: string, message: string) {
  await fetch(`${NTFY_URL}/${topic}`, {
    method: "POST",
    body: message,
    headers: { Title: title },
  });
}

async function getNtfyTopic(userId: string) {
  const [profile] = await db
    .select({ ntfyTopic: profiles.ntfyTopic })
    .from(profiles)
    .where(eq(profiles.id, userId));

  return profile?.ntfyTopic ?? null;
}

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
      const topic = await getNtfyTopic(userId);
      if (!topic) continue;

      const startStr = event.allDay
        ? event.startDate.toLocaleDateString()
        : event.startDate.toLocaleString();

      await pushNotification(
        topic,
        `Reminder: ${event.title}`,
        `${startStr}${event.location ? ` — ${event.location}` : ""}`
      );

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
      const topic = await getNtfyTopic(userId);
      if (!topic) continue;

      const name = (await decryptField(doc.name)) ?? doc.name;
      const daysLeft = Math.ceil(
        (doc.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      await pushNotification(
        topic,
        `Document expiring soon: ${name}`,
        `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} (${doc.expiryDate!.toLocaleDateString()})`
      );

      await db
        .update(documents)
        .set({ expiryNotified: true })
        .where(eq(documents.id, doc.id));

      docsSent++;
    } catch {
      // Skip on error; will retry on next cron run
    }
  }

  // Asset warranty expiry notifications (30-day window)
  const expiringWarranties = await db
    .select()
    .from(assets)
    .where(
      and(
        gte(assets.warrantyExpiration, now),
        lte(assets.warrantyExpiration, in30Days),
        eq(assets.warrantyExpiryNotified, false)
      )
    );

  let warrantiesSent = 0;

  for (const asset of expiringWarranties) {
    const userId = asset.userId;
    if (!userId) continue;

    try {
      const topic = await getNtfyTopic(userId);
      if (!topic) continue;

      const daysLeft = Math.ceil(
        (asset.warrantyExpiration!.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      await pushNotification(
        topic,
        `Warranty expiring soon: ${asset.name}`,
        `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} (${asset.warrantyExpiration!.toLocaleDateString()})`
      );

      await db
        .update(assets)
        .set({ warrantyExpiryNotified: true })
        .where(eq(assets.id, asset.id));

      warrantiesSent++;
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
    .where(
      and(
        gte(habits.reminderTime, windowStart),
        lte(habits.reminderTime, windowEnd)
      )
    );

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
      const topic = await getNtfyTopic(userId);
      if (!topic) continue;

      await pushNotification(
        topic,
        `Habit reminder: ${habit.icon ?? "✅"} ${habit.title}`,
        habit.description ?? "Don't forget to complete your habit today!"
      );

      habitsSent++;
    } catch {
      // Skip on error
    }
  }

  return Response.json({
    events: { processed: sent, total: upcoming.length },
    documents: { processed: docsSent, total: expiringDocs.length },
    warranties: { processed: warrantiesSent, total: expiringWarranties.length },
    habits: { processed: habitsSent, total: allHabits.length },
  });
}
