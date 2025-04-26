/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { and, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';

import { submissions } from '../schema';

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

export async function createSubmission(examId: string, userId: string) {
	return createSubmissionQuery.execute({ examId, userId });
}

export async function getSubmission(examId: string, userId: string) {
	return getSubmissionQuery.execute({ examId, userId });
}
