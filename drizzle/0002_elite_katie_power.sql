DO $$ BEGIN
 CREATE TYPE "public"."asset_category" AS ENUM('appliance', 'electronics', 'furniture', 'hvac', 'vehicle', 'tool', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "asset_category" DEFAULT 'other' NOT NULL,
	"brand" text,
	"model" text,
	"serial_number" text,
	"location" text,
	"purchase_date" timestamp,
	"purchase_price" integer,
	"insurance_value" integer,
	"warranty_expiration" timestamp,
	"warranty_expiry_notified" boolean DEFAULT false NOT NULL,
	"manual_document_id" text,
	"notes" text,
	"user_id" text,
	"created_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assets" ADD CONSTRAINT "assets_manual_document_id_documents_id_fk" FOREIGN KEY ("manual_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
