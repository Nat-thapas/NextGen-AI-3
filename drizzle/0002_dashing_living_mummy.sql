ALTER TABLE "questions" ALTER COLUMN "max_score" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "min_score" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "text_length_limit" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "file_size_limit" DROP DEFAULT;