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
import { choices, exams, questions, submissions } from '$lib/server/db/schema';
import { generateId } from '$lib/token';

const createExamReturningQuery = db
	.insert(exams)
	.values({
		id: sql.placeholder('id'),
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

const getExamStartedAtQuery = db
	.select({
		...getTableColumns(exams),
		startedAt: submissions.createdAt
	})
	.from(exams)
	.leftJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(eq(exams.id, sql.placeholder('id')))
	.prepare('get_exam_and_submission');

const getExamQuestionChoicesSubmissionQuery = db.query.exams
	.findFirst({
		columns: {
			id: true,
			openAt: true,
			closeAt: true,
			timeLimit: true
		},
		with: {
			questions: {
				columns: {
					number: true,
					html: true,
					questionType: true,
					textLengthLimit: true,
					fileTypes: true,
					fileSizeLimit: true
				},
				with: {
					choices: {
						columns: {
							number: true,
							html: true
						},
						orderBy: [asc(choices.number)]
					}
				},
				where: eq(questions.number, sql.placeholder('number'))
			},
			submissions: {
				columns: {
					createdAt: true
				},
				where: eq(submissions.userId, sql.placeholder('userId'))
			}
		},
		where: eq(exams.id, sql.placeholder('id'))
	})
	.prepare('get_exam_submission_question_choice');

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
			eq(submissions.submitted, true),
			lte(exams.closeAt, sql`now()`),
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
	.where(and(isNull(submissions.examId), lte(exams.closeAt, sql`now()`)))
	.orderBy(desc(exams.closeAt))
	.prepare('get_exams_expired');

const deleteExamQuery = db
	.delete(exams)
	.where(eq(exams.id, sql.placeholder('id')))
	.prepare('delete_exam');

export async function createExamReturning(data: {
	id?: string;
	ownerId: string;
	title: string;
	description: string;
	openAt: Date;
	closeAt: Date;
	timeLimit: number;
}) {
	data.id ??= generateId();
	return (await createExamReturningQuery.execute(data))[0];
}

export async function getExam(id: string) {
	return getExamQuery.execute({ id });
}

export async function getExamStartedAt(id: string, userId: string) {
	return (await getExamStartedAtQuery.execute({ id, userId }))[0];
}

export async function getExamQuestionChoicesSubmission(id: string, number: number, userId: string) {
	return getExamQuestionChoicesSubmissionQuery.execute({ id, number, userId });
}

export async function getExamsAvailable(userId: string) {
	return getExamsAvailableQuery.execute({ userId });
}

export async function getExamsUpcoming(userId: string) {
	return getExamsUpcomingQuery.execute({ userId });
}

export async function getExamsCompleted(userId: string) {
	return getExamsCompletedQuery.execute({ userId });
}

export async function getExamsExpired(userId: string) {
	return getExamsExpiredQuery.execute({ userId });
}

export async function deleteExam(id: string) {
	return deleteExamQuery.execute({ id });
}
