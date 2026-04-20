DO $$ BEGIN
 CREATE TYPE "public"."taskPriority" AS ENUM('low', 'medium', 'high', 'urgent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."taskStatus" AS ENUM('todo', 'in_progress', 'done');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"color" text,
	"user_id" text,
	"org_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"list_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "taskStatus" DEFAULT 'todo' NOT NULL,
	"priority" "taskPriority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"assigned_to" text,
	"parent_id" text,
	"calendar_event_id" text,
	"user_id" text,
	"org_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_list_id_task_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."task_lists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
