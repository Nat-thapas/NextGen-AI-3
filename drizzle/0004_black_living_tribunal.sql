ALTER TYPE "public"."role" ADD VALUE 'registrant' BEFORE 'student';--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" char(64) PRIMARY KEY NOT NULL,
	"user_id" char(16) NOT NULL,
	"first_login_ip" varchar(39) NOT NULL,
	"first_login_user_agent" varchar(1023) NOT NULL,
	"last_use_ip" varchar(39) NOT NULL,
	"last_use_user_agent" varchar(1023) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "verification_token_generated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_reset_token_generated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;