CREATE TYPE "public"."question_types" AS ENUM('choices', 'checkboxes', 'text', 'file');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'staff', 'teacher', 'admin', 'superadmin');--> statement-breakpoint
CREATE TYPE "public"."scoring_types" AS ENUM('exact', 'regex', 'and', 'or', 'scale');--> statement-breakpoint
CREATE TABLE "choices" (
	"id" char(16) PRIMARY KEY NOT NULL,
	"questionId" char(16) NOT NULL,
	"text" text NOT NULL,
	"isCorrect" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" char(16) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(65535) NOT NULL,
	"openAt" timestamp NOT NULL,
	"closeAt" timestamp NOT NULL,
	"timeLimit" integer NOT NULL,
	"gracePeriod" integer DEFAULT 15 NOT NULL,
	"scoreConfirmed" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" char(16) PRIMARY KEY NOT NULL,
	"examId" char(16) NOT NULL,
	"text" text NOT NULL,
	"questionType" "question_types" NOT NULL,
	"scoringType" "scoring_types",
	"limit" integer DEFAULT 1024,
	"correctAnswer" varchar(1024),
	"fileTypes" varchar(1023),
	"fileSizeLimit" integer DEFAULT 25,
	"maxScore" integer DEFAULT 1,
	"minScore" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" char(16) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" varchar(1023),
	"role" "role" NOT NULL,
	"prefix" varchar(63),
	"name" varchar(255),
	"nickname" varchar(63),
	"phone" char(10),
	"school" varchar(255),
	"grade" integer,
	"addressProvince" varchar(255),
	"addressDistrict" varchar(255),
	"addressSubDistrict" varchar(255),
	"addressPostcode" char(5),
	"addressDetail" varchar(1023),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_questionId_questions_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_examId_exams_id_fk" FOREIGN KEY ("examId") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;