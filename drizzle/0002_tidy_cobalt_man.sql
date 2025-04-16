ALTER TABLE "users" ALTER COLUMN "verification_token_generated_at" SET DEFAULT '1970-01-01 00:00:00.000';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_reset_token_generated_at" SET DEFAULT '1970-01-01 00:00:00.000';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_email_sent_at" SET DEFAULT '1970-01-01 00:00:00.000';