/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { and, asc, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { answers, choices, questions } from '$lib/server/db/schema';
import { suidToUuid } from '$lib/server/db/suid';

const createQuestionQuery = db
	.insert(questions)
	.values({
		examId: sql.placeholder('examId'),
		number: sql.placeholder('number'),
		markdown: sql.placeholder('markdown'),
		html: sql.placeholder('html'),
		questionType: sql.placeholder('questionType'),
		defaultScore: sql.placeholder('defaultScore'),
		minScore: sql.placeholder('minScore'),
		maxScore: sql.placeholder('maxScore'),
		scoringType: sql.placeholder('scoringType'),
		textLengthLimit: sql.placeholder('textLengthLimit'),
		textCorrect: sql.placeholder('textCorrect'),
		fileTypes: sql.placeholder('fileTypes'),
		fileSizeLimit: sql.placeholder('fileSizeLimit')
	})
	.prepare('create_question');

const getQuestionChoicesAnswerQuery = db.query.questions
	.findFirst({
		columns: {
			number: true,
			html: true,
			questionType: true,
			textLengthLimit: true,
			fileTypes: true,
			fileSizeLimit: true
		},
		with: {
			choices: {
				columns: {
					number: true,
					html: true
				},
				orderBy: [asc(sql`RANDOM()`)]
			},
			answers: {
				columns: {
					answer: true
				},
				where: and(eq(answers.userId, sql.placeholder('userId')))
			}
		},
		where: and(
			eq(questions.examId, sql.placeholder('examId')),
			eq(questions.number, sql.placeholder('number'))
		)
	})
	.prepare('get_question_choices_answer');

const getQuestionChoiceNumbersQuery = db.query.questions
	.findFirst({
		columns: {
			number: true,
			questionType: true,
			textLengthLimit: true,
			fileTypes: true,
			fileSizeLimit: true
		},
		with: {
			choices: {
				columns: {
					number: true
				}
			}
		},
		where: and(
			eq(questions.examId, sql.placeholder('examId')),
			eq(questions.number, sql.placeholder('number'))
		)
	})
	.prepare('get_question_choice_numbers');

export const updateQuestionDefaultScoreQuery = db
	.update(questions)
	.set({
		defaultScore: sql.placeholder('defaultScore'),
		updatedAt: sql`now()`
	})
	.where(
		and(
			eq(questions.examId, sql.placeholder('examId')),
			eq(questions.number, sql.placeholder('number'))
		)
	)
	.prepare('update_question_default_score');

export const updateQuestionMinScoreQuery = db
	.update(questions)
	.set({
		minScore: sql.placeholder('minScore'),
		updatedAt: sql`now()`
	})
	.where(
		and(
			eq(questions.examId, sql.placeholder('examId')),
			eq(questions.number, sql.placeholder('number'))
		)
	)
	.prepare('update_question_min_score');

export const updateQuestionMaxScoreQuery = db
	.update(questions)
	.set({
		maxScore: sql.placeholder('maxScore'),
		updatedAt: sql`now()`
	})
	.where(
		and(
			eq(questions.examId, sql.placeholder('examId')),
			eq(questions.number, sql.placeholder('number'))
		)
	)
	.prepare('update_question_max_score');

export async function createQuestion(data: {
	examId: string;
	number: number;
	markdown: string;
	html: string;
	questionType: 'choices' | 'checkboxes' | 'text' | 'file' | 'code';
	defaultScore: number;
	minScore: number;
	maxScore: number;
	scoringType: 'exact' | 'regex' | 'and' | 'or' | 'scale' | 'range' | null;
	textLengthLimit: number;
	textCorrect: string | null;
	fileTypes: string | null;
	fileSizeLimit: number;
}) {
	return createQuestionQuery.execute(data);
}

export async function getQuestionChoicesAnswer(examId: string, number: number, userId: string) {
	examId = suidToUuid(examId);
	userId = suidToUuid(userId);
	return getQuestionChoicesAnswerQuery.execute({ examId, number, userId });
}

export async function getQuestionChoiceNumbers(examId: string, number: number) {
	examId = suidToUuid(examId);
	return getQuestionChoiceNumbersQuery.execute({ examId, number });
}

export async function updateQuestionDefaultScore(
	examId: string,
	number: number,
	defaultScore: number
) {
	examId = suidToUuid(examId);
	return updateQuestionDefaultScoreQuery.execute({ examId, number, defaultScore });
}

export async function updateQuestionMinScore(examId: string, number: number, minScore: number) {
	examId = suidToUuid(examId);
	return updateQuestionMinScoreQuery.execute({ examId, number, minScore });
}

export async function updateQuestionMaxScore(examId: string, number: number, maxScore: number) {
	examId = suidToUuid(examId);
	return updateQuestionMaxScoreQuery.execute({ examId, number, maxScore });
}
