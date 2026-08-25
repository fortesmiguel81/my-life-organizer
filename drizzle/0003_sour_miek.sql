DO $$ BEGIN
 CREATE TYPE "public"."maintenance_category" AS ENUM('hvac', 'plumbing', 'electrical', 'appliance', 'exterior', 'safety', 'landscaping', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."maintenance_frequency" AS ENUM('none', 'monthly', 'quarterly', 'biannual', 'annual', 'custom_days');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "maintenance_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"completed_date" timestamp NOT NULL,
	"vendor_id" text,
	"cost" integer,
	"notes" text,
	"user_id" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "maintenance_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "maintenance_category" DEFAULT 'other' NOT NULL,
	"asset_id" text,
	"vendor_id" text,
	"frequency" "maintenance_frequency" DEFAULT 'none' NOT NULL,
	"custom_interval_days" integer,
	"due_date" timestamp,
	"due_notified" boolean DEFAULT false NOT NULL,
	"last_completed_date" timestamp,
	"notes" text,
	"user_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_task_id_maintenance_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."maintenance_tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
