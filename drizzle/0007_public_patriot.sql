DO $$ BEGIN
 CREATE TYPE "public"."recurrenceFrequency" AS ENUM('none', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."transactionType" AS ENUM('income', 'expense', 'transfer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "type" "transactionType" DEFAULT 'expense' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "recurrence" "recurrenceFrequency" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "next_due_date" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "linked_transaction_id" text;