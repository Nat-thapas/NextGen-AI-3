/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { sql } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { testcases } from '$lib/server/db/schema';

const createTestcaseQuery = db
	.insert(testcases)
	.values({
		examId: sql.placeholder('examId'),
		questionNumber: sql.placeholder('questionNumber'),
		number: sql.placeholder('number'),
		stdin: sql.placeholder('stdin'),
		expectedOut: sql.placeholder('expectedOut'),
		isHidden: sql.placeholder('isHidden'),
		codeTimeLimitMs: sql.placeholder('codeTimeLimitMs'),
		codeMemoryLimitKb: sql.placeholder('codeMemoryLimitKb')
	})
	.prepare('create_testcase');

export async function createTestcase(data: {
	examId: string;
	questionNumber: number;
	number: number;
	stdin: string | null;
	expectedOut: string | null;
	isHidden: boolean;
	codeTimeLimitMs: number;
	codeMemoryLimitKb: number;
}) {
	return createTestcaseQuery.execute(data);
}

export async function getTestcases(examId: string, questionNumber: number) {
	return db
		.select()
		.from(testcases)
		.where(
			and(
				eq(testcases.examId, examId),
				eq(testcases.questionNumber, questionNumber)
			)
		)
		.orderBy(testcases.number);
}
