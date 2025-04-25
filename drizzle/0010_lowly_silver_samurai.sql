ALTER TABLE "answers" DROP CONSTRAINT "answers_submissionId_questionId_unique";--> statement-breakpoint
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_examId_userId_unique";--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_submission_question_unique" UNIQUE("submission_id","question_id");--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_exam_user_unique" UNIQUE("exam_id","user_id");