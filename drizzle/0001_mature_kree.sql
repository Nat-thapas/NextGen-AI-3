ALTER TABLE "users" ADD COLUMN "verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_token_generated_at" timestamp DEFAULT '1969-12-31 17:00:00.000';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token_generated_at" timestamp DEFAULT '1969-12-31 17:00:00.000';