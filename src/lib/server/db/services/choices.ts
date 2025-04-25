/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { eq, sql } from 'drizzle-orm';

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
	.prepare('create_choice');

const createChoiceReturningQuery = db
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
	.prepare('create_choice_returning');

const deleteChoiceQuery = db
	.delete(choices)
	.where(eq(choices.id, sql.placeholder('id')))
	.prepare('delete_choice');

export async function createChoice(data: {
	id?: string;
	questionId: string;
	number: number;
	markdown: string;
	html: string;
	isCorrect: boolean;
}) {
	data.id ??= generateId();
	return createChoiceQuery.execute(data);
}

export async function createChoiceReturning(data: {
	id?: string;
	questionId: string;
	number: number;
	markdown: string;
	html: string;
	isCorrect: boolean;
}) {
	data.id ??= generateId();
	return (await createChoiceReturningQuery.execute(data))[0];
}

export async function deleteChoice(id: string) {
	return deleteChoiceQuery.execute({ id });
}
