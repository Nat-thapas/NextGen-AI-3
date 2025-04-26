/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { choices } from '$lib/server/db/schema';

const createChoiceQuery = db
	.insert(choices)
	.values({
		examId: sql.placeholder('examId'),
		questionNumber: sql.placeholder('questionNumber'),
		number: sql.placeholder('number'),
		markdown: sql.placeholder('markdown'),
		html: sql.placeholder('html'),
		isCorrect: sql.placeholder('isCorrect')
	})
	.prepare('create_choice');

export async function createChoice(data: {
	examId: string;
	questionNumber: number;
	number: number;
	markdown: string;
	html: string;
	isCorrect: boolean;
}) {
	return createChoiceQuery.execute(data);
}
