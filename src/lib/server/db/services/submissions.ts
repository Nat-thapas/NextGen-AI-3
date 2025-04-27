/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { and, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';

import { submissions } from '../schema';
import { suidToUuid } from '../suid';

const createSubmissionQuery = db
	.insert(submissions)
	.values({
		examId: sql.placeholder('examId'),
		userId: sql.placeholder('userId')
	})
	.prepare('create_submission');

const getSubmissionQuery = db.query.submissions
	.findFirst({
		where: and(
			eq(submissions.examId, sql.placeholder('examId')),
			eq(submissions.userId, sql.placeholder('userId'))
		)
	})
	.prepare('get_submission');

const updateSubmissionSubmittedQuery = db
	.update(submissions)
	.set({
		submitted: sql.placeholder('submitted'),
		updatedAt: sql`now()`
	})
	.where(
		and(
			eq(submissions.examId, sql.placeholder('examId')),
			eq(submissions.userId, sql.placeholder('userId'))
		)
	)
	.prepare('update_submission_submitted');

export async function createSubmission(examId: string, userId: string) {
	return createSubmissionQuery.execute({ examId, userId });
}

export async function getSubmission(examId: string, userId: string) {
	examId = suidToUuid(examId);
	userId = suidToUuid(userId);
	return getSubmissionQuery.execute({ examId, userId });
}

export async function updateSubmissionSubmitted(
	examId: string,
	userId: string,
	submitted: boolean
) {
	examId = suidToUuid(examId);
	userId = suidToUuid(userId);
	return updateSubmissionSubmittedQuery.execute({ examId, userId, submitted });
}
