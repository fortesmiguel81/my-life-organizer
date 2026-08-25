DO $$ BEGIN
 CREATE TYPE "public"."vendor_quote_status" AS ENUM('pending', 'accepted', 'declined', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."vendor_trade" AS ENUM('plumber', 'electrician', 'hvac', 'general_contractor', 'landscaping', 'appliance_repair', 'pest_control', 'cleaning', 'roofing', 'handyman', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"vendor_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" integer,
	"status" "vendor_quote_status" DEFAULT 'pending' NOT NULL,
	"quote_date" timestamp,
	"notes" text,
	"user_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"trade" "vendor_trade" DEFAULT 'other' NOT NULL,
	"phone" text,
	"email" text,
	"website" text,
	"address" text,
	"rating" integer,
	"notes" text,
	"user_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_quotes" ADD CONSTRAINT "vendor_quotes_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
