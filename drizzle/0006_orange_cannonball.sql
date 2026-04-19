ALTER TYPE "public"."question_types" ADD VALUE 'code';--> statement-breakpoint
CREATE TABLE "testcases" (
	"exam_id" uuid NOT NULL,
	"question_number" integer NOT NULL,
	"number" integer NOT NULL,
	"stdin" text,
	"expected_out" text,
	"is_hidden" boolean DEFAULT true NOT NULL,
	"code_time_limit_s" integer DEFAULT 1 NOT NULL,
	"code_memory_limit_b" integer DEFAULT 33554432 NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "testcases_exam_id_question_number_number_pk" PRIMARY KEY("exam_id","question_number","number")
);
--> statement-breakpoint
ALTER TABLE "testcases" ADD CONSTRAINT "testcases_exam_id_question_number_questions_exam_id_number_fk" FOREIGN KEY ("exam_id","question_number") REFERENCES "public"."questions"("exam_id","number") ON DELETE cascade ON UPDATE cascade;