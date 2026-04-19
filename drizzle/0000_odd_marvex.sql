CREATE TABLE "checklist_item" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tax_return_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"label" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client" (
	"id" uuid PRIMARY KEY NOT NULL,
	"practice_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"ni_number" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text
);
--> statement-breakpoint
CREATE TABLE "mtd_submission" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tax_return_id" uuid NOT NULL,
	"submission_type" text NOT NULL,
	"deadline" date NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_return" (
	"id" uuid PRIMARY KEY NOT NULL,
	"practice_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"tax_year" integer NOT NULL,
	"regime" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_tax_return_id_tax_return_id_fk" FOREIGN KEY ("tax_return_id") REFERENCES "public"."tax_return"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mtd_submission" ADD CONSTRAINT "mtd_submission_tax_return_id_tax_return_id_fk" FOREIGN KEY ("tax_return_id") REFERENCES "public"."tax_return"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_return" ADD CONSTRAINT "tax_return_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_return" ADD CONSTRAINT "tax_return_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE no action ON UPDATE no action;