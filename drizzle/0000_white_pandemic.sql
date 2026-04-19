CREATE TYPE "public"."question_types" AS ENUM('choices', 'checkboxes', 'text', 'file', 'code');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('registrant', 'student', 'staff', 'teacher', 'admin', 'superadmin');--> statement-breakpoint
CREATE TYPE "public"."scoring_types" AS ENUM('exact', 'regex', 'and', 'or', 'scale', 'range');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"markdown" text NOT NULL,
	"html" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"exam_id" uuid NOT NULL,
	"question_number" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"correctness" double precision,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "answers_exam_id_question_number_user_id_pk" PRIMARY KEY("exam_id","question_number","user_id")
);
--> statement-breakpoint
CREATE TABLE "choices" (
	"exam_id" uuid NOT NULL,
	"question_number" integer NOT NULL,
	"number" integer NOT NULL,
	"markdown" text NOT NULL,
	"html" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "choices_exam_id_question_number_number_pk" PRIMARY KEY("exam_id","question_number","number")
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"open_at" timestamp (6) with time zone NOT NULL,
	"close_at" timestamp (6) with time zone NOT NULL,
	"time_limit" integer NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"extension" text NOT NULL,
	"reference_id" uuid,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboards_to_exams" (
	"leaderboard_id" uuid NOT NULL,
	"exam_id" uuid NOT NULL,
	CONSTRAINT "leaderboards_to_exams_leaderboard_id_exam_id_pk" PRIMARY KEY("leaderboard_id","exam_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"exam_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"markdown" text NOT NULL,
	"html" text NOT NULL,
	"question_type" "question_types" NOT NULL,
	"default_score" double precision NOT NULL,
	"min_score" double precision NOT NULL,
	"max_score" double precision NOT NULL,
	"scoring_type" "scoring_types",
	"text_length_limit" integer NOT NULL,
	"text_correct" text,
	"file_types" text,
	"file_size_limit" integer NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_exam_id_number_pk" PRIMARY KEY("exam_id","number")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"first_login_ip" text NOT NULL,
	"first_login_user_agent" text NOT NULL,
	"last_use_ip" text NOT NULL,
	"last_use_user_agent" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"exam_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"submitted" boolean DEFAULT false NOT NULL,
	"score" double precision,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submissions_exam_id_user_id_pk" PRIMARY KEY("exam_id","user_id")
);
--> statement-breakpoint
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role" NOT NULL,
	"email" text NOT NULL,
	"registered" boolean NOT NULL,
	"prefix" text,
	"name" text,
	"nickname" text,
	"phone_number" text,
	"school_name" text,
	"grade" text,
	"transcript_id" uuid,
	"address_province" text,
	"address_district" text,
	"address_sub_district" text,
	"address_postcode" text,
	"address_detail" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_exam_id_question_number_questions_exam_id_number_fk" FOREIGN KEY ("exam_id","question_number") REFERENCES "public"."questions"("exam_id","number") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_exam_id_user_id_submissions_exam_id_user_id_fk" FOREIGN KEY ("exam_id","user_id") REFERENCES "public"."submissions"("exam_id","user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_exam_id_question_number_questions_exam_id_number_fk" FOREIGN KEY ("exam_id","question_number") REFERENCES "public"."questions"("exam_id","number") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leaderboards_to_exams" ADD CONSTRAINT "leaderboards_to_exams_leaderboard_id_leaderboards_id_fk" FOREIGN KEY ("leaderboard_id") REFERENCES "public"."leaderboards"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leaderboards_to_exams" ADD CONSTRAINT "leaderboards_to_exams_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "testcases" ADD CONSTRAINT "testcases_exam_id_question_number_questions_exam_id_number_fk" FOREIGN KEY ("exam_id","question_number") REFERENCES "public"."questions"("exam_id","number") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_transcript_id_files_id_fk" FOREIGN KEY ("transcript_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "exams_open_at_close_at_index" ON "exams" USING btree ("open_at","close_at");--> statement-breakpoint
CREATE INDEX "exams_close_at_index" ON "exams" USING btree ("close_at");--> statement-breakpoint
CREATE INDEX "files_reference_id_index" ON "files" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id");