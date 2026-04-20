CREATE TABLE IF NOT EXISTS "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"location" text,
	"color" text,
	"google_event_id" text,
	"google_calendar_id" text,
	"notify_before" integer DEFAULT 30,
	"notified" boolean DEFAULT false NOT NULL,
	"user_id" text,
	"org_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "google_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"scope" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
