import { isNotNull, relations, sql } from 'drizzle-orm';
import {
	boolean,
	doublePrecision,
	foreignKey,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp
} from 'drizzle-orm/pg-core';

import { suid } from './suid';

const timeStamps = {
	createdAt: timestamp({ precision: 6, withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ precision: 6, withTimezone: true }).defaultNow().notNull()
};

export const roles = pgEnum('role', [
	'registrant',
	'student',
	'staff',
	'teacher',
	'admin',
	'superadmin'
]);

// choices: multiple choices, pick one
// checkboxes: multiple choices, pick multiple
// text: text answer
// file: upload a file as answer
export const questionTypes = pgEnum('question_types', ['choices', 'checkboxes', 'text', 'file']);

// Scoring methods for checkboxes and text questions
// checkboxes:
//   - exact: must tick all boxes correctly (both true and false) to get maxScore, else get minScore
//   - and: must tick at least all correct boxes to get maxScore, else get minScore (eg. correct answer is 1 and 3, user ticking 1, 2, 3 will get maxScore)
//   - or: must tick at least one correct boxes to get maxScore, else get minScore (eg. correct answer is 1 and 3, user ticking 1 or 1, 2 will get maxScore)
//   - scale: linearly interpolate between minScore and maxScore based on how many boxes got tick correctly
//            (eg. correct answer is 1 and 3, user ticking 1, 4 (ticking 1, not ticking 2 = 2 correct out of 4) will get half way between minScore and maxScore)
// text:
//   - exact: must match the correct answer exactly
//   - regex: must match the correct answer provided in regex form
//   - scale: perform sequence matching to estimate how correct the answer is (warning: this is not very accurate) and give score based on that
export const scoringTypes = pgEnum('scoring_types', ['exact', 'regex', 'and', 'or', 'scale']);

export const users = pgTable(
	'users',
	{
		id: suid()
			.default(sql`gen_random_uuid()`)
			.primaryKey(),
		role: roles().notNull(),
		email: text().unique().notNull(),
		hashedPassword: text(),
		registrationComplete: boolean().default(false).notNull(),
		verificationToken: text(),
		verificationTokenGeneratedAt: timestamp({ precision: 6, withTimezone: true })
			.default(new Date(0))
			.notNull(),
		passwordResetToken: text(),
		passwordResetTokenGeneratedAt: timestamp({ precision: 6, withTimezone: true })
			.default(new Date(0))
			.notNull(),
		lastEmailSentAt: timestamp({ precision: 6, withTimezone: true }).default(new Date(0)).notNull(),
		prefix: text(),
		name: text(),
		nickname: text(),
		phoneNumber: text(),
		schoolName: text(),
		grade: integer(),
		transcriptId: suid().references(() => files.id, {
			onUpdate: 'cascade',
			onDelete: 'set null'
		}),
		addressProvince: text(),
		addressDistrict: text(),
		addressSubDistrict: text(),
		addressPostcode: text(),
		addressDetail: text(),
		...timeStamps
	},
	(table) => [
		index().on(table.verificationToken).where(isNotNull(table.verificationToken)),
		index().on(table.passwordResetToken).where(isNotNull(table.passwordResetToken))
	]
);

export const usersRelation = relations(users, ({ one }) => ({
	transcript: one(files, {
		fields: [users.transcriptId],
		references: [files.id]
	})
}));

export const sessions = pgTable(
	'sessions',
	{
		token: text().primaryKey(),
		userId: suid()
			.references(() => users.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull(),
		firstLoginIp: text().notNull(),
		firstLoginUserAgent: text().notNull(),
		lastUseIp: text().notNull(),
		lastUseUserAgent: text().notNull(),
		...timeStamps
	},
	(table) => [index().on(table.userId)]
);

export const sessionsRelation = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const exams = pgTable(
	'exams',
	{
		id: suid()
			.default(sql`gen_random_uuid()`)
			.primaryKey(),
		title: text().notNull(),
		description: text().notNull(),
		openAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
		closeAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
		timeLimit: integer().notNull(), // seconds
		...timeStamps
	},
	(table) => [index().on(table.openAt, table.closeAt), index().on(table.closeAt)]
);

export const examsRelation = relations(exams, ({ many }) => ({
	questions: many(questions),
	submissions: many(submissions)
}));

export const questions = pgTable(
	'questions',
	{
		examId: suid()
			.references(() => exams.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull(),
		number: integer().notNull(),
		markdown: text().notNull(),
		html: text().notNull(),
		questionType: questionTypes().notNull(),
		defaultScore: doublePrecision().notNull(),
		minScore: doublePrecision().notNull(),
		maxScore: doublePrecision().notNull(),
		scoringType: scoringTypes(),
		textLengthLimit: integer().notNull(), // type=text: lenght limit
		textCorrect: text(), // type=text: correct answer to score against, can be regex
		fileTypes: text(), // type=file: MIME types for supported file (comma separated)
		fileSizeLimit: integer().notNull(), // type=file: upload size limit (kB)
		...timeStamps
	},
	(table) => [primaryKey({ columns: [table.examId, table.number] })]
);

export const questionsRelation = relations(questions, ({ one, many }) => ({
	exam: one(exams, {
		fields: [questions.examId],
		references: [exams.id]
	}),
	choices: many(choices),
	answers: many(answers)
}));

export const choices = pgTable(
	'choices',
	{
		examId: suid().notNull(),
		questionNumber: integer().notNull(),
		number: integer().notNull(),
		markdown: text().notNull(),
		html: text().notNull(),
		isCorrect: boolean().notNull(),
		...timeStamps
	},
	(table) => [
		primaryKey({ columns: [table.examId, table.questionNumber, table.number] }),
		foreignKey({
			columns: [table.examId, table.questionNumber],
			foreignColumns: [questions.examId, questions.number]
		})
			.onUpdate('cascade')
			.onDelete('cascade')
	]
);

export const choicesRelation = relations(choices, ({ one }) => ({
	question: one(questions, {
		fields: [choices.examId, choices.questionNumber],
		references: [questions.examId, questions.number]
	})
}));

export const submissions = pgTable(
	'submissions',
	{
		examId: suid()
			.references(() => exams.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull(),
		userId: suid()
			.references(() => users.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull(),
		submitted: boolean().default(false).notNull(),
		score: doublePrecision(),
		...timeStamps
	},
	(table) => [primaryKey({ columns: [table.examId, table.userId] })]
);

export const submissionsRelation = relations(submissions, ({ one, many }) => ({
	exam: one(exams, {
		fields: [submissions.examId],
		references: [exams.id]
	}),
	user: one(users, {
		fields: [submissions.userId],
		references: [users.id]
	}),
	answers: many(answers)
}));

export const answers = pgTable(
	'answers',
	{
		examId: suid().notNull(),
		questionNumber: integer().notNull(),
		userId: suid().notNull(),
		answer: text().notNull(),
		correctness: doublePrecision(),
		...timeStamps
	},
	(table) => [
		primaryKey({ columns: [table.examId, table.questionNumber, table.userId] }),
		foreignKey({
			columns: [table.examId, table.questionNumber],
			foreignColumns: [questions.examId, questions.number]
		})
			.onUpdate('cascade')
			.onDelete('cascade'),
		foreignKey({
			columns: [table.examId, table.userId],
			foreignColumns: [submissions.examId, submissions.userId]
		})
			.onUpdate('cascade')
			.onDelete('cascade')
	]
);

export const answersRelation = relations(answers, ({ one }) => ({
	submission: one(submissions, {
		fields: [answers.examId, answers.userId],
		references: [submissions.examId, submissions.userId]
	}),
	question: one(questions, {
		fields: [answers.examId, answers.questionNumber],
		references: [questions.examId, questions.number]
	})
}));

export const leaderboards = pgTable('leaderboards', {
	id: suid()
		.default(sql`gen_random_uuid()`)
		.primaryKey(),
	name: text().notNull(),
	order: integer().notNull(),
	...timeStamps
});

export const leaderboardsRelation = relations(leaderboards, ({ many }) => ({
	leaderboardsToExams: many(leaderboardsToExams)
}));

export const leaderboardsToExams = pgTable(
	'leaderboards_to_exams',
	{
		leaderboardId: suid()
			.references(() => leaderboards.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull(),
		examId: suid()
			.references(() => exams.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull()
	},
	(table) => [primaryKey({ columns: [table.leaderboardId, table.examId] })]
);

export const leaderboardsToExamsRelation = relations(leaderboardsToExams, ({ one }) => ({
	leaderboard: one(leaderboards, {
		fields: [leaderboardsToExams.leaderboardId],
		references: [leaderboards.id]
	}),
	exams: one(exams, {
		fields: [leaderboardsToExams.examId],
		references: [exams.id]
	})
}));

export const announcements = pgTable('announcements', {
	id: suid()
		.default(sql`gen_random_uuid()`)
		.primaryKey(),
	title: text().notNull(),
	markdown: text().notNull(),
	html: text().notNull(),
	...timeStamps
});

export const files = pgTable(
	'files',
	{
		id: suid()
			.default(sql`gen_random_uuid()`)
			.primaryKey(),
		size: integer().notNull(),
		mimeType: text().notNull(),
		extension: text().notNull(),
		referenceId: suid(),
		...timeStamps
	},
	(table) => [index().on(table.referenceId)]
);
