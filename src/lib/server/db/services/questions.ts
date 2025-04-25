/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { questions } from '$lib/server/db/schema';
import { generateId } from '$lib/token';

const createQuestionReturningQuery = db
	.insert(questions)
	.values({
		id: sql.placeholder('id'),
		examId: sql.placeholder('examId'),
		number: sql.placeholder('number'),
		markdown: sql.placeholder('markdown'),
		html: sql.placeholder('html'),
		questionType: sql.placeholder('questionType'),
		maxScore: sql.placeholder('maxScore'),
		minScore: sql.placeholder('minScore'),
		scoringType: sql.placeholder('scoringType'),
		textLengthLimit: sql.placeholder('textLengthLimit'),
		textCorrect: sql.placeholder('textCorrect'),
		fileTypes: sql.placeholder('fileTypes'),
		fileSizeLimit: sql.placeholder('fileSizeLimit')
	})
	.returning()
	.prepare('create_question_returning');

const deleteQuestionQuery = db
	.delete(questions)
	.where(eq(questions.id, sql.placeholder('id')))
	.prepare('delete_question');

export async function createQuestionReturning(data: {
	id?: string;
	examId: string;
	number: number;
	markdown: string;
	html: string;
	questionType: 'choices' | 'checkboxes' | 'text' | 'file';
	maxScore: number;
	minScore: number;
	scoringType: 'exact' | 'regex' | 'and' | 'or' | 'scale' | null;
	textLengthLimit: number | null;
	textCorrect: string | null;
	fileTypes: string | null;
	fileSizeLimit: number | null;
}) {
	data.id ??= generateId();
	return (await createQuestionReturningQuery.execute(data))[0];
}

export async function deleteQuestion(id: string) {
	return deleteQuestionQuery.execute({ id });
}
