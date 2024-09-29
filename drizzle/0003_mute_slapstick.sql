ALTER TABLE "accounts" ADD COLUMN "holder" text NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "balance" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "account_number" text NOT NULL;