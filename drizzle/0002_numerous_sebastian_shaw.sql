CREATE TABLE "announcements" (
	"id" char(16) PRIMARY KEY NOT NULL,
	"author_id" char(16) NOT NULL,
	"title" varchar(1023) NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;