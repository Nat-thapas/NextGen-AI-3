/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { choices } from '$lib/server/db/schema';
import { generateId } from '$lib/token';

const createChoiceQuery = db
	.insert(choices)
	.values({
		id: sql.placeholder('id'),
		questionId: sql.placeholder('questionId'),
		number: sql.placeholder('number'),
		markdown: sql.placeholder('markdown'),
		html: sql.placeholder('html'),
		isCorrect: sql.placeholder('isCorrect')
	})
	.returning()
	.prepare('create-choice');

export async function createChoice(data: {
	id?: string;
	questionId: string;
	number: number;
	markdown: string;
	html: string;
	isCorrect: boolean;
}) {
	data.id ??= generateId();
	return createChoiceQuery.execute();
}
