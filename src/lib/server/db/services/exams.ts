/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	gt,
	isNotNull,
	isNull,
	lte,
	or,
	sql
} from 'drizzle-orm';

import { db } from '$lib/server/db';
import { answers, exams, questions, submissions } from '$lib/server/db/schema';

import { suidToUuid } from '../suid';

const createExamReturningQuery = db
	.insert(exams)
	.values({
		ownerId: sql.placeholder('ownerId'),
		title: sql.placeholder('title'),
		description: sql.placeholder('description'),
		openAt: sql.placeholder('openAt'),
		closeAt: sql.placeholder('closeAt'),
		timeLimit: sql.placeholder('timeLimit')
	})
	.returning()
	.prepare('create_exam_returning');

const getExamQuery = db.query.exams
	.findFirst({
		where: eq(exams.id, sql.placeholder('id'))
	})
	.prepare('get_exam');

const getExamSubmissionQuery = db
	.select({
		...getTableColumns(exams),
		submission: { submitted: submissions.submitted, createdAt: submissions.createdAt }
	})
	.from(exams)
	.leftJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(eq(exams.id, sql.placeholder('id')))
	.prepare('get_exam_submission');

const getExamQuestionAnswerSubmissionQuery = db.query.exams
	.findFirst({
		columns: {
			id: true,
			title: true,
			openAt: true,
			closeAt: true,
			timeLimit: true
		},
		with: {
			questions: {
				columns: {
					number: true
				},
				with: {
					answers: {
						columns: {
							questionNumber: true
						},
						where: eq(answers.userId, sql.placeholder('userId'))
					}
				},
				orderBy: [asc(questions.number)]
			},
			submissions: {
				columns: {
					submitted: true,
					createdAt: true
				},
				where: eq(submissions.userId, sql.placeholder('userId'))
			}
		},
		where: eq(exams.id, sql.placeholder('id'))
	})
	.prepare('get_exam_question_answer_submission');

const getExamsAvailableQuery = db
	.select({
		...getTableColumns(exams),
		attempted: sql<boolean>`${isNotNull(submissions.examId)}`
	})
	.from(exams)
	.leftJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(
		and(
			lte(exams.openAt, sql`now()`),
			gt(exams.closeAt, sql`now()`),
			or(
				isNull(submissions.examId),
				and(
					eq(submissions.submitted, false),
					sql`${submissions.createdAt} > now() - (${exams.timeLimit} || ' seconds')::INTERVAL`
				)
			)
		)
	)
	.orderBy(asc(exams.closeAt))
	.prepare('get_exams_available');

const getExamsUpcomingQuery = db
	.select({
		...getTableColumns(exams)
	})
	.from(exams)
	.leftJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(
		and(
			gt(exams.openAt, sql`now()`),
			or(
				isNull(submissions.examId),
				and(
					eq(submissions.submitted, false),
					sql`${submissions.createdAt} > now() - (${exams.timeLimit} || ' seconds')::INTERVAL`
				)
			)
		)
	)
	.orderBy(asc(exams.openAt))
	.prepare('get_exams_upcoming');

const getExamsCompletedQuery = db
	.select({
		...getTableColumns(exams)
	})
	.from(exams)
	.innerJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(
		or(
			lte(exams.closeAt, sql`now()`),
			eq(submissions.submitted, true),
			sql`${submissions.createdAt} <= now() - (${exams.timeLimit} || ' seconds')::INTERVAL`
		)
	)
	.orderBy(desc(exams.closeAt))
	.prepare('get_exams_completed');

const getExamsExpiredQuery = db
	.select({
		...getTableColumns(exams)
	})
	.from(exams)
	.leftJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(and(lte(exams.closeAt, sql`now()`), isNull(submissions.examId)))
	.orderBy(desc(exams.closeAt))
	.prepare('get_exams_expired');

const deleteExamQuery = db
	.delete(exams)
	.where(eq(exams.id, sql.placeholder('id')))
	.prepare('delete_exam');

export async function createExamReturning(data: {
	ownerId: string;
	title: string;
	description: string;
	openAt: Date;
	closeAt: Date;
	timeLimit: number;
}) {
	return (await createExamReturningQuery.execute(data))[0];
}

export async function getExam(id: string) {
	id = suidToUuid(id);
	return getExamQuery.execute({ id });
}

export async function getExamSubmission(id: string, userId: string) {
	id = suidToUuid(id);
	userId = suidToUuid(userId);
	return (await getExamSubmissionQuery.execute({ id, userId }))[0];
}

export async function getExamQuestionAnswerSubmission(id: string, userId: string) {
	id = suidToUuid(id);
	userId = suidToUuid(userId);
	return getExamQuestionAnswerSubmissionQuery.execute({ id, userId });
}

export async function getExamsAvailable(userId: string) {
	userId = suidToUuid(userId);
	return getExamsAvailableQuery.execute({ userId });
}

export async function getExamsUpcoming(userId: string) {
	userId = suidToUuid(userId);
	return getExamsUpcomingQuery.execute({ userId });
}

export async function getExamsCompleted(userId: string) {
	userId = suidToUuid(userId);
	return getExamsCompletedQuery.execute({ userId });
}

export async function getExamsExpired(userId: string) {
	userId = suidToUuid(userId);
	return getExamsExpiredQuery.execute({ userId });
}

export async function deleteExam(id: string) {
	id = suidToUuid(id);
	return deleteExamQuery.execute({ id });
}
