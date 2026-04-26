DO $$ BEGIN
 CREATE TYPE "public"."habitFrequency" AS ENUM('daily', 'weekly');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"habit_id" text NOT NULL,
	"date" text NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"note" text,
	"user_id" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habits" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"icon" text DEFAULT '✅',
	"color" text DEFAULT '#6366f1',
	"frequency" "habitFrequency" DEFAULT 'daily' NOT NULL,
	"target_days" integer,
	"reminder_time" text,
	"user_id" text,
	"org_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "habit_log_habit_date_idx" ON "habit_logs" USING btree ("habit_id","date");