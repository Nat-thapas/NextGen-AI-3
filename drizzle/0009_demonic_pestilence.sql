CREATE TABLE "answers" (
	"id" char(20) PRIMARY KEY NOT NULL,
	"submission_id" char(20) NOT NULL,
	"question_id" char(20) NOT NULL,
	"answer" text NOT NULL,
	CONSTRAINT "answers_submissionId_questionId_unique" UNIQUE("submission_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" char(20) PRIMARY KEY NOT NULL,
	"exam_id" char(20) NOT NULL,
	"user_id" char(20) NOT NULL,
	"submitted" boolean DEFAULT false NOT NULL,
	"score" integer,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submissions_examId_userId_unique" UNIQUE("exam_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "answers_submission" ON "answers" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "answers_question" ON "answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "submissions_exam" ON "submissions" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "submissions_user" ON "submissions" USING btree ("user_id");