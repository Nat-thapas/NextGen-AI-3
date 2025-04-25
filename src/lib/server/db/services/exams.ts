/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { and, asc, desc, eq, exists, gt, lte, notExists, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { exams, submissions } from '$lib/server/db/schema';
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
	.prepare('create-exam-returning');

const getExamsAvailableQuery = db.query.exams
	.findMany({
		where: and(
			lte(exams.openAt, sql`now()`),
			gt(exams.closeAt, sql`now()`),
			notExists(
				db
					.select()
					.from(submissions)
					.where(
						and(
							eq(submissions.examId, exams.id),
							eq(submissions.userId, sql.placeholder('userId')),
							eq(submissions.submitted, true)
						)
					)
			)
		),
		orderBy: [asc(exams.closeAt)]
	})
	.prepare('get_exams_available');

const getExamsUpcomingQuery = db.query.exams
	.findMany({
		where: gt(exams.openAt, sql`now()`),
		orderBy: [asc(exams.openAt)]
	})
	.prepare('get_exams_upcoming');

const getExamsCompletedQuery = db.query.exams
	.findMany({
		where: exists(
			db
				.select()
				.from(submissions)
				.where(
					and(
						eq(submissions.examId, exams.id),
						eq(submissions.userId, sql.placeholder('userId')),
						eq(submissions.submitted, true)
					)
				)
		),
		orderBy: [desc(exams.closeAt)]
	})
	.prepare('get_exams_completed');

const getExamsExpiredQuery = db.query.exams
	.findMany({
		where: and(
			lte(exams.closeAt, sql`now()`),
			notExists(
				db
					.select()
					.from(submissions)
					.where(
						and(
							eq(submissions.examId, exams.id),
							eq(submissions.userId, sql.placeholder('userId')),
							eq(submissions.submitted, true)
						)
					)
			)
		),
		orderBy: [desc(exams.closeAt)]
	})
	.prepare('get_exams_expired');

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

export async function getExamsAvailable(userId: string) {
	return getExamsAvailableQuery.execute({ userId });
}

export async function getExamsUpcoming() {
	return getExamsUpcomingQuery.execute();
}

export async function getExamsCompleted(userId: string) {
	return getExamsCompletedQuery.execute({ userId });
}

export async function getExamsExpired(userId: string) {
	return getExamsExpiredQuery.execute({ userId });
}
