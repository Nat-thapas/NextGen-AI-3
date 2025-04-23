ALTER TABLE "files" RENAME COLUMN "mime" TO "mime_type";--> statement-breakpoint
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "html" text NOT NULL;--> statement-breakpoint
ALTER TABLE "choices" ADD COLUMN "html" text NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "reference_id" char(20);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "html" text NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" DROP COLUMN "author_id";