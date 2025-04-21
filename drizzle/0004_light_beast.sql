ALTER TABLE "users" drop column "verified";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verified" boolean GENERATED ALWAYS AS ("hashed_password" IS NOT NULL) STORED NOT NULL;