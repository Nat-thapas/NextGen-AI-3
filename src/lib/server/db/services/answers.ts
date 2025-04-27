/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { and, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { answers } from '$lib/server/db/schema';

import { suidToUuid } from '../suid';

export const getAnswerQuery = db.query.answers
	.findFirst({
		where: and(
			eq(answers.examId, sql.placeholder('examId')),
			eq(answers.questionNumber, sql.placeholder('questionNumber')),
			eq(answers.userId, sql.placeholder('userId'))
		)
	})
	.prepare('get_answer');

export const upsertAnswerQuery = db
	.insert(answers)
	.values({
		examId: sql.placeholder('examId'),
		questionNumber: sql.placeholder('questionNumber'),
		userId: sql.placeholder('userId'),
		answer: sql.placeholder('answer')
	})
	.onConflictDoUpdate({
		target: [answers.examId, answers.questionNumber, answers.userId],
		set: { answer: sql.placeholder('answer') }
	})
	.prepare('upsert_answer');

export async function getAnswer(examId: string, questionNumber: number, userId: string) {
	examId = suidToUuid(examId);
	userId = suidToUuid(userId);
	return getAnswerQuery.execute({ examId, questionNumber, userId });
}

export async function upsertAnswer(
	examId: string,
	questionNumber: number,
	userId: string,
	answer: string
) {
	return upsertAnswerQuery.execute({ examId, questionNumber, userId, answer });
}
