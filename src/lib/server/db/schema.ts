import { isNotNull, relations, sql, type SQL } from 'drizzle-orm';
import {
	boolean,
	char,
	foreignKey,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

import { configConstants } from '../../config-constants';

const idLength = Math.ceil((Math.ceil(configConstants.entropy.id / 8) * 4) / 3);
const tokenLength = Math.ceil((Math.ceil(configConstants.entropy.token / 8) * 4) / 3);

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
		id: char({ length: idLength }).primaryKey(),
		role: roles().notNull(),
		email: varchar({ length: configConstants.users.maxEmailLength }).unique().notNull(),
		hashedPassword: varchar({ length: 1023 }),
		registrationComplete: boolean().default(false).notNull(),
		verificationToken: varchar({ length: 255 }),
		verificationTokenGeneratedAt: timestamp({ precision: 6, withTimezone: true })
			.default(new Date(0))
			.notNull(),
		passwordResetToken: varchar({ length: 255 }),
		passwordResetTokenGeneratedAt: timestamp({ precision: 6, withTimezone: true })
			.default(new Date(0))
			.notNull(),
		lastEmailSentAt: timestamp({ precision: 6, withTimezone: true }).default(new Date(0)).notNull(),
		prefix: varchar({ length: configConstants.users.maxPrefixLength }),
		name: varchar({ length: configConstants.users.maxNameLength }),
		nickname: varchar({ length: configConstants.users.maxNicknameLength }),
		phoneNumber: char({ length: configConstants.users.phoneNumberLength }),
		schoolName: varchar({ length: configConstants.users.maxSchoolNameLength }),
		grade: integer(),
		transcriptId: char({ length: idLength }).references(() => files.id, {
			onUpdate: 'cascade',
			onDelete: 'set null'
		}),
		addressProvince: varchar({ length: configConstants.users.maxAddressProvinceLength }),
		addressDistrict: varchar({ length: configConstants.users.maxAddressDistrictLength }),
		addressSubDistrict: varchar({ length: configConstants.users.maxAddressSubDistrictLength }),
		addressPostcode: char({ length: configConstants.users.postcodeLength }),
		addressDetail: varchar({ length: configConstants.users.maxAddressDetailLength }),
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
		token: char({ length: tokenLength }).primaryKey(),
		userId: char({ length: idLength })
			.references(() => users.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull(),
		firstLoginIp: varchar({ length: 63 }).notNull(),
		firstLoginUserAgent: varchar({ length: 1023 }).notNull(),
		lastUseIp: varchar({ length: 63 }).notNull(),
		lastUseUserAgent: varchar({ length: 1023 }).notNull(),
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
		id: char({ length: idLength }).primaryKey(),
		ownerId: char({ length: idLength }).references(() => users.id, {
			onUpdate: 'cascade',
			onDelete: 'set null'
		}),
		title: varchar({ length: configConstants.exams.maxTitleLength }).notNull(),
		description: varchar({ length: configConstants.exams.maxDescriptionLength }).notNull(),
		openAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
		closeAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
		timeLimit: integer().notNull(), // seconds
		scoreConfirmed: boolean().default(false).notNull(),
		...timeStamps
	},
	(table) => [index().on(table.openAt, table.closeAt), index().on(table.closeAt)]
);

export const examsRelation = relations(exams, ({ one, many }) => ({
	owner: one(users, {
		fields: [exams.ownerId],
		references: [users.id]
	}),
	questions: many(questions),
	choices: many(choices),
	submissions: many(submissions)
}));

export const questions = pgTable(
	'questions',
	{
		examId: char({ length: idLength })
			.references(() => exams.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull(),
		number: integer().notNull(),
		markdown: text().notNull(),
		html: text().notNull(),
		questionType: questionTypes().notNull(),
		maxScore: integer().default(configConstants.questions.defaultMaxScore).notNull(),
		minScore: integer().default(configConstants.questions.defaultMinScore).notNull(),
		scoringType: scoringTypes(),
		textLengthLimit: integer().default(configConstants.questions.defaultTextAnswerLengthLimit), // type=text: lenght limit
		textCorrect: varchar({ length: configConstants.questions.defaultTextAnswerLengthLimit }), // type=text: correct answer to score against, can be regex
		fileTypes: varchar({ length: 1023 }), // type=file: MIME types for supported file (comma separated)
		fileSizeLimit: integer().default(configConstants.questions.defaultFileSizeLimit), // type=file: upload size limit (kB)
		...timeStamps
	},
	(table) => [primaryKey({ columns: [table.examId, table.number] })]
);

export const questionsRelation = relations(questions, ({ one, many }) => ({
	exam: one(exams, {
		fields: [questions.examId],
		references: [exams.id]
	}),
	choices: many(choices)
}));

export const choices = pgTable(
	'choices',
	{
		examId: char({ length: idLength }).notNull(),
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
	exam: one(exams, {
		fields: [choices.examId],
		references: [exams.id]
	}),
	question: one(questions, {
		fields: [choices.examId, choices.questionNumber],
		references: [questions.examId, questions.number]
	})
}));

export const submissions = pgTable(
	'submissions',
	{
		examId: char({ length: idLength })
			.references(() => exams.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull(),
		userId: char({ length: idLength })
			.references(() => users.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade'
			})
			.notNull(),
		submitted: boolean().default(false).notNull(),
		score: integer(),
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
		examId: char({ length: idLength }).notNull(),
		userId: char({ length: idLength }).notNull(),
		questionNumber: integer().notNull(),
		answer: text().notNull()
	},
	(table) => [
		primaryKey({ columns: [table.examId, table.userId, table.questionNumber] }),
		foreignKey({
			columns: [table.examId, table.userId],
			foreignColumns: [submissions.examId, submissions.userId]
		})
			.onUpdate('cascade')
			.onDelete('cascade'),
		foreignKey({
			columns: [table.examId, table.questionNumber],
			foreignColumns: [questions.examId, questions.number]
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

export const announcements = pgTable(
	'announcements',
	{
		id: char({ length: idLength }).primaryKey(),
		authorId: char({ length: idLength }).references(() => users.id, {
			onUpdate: 'cascade',
			onDelete: 'set null'
		}),
		title: varchar({ length: configConstants.announcements.maxTitleLength }).notNull(),
		markdown: text().notNull(),
		html: text().notNull(),
		...timeStamps
	},
	(table) => [index().on(table.authorId)]
);

export const announcementsRelation = relations(announcements, ({ one }) => ({
	author: one(users, {
		fields: [announcements.authorId],
		references: [users.id]
	})
}));

export const files = pgTable(
	'files',
	{
		id: char({ length: idLength }).primaryKey(),
		size: integer().notNull(),
		mimeType: varchar({ length: 255 }).notNull(),
		extension: varchar({ length: 255 }).notNull(),
		storedName: varchar({ length: 1023 })
			.generatedAlwaysAs((): SQL => sql`${files.id} || ${files.extension}`)
			.notNull(),
		referenceId: char({ length: idLength }),
		...timeStamps
	},
	(table) => [index().on(table.referenceId)]
);
