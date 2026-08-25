DO $$ BEGIN
 CREATE TYPE "public"."utility_type" AS ENUM('electricity', 'water', 'gas', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "utility_readings" (
	"id" text PRIMARY KEY NOT NULL,
	"utility_type" "utility_type" NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"usage" double precision NOT NULL,
	"unit" text NOT NULL,
	"cost" integer,
	"notes" text,
	"user_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
