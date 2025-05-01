/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	gt,
	isNotNull,
	isNull,
	lte,
	or,
	sql
} from 'drizzle-orm';

import { db } from '$lib/server/db';
import { answers, choices, exams, questions, submissions } from '$lib/server/db/schema';
import { suidToUuid } from '$lib/server/db/suid';

const createExamReturningQuery = db
	.insert(exams)
	.values({
		ownerId: sql.placeholder('ownerId'),
		title: sql.placeholder('title'),
		description: sql.placeholder('description'),
		openAt: sql.placeholder('openAt'),
		closeAt: sql.placeholder('closeAt'),
		timeLimit: sql.placeholder('timeLimit')
	})
	.returning()
	.prepare('create_exam_returning');

const getExamQuery = db.query.exams
	.findFirst({
		where: eq(exams.id, sql.placeholder('id'))
	})
	.prepare('get_exam');

const getExamQuestionsQuery = db.query.exams
	.findFirst({
		columns: {
			id: true
		},
		with: {
			questions: {
				columns: {
					examId: true,
					number: true,
					defaultScore: true,
					minScore: true,
					maxScore: true
				},
				orderBy: [asc(questions.number)]
			}
		},
		where: eq(exams.id, sql.placeholder('id'))
	})
	.prepare('get_exam_questions');

const getExamSubmissionQuery = db
	.select({
		...getTableColumns(exams),
		submission: { submitted: submissions.submitted, createdAt: submissions.createdAt }
	})
	.from(exams)
	.leftJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(eq(exams.id, sql.placeholder('id')))
	.prepare('get_exam_submission');

const getExamQuestionAnswerSubmissionQuery = db.query.exams
	.findFirst({
		columns: {
			id: true,
			title: true,
			openAt: true,
			closeAt: true,
			timeLimit: true
		},
		with: {
			questions: {
				columns: {
					number: true
				},
				with: {
					answers: {
						columns: {
							questionNumber: true
						},
						where: eq(answers.userId, sql.placeholder('userId'))
					}
				},
				orderBy: [asc(questions.number)]
			},
			submissions: {
				columns: {
					submitted: true,
					createdAt: true
				},
				where: eq(submissions.userId, sql.placeholder('userId'))
			}
		},
		where: eq(exams.id, sql.placeholder('id'))
	})
	.prepare('get_exam_question_answer_submission');

const getExamQuestionsChoicesSubmissionsQuery = db.query.exams
	.findFirst({
		columns: {
			id: true
		},
		with: {
			questions: {
				columns: {
					examId: true,
					number: true,
					questionType: true,
					defaultScore: true,
					minScore: true,
					maxScore: true,
					scoringType: true,
					textCorrect: true
				},
				with: {
					choices: {
						columns: {
							examId: true,
							questionNumber: true,
							number: true,
							isCorrect: true
						},
						orderBy: [asc(choices.number)]
					}
				},
				orderBy: [asc(questions.number)]
			},
			submissions: {
				columns: {
					examId: true,
					userId: true
				}
			}
		},
		where: eq(exams.id, sql.placeholder('id'))
	})
	.prepare('get_exam_questions_choices_submissions');

const getExamQuestionsChoicesSubmissionsUsersQuery = db.query.exams
	.findFirst({
		columns: {
			id: true
		},
		with: {
			questions: {
				columns: {
					examId: true,
					number: true,
					questionType: true,
					defaultScore: true,
					minScore: true,
					maxScore: true,
					scoringType: true
				},
				with: {
					choices: {
						columns: {
							examId: true,
							questionNumber: true,
							number: true
						},
						extras: {
							shortMarkdown: sql<string>`left(${choices.markdown}, 64)`.as('short_markdown')
						},
						orderBy: [asc(choices.number)]
					}
				},
				extras: {
					shortMarkdown: sql<string>`left(${questions.markdown}, 64)`.as('short_markdown')
				},
				orderBy: [asc(questions.number)]
			},
			submissions: {
				columns: {
					examId: true,
					userId: true,
					score: true
				},
				with: {
					user: {
						columns: {
							id: true,
							prefix: true,
							name: true,
							email: true
						}
					}
				}
			}
		},
		where: eq(exams.id, sql.placeholder('id'))
	})
	.prepare('get_exam_questions_choices_submissions_users');

const getExamsAvailableQuery = db
	.select({
		...getTableColumns(exams),
		attempted: sql<boolean>`${isNotNull(submissions.examId)}`
	})
	.from(exams)
	.leftJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(
		and(
			lte(exams.openAt, sql`now()`),
			gt(exams.closeAt, sql`now()`),
			or(
				isNull(submissions.examId),
				and(
					eq(submissions.submitted, false),
					sql`${submissions.createdAt} > now() - (${exams.timeLimit} || ' seconds')::INTERVAL`
				)
			)
		)
	)
	.orderBy(asc(exams.closeAt))
	.prepare('get_exams_available');

const getExamsUpcomingQuery = db
	.select({
		...getTableColumns(exams)
	})
	.from(exams)
	.leftJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(
		and(
			gt(exams.openAt, sql`now()`),
			or(
				isNull(submissions.examId),
				and(
					eq(submissions.submitted, false),
					sql`${submissions.createdAt} > now() - (${exams.timeLimit} || ' seconds')::INTERVAL`
				)
			)
		)
	)
	.orderBy(asc(exams.openAt))
	.prepare('get_exams_upcoming');

const getExamsCompletedQuery = db
	.select({
		...getTableColumns(exams)
	})
	.from(exams)
	.innerJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(
		or(
			lte(exams.closeAt, sql`now()`),
			eq(submissions.submitted, true),
			sql`${submissions.createdAt} <= now() - (${exams.timeLimit} || ' seconds')::INTERVAL`
		)
	)
	.orderBy(desc(exams.closeAt))
	.prepare('get_exams_completed');

const getExamsExpiredQuery = db
	.select({
		...getTableColumns(exams)
	})
	.from(exams)
	.leftJoin(
		submissions,
		and(eq(submissions.examId, exams.id), eq(submissions.userId, sql.placeholder('userId')))
	)
	.where(and(lte(exams.closeAt, sql`now()`), isNull(submissions.examId)))
	.orderBy(desc(exams.closeAt))
	.prepare('get_exams_expired');

const deleteExamQuery = db
	.delete(exams)
	.where(eq(exams.id, sql.placeholder('id')))
	.prepare('delete_exam');

export async function createExamReturning(data: {
	ownerId: string;
	title: string;
	description: string;
	openAt: Date;
	closeAt: Date;
	timeLimit: number;
}) {
	return (await createExamReturningQuery.execute(data))[0];
}

export async function getExam(id: string) {
	id = suidToUuid(id);
	return getExamQuery.execute({ id });
}

export async function getExamQuestions(id: string) {
	id = suidToUuid(id);
	return getExamQuestionsQuery.execute({ id });
}

export async function getExamSubmission(id: string, userId: string) {
	id = suidToUuid(id);
	userId = suidToUuid(userId);
	return (await getExamSubmissionQuery.execute({ id, userId }))[0];
}

export async function getExamQuestionAnswerSubmission(id: string, userId: string) {
	id = suidToUuid(id);
	userId = suidToUuid(userId);
	return getExamQuestionAnswerSubmissionQuery.execute({ id, userId });
}

export async function getExamQuestionsChoicesSubmissions(id: string) {
	id = suidToUuid(id);
	return getExamQuestionsChoicesSubmissionsQuery.execute({ id });
}

export async function getExamQuestionsChoicesSubmissionsUsers(id: string) {
	id = suidToUuid(id);
	return getExamQuestionsChoicesSubmissionsUsersQuery.execute({ id });
}

export async function getExamsAvailable(userId: string) {
	userId = suidToUuid(userId);
	return getExamsAvailableQuery.execute({ userId });
}

export async function getExamsUpcoming(userId: string) {
	userId = suidToUuid(userId);
	return getExamsUpcomingQuery.execute({ userId });
}

export async function getExamsCompleted(userId: string) {
	userId = suidToUuid(userId);
	return getExamsCompletedQuery.execute({ userId });
}

export async function getExamsExpired(userId: string) {
	userId = suidToUuid(userId);
	return getExamsExpiredQuery.execute({ userId });
}

export async function deleteExam(id: string) {
	id = suidToUuid(id);
	return deleteExamQuery.execute({ id });
}
