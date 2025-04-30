/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { and, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { answers } from '$lib/server/db/schema';
import { suidToUuid } from '$lib/server/db/suid';

const getAnswerQuery = db.query.answers
	.findFirst({
		where: and(
			eq(answers.examId, sql.placeholder('examId')),
			eq(answers.questionNumber, sql.placeholder('questionNumber')),
			eq(answers.userId, sql.placeholder('userId'))
		)
	})
	.prepare('get_answer');

const upsertAnswerQuery = db
	.insert(answers)
	.values({
		examId: sql.placeholder('examId'),
		questionNumber: sql.placeholder('questionNumber'),
		userId: sql.placeholder('userId'),
		answer: sql.placeholder('answer')
	})
	.onConflictDoUpdate({
		target: [answers.examId, answers.questionNumber, answers.userId],
		set: { answer: sql.placeholder('answer'), updatedAt: sql`now()` }
	})
	.prepare('upsert_answer');

const updateAnswerQuery = db
	.update(answers)
	.set({
		answer: sql.placeholder('answer'),
		updatedAt: sql`now()`
	})
	.where(
		and(
			eq(answers.examId, sql.placeholder('examId')),
			eq(answers.questionNumber, sql.placeholder('questionNumber')),
			eq(answers.userId, sql.placeholder('userId'))
		)
	)
	.prepare('update_answer');

const updateAnswerCorrectnessQuery = db
	.update(answers)
	.set({
		correctness: sql.placeholder('correctness'),
		updatedAt: sql`now()`
	})
	.where(
		and(
			eq(answers.examId, sql.placeholder('examId')),
			eq(answers.questionNumber, sql.placeholder('questionNumber')),
			eq(answers.userId, sql.placeholder('userId'))
		)
	)
	.prepare('update_answer');

const deleteAnswerReturningQuery = db
	.delete(answers)
	.where(
		and(
			eq(answers.examId, sql.placeholder('examId')),
			eq(answers.questionNumber, sql.placeholder('questionNumber')),
			eq(answers.userId, sql.placeholder('userId'))
		)
	)
	.returning()
	.prepare('delete_answer_returning');

const deleteAnswerQuery = db
	.delete(answers)
	.where(
		and(
			eq(answers.examId, sql.placeholder('examId')),
			eq(answers.questionNumber, sql.placeholder('questionNumber')),
			eq(answers.userId, sql.placeholder('userId'))
		)
	)
	.prepare('delete_answer');

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

export async function updateAnswer(
	examId: string,
	questionNumber: number,
	userId: string,
	answer: string
) {
	examId = suidToUuid(examId);
	userId = suidToUuid(userId);
	return updateAnswerQuery.execute({ examId, questionNumber, userId, answer });
}

export async function updateAnswerCorrectness(
	examId: string,
	questionNumber: number,
	userId: string,
	correctness: number | null
) {
	examId = suidToUuid(examId);
	userId = suidToUuid(userId);
	return updateAnswerCorrectnessQuery.execute({ examId, questionNumber, userId, correctness });
}

export async function deleteAnswerReturning(
	examId: string,
	questionNumber: number,
	userId: string
) {
	examId = suidToUuid(examId);
	userId = suidToUuid(userId);
	return (await deleteAnswerReturningQuery.execute({ examId, questionNumber, userId }))[0];
}

export async function deleteAnswer(examId: string, questionNumber: number, userId: string) {
	examId = suidToUuid(examId);
	userId = suidToUuid(userId);
	return deleteAnswerQuery.execute({ examId, questionNumber, userId });
}
