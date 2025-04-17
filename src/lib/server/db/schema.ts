import { relations, sql } from 'drizzle-orm';
import {
	boolean,
	char,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

import { configConstants } from '../../config-constants';
import { utcNow } from '../../datetime';
import { generateGuid, generateToken } from '../../token';

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

export const users = pgTable('users', {
	id: char({ length: Math.ceil(configConstants.entropy.id / 6) })
		.$default(generateGuid)
		.primaryKey(),
	email: varchar({ length: configConstants.users.maxEmailLength }).unique().notNull(),
	hashedPassword: varchar({ length: 1023 }),
	role: roles().notNull(),
	verified: boolean()
		.generatedAlwaysAs(sql`hashed_password IS NOT NULL`)
		.notNull(),
	verificationToken: varchar({ length: 255 }),
	verificationTokenGeneratedAt: timestamp().default(new Date(0)).notNull(),
	passwordResetToken: varchar({ length: 255 }),
	passwordResetTokenGeneratedAt: timestamp().default(new Date(0)).notNull(),
	lastEmailSentAt: timestamp().default(new Date(0)).notNull(),
	prefix: varchar({
		length: configConstants.users.maxPrefixLength,
		enum: ['เด็กชาย', 'เด็กหญิง', 'นาย', 'นางสาว']
	}),
	name: varchar({ length: configConstants.users.maxNameLength }),
	nickname: varchar({ length: configConstants.users.maxNicknameLength }),
	phone: char({ length: configConstants.users.phoneNumberLength }),
	school: varchar({ length: configConstants.users.maxSchoolNameLength }),
	grade: integer(),
	addressProvince: varchar({ length: configConstants.users.maxAddressProvinceLength }),
	addressDistrict: varchar({ length: configConstants.users.maxAddressDistrictLength }),
	addressSubDistrict: varchar({ length: configConstants.users.maxAddressSubDistrictLength }),
	addressPostcode: char({ length: configConstants.users.postcodeLength }),
	addressDetail: varchar({ length: configConstants.users.maxAddressDetailLength }),
	createdAt: timestamp().$default(utcNow).notNull(),
	updatedAt: timestamp().$default(utcNow).$onUpdate(utcNow).notNull()
});

export const sessions = pgTable('sessions', {
	token: char({ length: Math.ceil(configConstants.entropy.token / 6) })
		.$default(generateToken)
		.primaryKey(),
	userId: char({ length: Math.ceil(configConstants.entropy.id / 6) })
		.references(() => users.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade'
		})
		.notNull(),
	firstLoginIP: varchar({ length: 39 }).notNull(),
	firstLoginUserAgent: varchar({ length: 1023 }).notNull(),
	lastUseIP: varchar({ length: 39 }).notNull(),
	lastUseUserAgent: varchar({ length: 1023 }).notNull(),
	createdAt: timestamp().$default(utcNow).notNull(),
	updatedAt: timestamp().$default(utcNow).$onUpdate(utcNow).notNull()
});

export const sessionsRelation = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const exams = pgTable('exams', {
	id: char({ length: Math.ceil(configConstants.entropy.id / 6) })
		.$default(generateGuid)
		.primaryKey(),
	title: varchar({ length: configConstants.exams.maxTitleLength }).notNull(),
	description: varchar({ length: configConstants.exams.maxDescriptionLength }).notNull(),
	openAt: timestamp().notNull(),
	closeAt: timestamp().notNull(),
	timeLimit: integer().notNull(), // seconds
	scoreConfirmed: boolean().default(false).notNull(),
	createdAt: timestamp().$default(utcNow).notNull(),
	updatedAt: timestamp().$default(utcNow).$onUpdate(utcNow).notNull()
});

export const examsRelation = relations(exams, ({ many }) => ({
	questions: many(questions)
}));

export const questions = pgTable('questions', {
	id: char({ length: Math.ceil(configConstants.entropy.id / 6) })
		.$default(generateGuid)
		.primaryKey(),
	examId: char({ length: Math.ceil(configConstants.entropy.id / 6) })
		.references(() => exams.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade'
		})
		.notNull(),
	text: text().notNull(),
	questionType: questionTypes().notNull(),
	maxScore: integer().default(configConstants.questions.defaultMaxScore).notNull(),
	minScore: integer().default(configConstants.questions.defaultMinScore).notNull(),
	scoringType: scoringTypes(),
	textLengthLimit: integer().default(configConstants.questions.defaultTextAnswerLengthLimit), // type=text: lenght limit
	textCorrect: varchar({ length: configConstants.questions.defaultTextAnswerLengthLimit }), // type=text: correct answer to score against, can be regex
	fileTypes: varchar({ length: 1023 }), // type=file: MIME types for supported file (comma separated)
	fileSizeLimit: integer().default(configConstants.questions.defaultFileSizeLimit), // type=file: upload size limit (kB)
	createdAt: timestamp().$default(utcNow).notNull(),
	updatedAt: timestamp().$default(utcNow).$onUpdate(utcNow).notNull()
});

export const questionsRelation = relations(questions, ({ one, many }) => ({
	exam: one(exams, {
		fields: [questions.examId],
		references: [exams.id]
	}),
	choices: many(choices)
}));

export const choices = pgTable('choices', {
	id: char({ length: Math.ceil(configConstants.entropy.id / 6) })
		.$default(generateGuid)
		.primaryKey(),
	questionId: char({ length: Math.ceil(configConstants.entropy.id / 6) })
		.references(() => questions.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade'
		})
		.notNull(),
	text: text().notNull(),
	isCorrect: boolean().notNull(),
	createdAt: timestamp().$default(utcNow).notNull(),
	updatedAt: timestamp().$default(utcNow).$onUpdate(utcNow).notNull()
});

export const choicesRelation = relations(choices, ({ one }) => ({
	question: one(questions, {
		fields: [choices.questionId],
		references: [questions.id]
	})
}));
