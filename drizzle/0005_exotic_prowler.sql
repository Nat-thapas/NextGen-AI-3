CREATE INDEX "announcements_author" ON "announcements" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "choices_question" ON "choices" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "questions_exam" ON "questions" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "sessions_user" ON "sessions" USING btree ("user_id");