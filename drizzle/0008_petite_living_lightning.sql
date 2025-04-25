ALTER TABLE "announcements" RENAME COLUMN "text" TO "markdown";--> statement-breakpoint
ALTER TABLE "choices" RENAME COLUMN "text" TO "markdown";--> statement-breakpoint
ALTER TABLE "questions" RENAME COLUMN "text" TO "markdown";--> statement-breakpoint
ALTER TABLE "choices" ADD COLUMN "number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "owner_id" char(20);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "choices_number" ON "choices" USING btree ("number");--> statement-breakpoint
CREATE INDEX "questions_number" ON "questions" USING btree ("number");