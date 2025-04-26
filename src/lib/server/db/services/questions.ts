/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { questions } from '$lib/server/db/schema';

const createQuestionQuery = db
	.insert(questions)
	.values({
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
	.prepare('create_question');

export async function createQuestion(data: {
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
	return createQuestionQuery.execute(data);
}
