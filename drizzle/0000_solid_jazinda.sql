CREATE TABLE IF NOT EXISTS "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text,
	"org_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"org_id" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"payee" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp NOT NULL,
	"account_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
