ALTER TABLE "announcements" DROP CONSTRAINT "announcements_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "exams" DROP CONSTRAINT "exams_owner_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "announcements_author_id_index";--> statement-breakpoint
DROP INDEX "users_verification_token_index";--> statement-breakpoint
DROP INDEX "users_password_reset_token_index";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "grade" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "registered" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" DROP COLUMN "author_id";--> statement-breakpoint
ALTER TABLE "exams" DROP COLUMN "owner_id";--> statement-breakpoint
ALTER TABLE "exams" DROP COLUMN "score_confirmed";--> statement-breakpoint
ALTER TABLE "leaderboards_to_exams" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "leaderboards_to_exams" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "registration_complete";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "verification_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "verification_token_generated_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_reset_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_reset_token_generated_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_email_sent_at";