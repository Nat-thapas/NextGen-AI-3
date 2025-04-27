ALTER TABLE "questions" ALTER COLUMN "text_length_limit" SET DEFAULT 65536;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "text_length_limit" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "file_size_limit" SET DEFAULT 100000;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "file_size_limit" SET NOT NULL;