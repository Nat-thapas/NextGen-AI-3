SET TIME ZONE 'UTC';
CREATE TYPE "public"."question_types" AS ENUM('choices', 'checkboxes', 'text', 'file');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('registrant', 'student', 'staff', 'teacher', 'admin', 'superadmin');--> statement-breakpoint
CREATE TYPE "public"."scoring_types" AS ENUM('exact', 'regex', 'and', 'or', 'scale');--> statement-breakpoint
CREATE TABLE "choices" (
	"id" char(16) PRIMARY KEY NOT NULL,
	"question_id" char(16) NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" char(16) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(65535) NOT NULL,
	"open_at" timestamp NOT NULL,
	"close_at" timestamp NOT NULL,
	"time_limit" integer NOT NULL,
	"score_confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" char(16) PRIMARY KEY NOT NULL,
	"exam_id" char(16) NOT NULL,
	"text" text NOT NULL,
	"question_type" "question_types" NOT NULL,
	"max_score" integer DEFAULT 1 NOT NULL,
	"min_score" integer DEFAULT 0 NOT NULL,
	"scoring_type" "scoring_types",
	"text_length_limit" integer DEFAULT 1024,
	"text_correct" varchar(1024),
	"file_types" varchar(1023),
	"file_size_limit" integer DEFAULT 25,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "users" (
	"id" char(16) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" varchar(1023),
	"role" "role" NOT NULL,
	"verified" boolean GENERATED ALWAYS AS (hashed_password IS NOT NULL) STORED NOT NULL,
	"verification_token" varchar(255),
	"verification_token_generated_at" timestamp DEFAULT '1970-01-01 00:00:00.000' NOT NULL,
	"password_reset_token" varchar(255),
	"password_reset_token_generated_at" timestamp DEFAULT '1970-01-01 00:00:00.000' NOT NULL,
	"last_email_sent_at" timestamp DEFAULT '1970-01-01 00:00:00.000' NOT NULL,
	"prefix" varchar(63),
	"name" varchar(255),
	"nickname" varchar(63),
	"phone" char(10),
	"school" varchar(255),
	"grade" integer,
	"address_province" varchar(255),
	"address_district" varchar(255),
	"address_sub_district" varchar(255),
	"address_postcode" char(5),
	"address_detail" varchar(1023),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;