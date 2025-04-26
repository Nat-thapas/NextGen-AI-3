CREATE TYPE "public"."question_types" AS ENUM('choices', 'checkboxes', 'text', 'file');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('registrant', 'student', 'staff', 'teacher', 'admin', 'superadmin');--> statement-breakpoint
CREATE TYPE "public"."scoring_types" AS ENUM('exact', 'regex', 'and', 'or', 'scale');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" char(20) PRIMARY KEY NOT NULL,
	"author_id" char(20),
	"title" varchar(1023) NOT NULL,
	"markdown" text NOT NULL,
	"html" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"exam_id" char(20) NOT NULL,
	"user_id" char(20) NOT NULL,
	"question_number" integer NOT NULL,
	"answer" text NOT NULL,
	CONSTRAINT "answers_exam_id_user_id_question_number_pk" PRIMARY KEY("exam_id","user_id","question_number")
);
--> statement-breakpoint
CREATE TABLE "choices" (
	"exam_id" char(20) NOT NULL,
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
	"id" char(20) PRIMARY KEY NOT NULL,
	"owner_id" char(20),
	"title" varchar(255) NOT NULL,
	"description" varchar(65535) NOT NULL,
	"open_at" timestamp (6) with time zone NOT NULL,
	"close_at" timestamp (6) with time zone NOT NULL,
	"time_limit" integer NOT NULL,
	"score_confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" char(20) PRIMARY KEY NOT NULL,
	"size" integer NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"extension" varchar(255) NOT NULL,
	"stored_name" varchar(1023) GENERATED ALWAYS AS ("files"."id" || "files"."extension") STORED NOT NULL,
	"reference_id" char(20),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"exam_id" char(20) NOT NULL,
	"number" integer NOT NULL,
	"markdown" text NOT NULL,
	"html" text NOT NULL,
	"question_type" "question_types" NOT NULL,
	"max_score" integer DEFAULT 1 NOT NULL,
	"min_score" integer DEFAULT 0 NOT NULL,
	"scoring_type" "scoring_types",
	"text_length_limit" integer DEFAULT 1024,
	"text_correct" varchar(1024),
	"file_types" varchar(1023),
	"file_size_limit" integer DEFAULT 25,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_exam_id_number_pk" PRIMARY KEY("exam_id","number")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" char(80) PRIMARY KEY NOT NULL,
	"user_id" char(20) NOT NULL,
	"first_login_ip" varchar(63) NOT NULL,
	"first_login_user_agent" varchar(1023) NOT NULL,
	"last_use_ip" varchar(63) NOT NULL,
	"last_use_user_agent" varchar(1023) NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"exam_id" char(20) NOT NULL,
	"user_id" char(20) NOT NULL,
	"submitted" boolean DEFAULT false NOT NULL,
	"score" integer,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submissions_exam_id_user_id_pk" PRIMARY KEY("exam_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" char(20) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" varchar(1023),
	"role" "role" NOT NULL,
	"registration_complete" boolean DEFAULT false NOT NULL,
	"verification_token" varchar(255),
	"verification_token_generated_at" timestamp (6) with time zone DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	"password_reset_token" varchar(255),
	"password_reset_token_generated_at" timestamp (6) with time zone DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	"last_email_sent_at" timestamp (6) with time zone DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	"prefix" varchar(63),
	"name" varchar(255),
	"nickname" varchar(63),
	"phone_number" char(10),
	"school_name" varchar(255),
	"grade" integer,
	"transcript_id" char(20),
	"address_province" varchar(255),
	"address_district" varchar(255),
	"address_sub_district" varchar(255),
	"address_postcode" char(5),
	"address_detail" varchar(1023),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_exam_id_user_id_submissions_exam_id_user_id_fk" FOREIGN KEY ("exam_id","user_id") REFERENCES "public"."submissions"("exam_id","user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_exam_id_question_number_questions_exam_id_number_fk" FOREIGN KEY ("exam_id","question_number") REFERENCES "public"."questions"("exam_id","number") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_exam_id_question_number_questions_exam_id_number_fk" FOREIGN KEY ("exam_id","question_number") REFERENCES "public"."questions"("exam_id","number") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_transcript_id_files_id_fk" FOREIGN KEY ("transcript_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "announcements_author_id_index" ON "announcements" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "exams_open_at_close_at_index" ON "exams" USING btree ("open_at","close_at");--> statement-breakpoint
CREATE INDEX "exams_close_at_index" ON "exams" USING btree ("close_at");--> statement-breakpoint
CREATE INDEX "files_reference_id_index" ON "files" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_verification_token_index" ON "users" USING btree ("verification_token") WHERE "users"."verification_token" is not null;--> statement-breakpoint
CREATE INDEX "users_password_reset_token_index" ON "users" USING btree ("password_reset_token") WHERE "users"."password_reset_token" is not null;