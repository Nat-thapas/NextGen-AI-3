/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { and, asc, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { answers, choices, questions } from '$lib/server/db/schema';

import { suidToUuid } from '../suid';

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
				orderBy: [asc(choices.number)]
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

export async function createQuestion(data: {
	examId: string;
	number: number;
	markdown: string;
	html: string;
	questionType: 'choices' | 'checkboxes' | 'text' | 'file';
	defaultScore: number;
	minScore: number;
	maxScore: number;
	scoringType: 'exact' | 'regex' | 'and' | 'or' | 'scale' | null;
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
