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
import { generateTuid } from '../../utils';

export const roles = pgEnum('role', ['student', 'staff', 'teacher', 'admin', 'superadmin']);

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
	id: char({ length: 16 }).$default(generateTuid).primaryKey(),
	email: varchar({ length: configConstants.users.maxEmailLength }).unique().notNull(),
	hashed_password: varchar({ length: 1023 }),
	role: roles().notNull(),
	verified: boolean()
		.generatedAlwaysAs(sql`hashed_password IS NOT NULL`)
		.notNull(),
	lastEmailSentAt: timestamp()
		.default(new Date(1970, 0, 1))
		.notNull(),
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
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const exams = pgTable('exams', {
	id: char({ length: 16 }).$default(generateTuid).primaryKey(),
	title: varchar({ length: configConstants.exams.maxTitleLength }).notNull(),
	description: varchar({ length: configConstants.exams.maxDescriptionLength }).notNull(),
	openAt: timestamp().notNull(),
	closeAt: timestamp().notNull(),
	timeLimit: integer().notNull(), // seconds
	gracePeriod: integer().default(configConstants.exams.defaultGracePeriod).notNull(), // seconds
	scoreConfirmed: boolean().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const examsRelation = relations(exams, ({ many }) => ({
	questions: many(questions)
}));

export const questions = pgTable('questions', {
	id: char({ length: 16 }).$default(generateTuid).primaryKey(),
	examId: char({ length: 16 })
		.references(() => exams.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade'
		})
		.notNull(),
	text: text().notNull(),
	questionType: questionTypes().notNull(),
	scoringType: scoringTypes(),
	limit: integer().default(configConstants.questions.defaultTextAnswerLengthLimit), // type=text: lenght limit
	correctAnswer: varchar({ length: configConstants.questions.defaultTextAnswerLengthLimit }), // type=text: correct answer to score against, can be regex
	fileTypes: varchar({ length: 1023 }), // type=file: MIME types for supported file (comma separated)
	fileSizeLimit: integer().default(configConstants.questions.defaultFileSizeLimit), // type=file: upload size limit (MB)
	maxScore: integer().default(configConstants.questions.defaultMaxScore),
	minScore: integer().default(configConstants.questions.defaultMinScore),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const questionsRelation = relations(questions, ({ one, many }) => ({
	exam: one(exams, {
		fields: [questions.examId],
		references: [exams.id]
	}),
	choices: many(choices)
}));

export const choices = pgTable('choices', {
	id: char({ length: 16 }).$default(generateTuid).primaryKey(),
	questionId: char({ length: 16 })
		.references(() => questions.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade'
		})
		.notNull(),
	text: text().notNull(),
	isCorrect: boolean().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const choicesRelation = relations(choices, ({ one }) => ({
	question: one(questions, {
		fields: [choices.questionId],
		references: [questions.id]
	})
}));
