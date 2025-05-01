import xlsx from 'node-xlsx';

import { getAnswer, updateAnswerCorrectness } from '$lib/server/db/services/answers';
import { getExamQuestions } from '$lib/server/db/services/exams';
import {
	updateQuestionDefaultScore,
	updateQuestionMaxScore,
	updateQuestionMinScore
} from '$lib/server/db/services/questions';
import { updateSubmissionScore } from '$lib/server/db/services/submissions';
import { getUser } from '$lib/server/db/services/users';

import { getScore } from '../file-export/calculate-exam-score';

async function calculateSum(
	exam: {
		id: string;
		questions: {
			examId: string;
			number: number;
			defaultScore: number;
			minScore: number;
			maxScore: number;
		}[];
	},
	user: { id: string }
): Promise<number> {
	let sum: number = 0;

	for (const question of exam.questions) {
		const answer = await getAnswer(exam.id, question.number, user.id);

		if (answer?.correctness === null || answer?.correctness === undefined) {
			sum += question.defaultScore;
			continue;
		}

		sum += getScore(question, answer.correctness);
	}

	return sum;
}

export async function importExamScore(examId: string, file: File): Promise<void> {
	const exam = await getExamQuestions(examId);

	if (!exam) {
		throw Error('Invalid exam ID');
	}
	const sheets = xlsx.parse(await file.bytes());

	if (sheets.length === 0) {
		throw Error('Workbook does not contain any worksheet');
	}

	const sheet = sheets[0] as {
		name: string;
		data: (string | number | boolean | undefined)[][];
	};

	let examIdVerified = false;

	for (const row of sheet.data) {
		if (
			// @ts-expect-error I have no idea why ts thinks this wouldn't work
			(row[0] instanceof String || typeof row[0] === 'string') &&
			row[0].toLowerCase() === '$exam id'
		) {
			if (row[1] !== exam.id) {
				throw Error("Exam ID mismatch, please make sure you're uploading the correct file");
			} else {
				examIdVerified = true;
				break;
			}
		}
	}

	if (!examIdVerified) {
		throw Error('Cannot verify exam ID, make sure you excel file is in the correct format');
	}

	for (const [rowNumber, row] of sheet.data.entries()) {
		if (row.length === 0) continue;
		// @ts-expect-error I have no idea why ts thinks this wouldn't work
		if (!(row[0] instanceof String || typeof row[0] === 'string') || row[0].startsWith('#')) {
			continue;
		}

		if (row[0].toLowerCase() === '$default') {
			for (const question of exam.questions) {
				let newDefault = row[2 + question.number * 3];
				if (newDefault === undefined) continue;
				if (typeof newDefault === 'string' || (newDefault as unknown) instanceof String) {
					newDefault = Number(newDefault);
					if (isNaN(newDefault)) continue;
				}
				if (typeof newDefault === 'boolean' || (newDefault as unknown) instanceof Boolean) {
					newDefault = newDefault ? 1 : 0;
				}
				await updateQuestionDefaultScore(exam.id, question.number, newDefault);
			}
		} else if (row[0].toLowerCase() === '$min') {
			for (const question of exam.questions) {
				let newMin = row[2 + question.number * 3];
				if (newMin === undefined) continue;
				if (typeof newMin === 'string' || (newMin as unknown) instanceof String) {
					newMin = Number(newMin);
					if (isNaN(newMin)) continue;
				}
				if (typeof newMin === 'boolean' || (newMin as unknown) instanceof Boolean) {
					newMin = newMin ? 1 : 0;
				}
				await updateQuestionMinScore(exam.id, question.number, newMin);
			}
		} else if (row[0].toLowerCase() === '$max') {
			for (const question of exam.questions) {
				let newMax = row[2 + question.number * 3];
				if (newMax === undefined) continue;
				if (typeof newMax === 'string' || (newMax as unknown) instanceof String) {
					newMax = Number(newMax);
					if (isNaN(newMax)) continue;
				}
				if (typeof newMax === 'boolean' || (newMax as unknown) instanceof Boolean) {
					newMax = newMax ? 1 : 0;
				}
				await updateQuestionMaxScore(exam.id, question.number, newMax);
			}
		} else if (row[0].toLowerCase().startsWith('$')) {
			if (row[0].toLowerCase() === '$exam id') continue;
			throw Error(`Sheet '${sheet.name}' Cell A${rowNumber + 1} contains $ directive`);
		} else {
			// @ts-expect-error I have no idea why ts thinks this wouldn't work
			if (!(row[0] instanceof String || typeof row[0] === 'string')) {
				throw Error(`Sheet '${sheet.name}' Cell A${rowNumber + 1} contains invalid user ID`);
			}
			const userId = row[0] as string;
			if (!/^[0-9A-Za-z_-]{22}$/.test(userId)) {
				throw Error(`Sheet '${sheet.name}' Cell A${rowNumber + 1} contains invalid user ID`);
			}

			const user = await getUser(userId);
			if (!user) {
				throw Error(`Sheet '${sheet.name}' Cell A${rowNumber + 1} contains non-existent user ID`);
			}

			for (const question of exam.questions) {
				let newCorrectness = row[2 + question.number * 3] ?? null;
				if (typeof newCorrectness === 'string' || (newCorrectness as unknown) instanceof String) {
					newCorrectness = Number(newCorrectness);
					if (isNaN(newCorrectness)) {
						newCorrectness = null;
					}
				}
				if (typeof newCorrectness === 'boolean' || (newCorrectness as unknown) instanceof Boolean) {
					newCorrectness = newCorrectness ? 1 : 0;
				}
				await updateAnswerCorrectness(exam.id, question.number, user.id, newCorrectness);
			}

			let newSum = row[4 + exam.questions.length * 3];
			if (newSum === undefined) {
				newSum = await calculateSum(exam, user);
			}
			if (typeof newSum === 'string' || (newSum as unknown) instanceof String) {
				newSum = Number(newSum);
				if (isNaN(newSum)) {
					newSum = await calculateSum(exam, user);
				}
			}
			if (typeof newSum === 'boolean' || (newSum as unknown) instanceof Boolean) {
				newSum = await calculateSum(exam, user);
			}

			await updateSubmissionScore(exam.id, user.id, newSum);
		}
	}
}
