/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { exams } from '$lib/server/db/schema';
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
