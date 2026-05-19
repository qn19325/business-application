CREATE TYPE "public"."document_type" AS ENUM('p60', 'p11d', 'bank_statements', 'self_employment', 'rental', 'dividends', 'pension', 'capital_gains', 'income', 'expenses', 'mileage_log');--> statement-breakpoint
CREATE TYPE "public"."mtd_submission_status" AS ENUM('pending', 'submitted', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."regime" AS ENUM('mtd', 'sa100');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('not_started', 'in_progress', 'awaiting_client', 'ready_to_file', 'filed');--> statement-breakpoint
CREATE TYPE "public"."submission_type" AS ENUM('q_1', 'q_2', 'q_3', 'q_4', 'eops', 'final_declaration');--> statement-breakpoint
CREATE TABLE "checklist_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" uuid NOT NULL,
	"tax_return_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"label" text NOT NULL,
	"done" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"ni_number" text NOT NULL,
	"email" text,
	"phone_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_practiceId_niNumber_unique" UNIQUE("practice_id","ni_number")
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" uuid NOT NULL,
	"checklist_item_id" uuid NOT NULL,
	"r2_key" text NOT NULL,
	"original_file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_checklistItemId_unique" UNIQUE("checklist_item_id")
);
--> statement-breakpoint
CREATE TABLE "mtd_submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" uuid NOT NULL,
	"tax_return_id" uuid NOT NULL,
	"submission_type" "submission_type" NOT NULL,
	"status" "mtd_submission_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mtd_submission_taxReturnId_submissionType_unique" UNIQUE("tax_return_id","submission_type")
);
--> statement-breakpoint
CREATE TABLE "practice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"clerk_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "practice_clerkUserId_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "r2_pending_delete" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" uuid NOT NULL,
	"r2_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "r2_pending_delete_r2Key_unique" UNIQUE("r2_key")
);
--> statement-breakpoint
CREATE TABLE "tax_return" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"tax_year" integer NOT NULL,
	"regime" "regime" NOT NULL,
	"status" "status" NOT NULL,
	"approved_at" timestamp,
	"approved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tax_return_clientId_taxYear_regime_unique" UNIQUE("client_id","tax_year","regime")
);
--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_tax_return_id_tax_return_id_fk" FOREIGN KEY ("tax_return_id") REFERENCES "public"."tax_return"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_checklist_item_id_checklist_item_id_fk" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."checklist_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mtd_submission" ADD CONSTRAINT "mtd_submission_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mtd_submission" ADD CONSTRAINT "mtd_submission_tax_return_id_tax_return_id_fk" FOREIGN KEY ("tax_return_id") REFERENCES "public"."tax_return"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "r2_pending_delete" ADD CONSTRAINT "r2_pending_delete_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_return" ADD CONSTRAINT "tax_return_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_return" ADD CONSTRAINT "tax_return_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checklist_item_practice_id_idx" ON "checklist_item" USING btree ("practice_id");--> statement-breakpoint
CREATE INDEX "client_practice_id_idx" ON "client" USING btree ("practice_id");--> statement-breakpoint
CREATE INDEX "document_practice_id_idx" ON "document" USING btree ("practice_id");--> statement-breakpoint
CREATE INDEX "mtd_submission_practice_id_idx" ON "mtd_submission" USING btree ("practice_id");--> statement-breakpoint
CREATE INDEX "tax_return_practice_id_idx" ON "tax_return" USING btree ("practice_id");