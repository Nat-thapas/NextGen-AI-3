import mime from 'mime-types';
import xlsx from 'node-xlsx';

import { questionTypes } from '$lib/enums';
import { db } from '$lib/server/db';
import { choices, exams, questions } from '$lib/server/db/schema';
import type { Exam } from '$lib/server/interfaces/exam';
import type { Question } from '$lib/server/interfaces/quesion';

export async function importBuffer(buffer: Buffer, assets: Record<string, string>): Promise<void> {
	const sheets = xlsx.parse(buffer);

	for (const { data } of sheets) {
		let exam: Exam | undefined;
		let question: Question | undefined;
		for (const row of data) {
			if (row.length === 0) continue;
			if (row[0] instanceof String && row[0].startsWith('#')) {
				continue;
			}

			if (row[0] === '$Exam') {
				if (row.length < 6) {
					throw Error(
						`Exam '${row[1]}' definition is invalid, does not contain at least 6 columns`
					);
				}

				exam = (
					await db
						.insert(exams)
						.values({
							title: String(row[1]),
							description: String(row[2]),
							openAt: new Date(row[3]),
							closeAt: new Date(row[4]),
							timeLimit: +row[5]
						})
						.returning()
				)[0];
			}

			if (row[0] === '$Question') {
				if (exam === undefined) {
					throw Error(`Question '${row[1]}' is defined before an exam`);
				}

				if (row.length < 5) {
					throw Error(
						`Question '${row[1]}' definition is invalid, does not contain at least 5 columns`
					);
				}

				const originalText = String(row[1]);

				// The regex is for matching images in markdown
				const assetMatches = originalText.matchAll(/(!\[.*?\]\()(.*?)\)/g);

				let text: string = '';
				let index: number = 0;

				for (const match of assetMatches) {
					let path = match[2];
					if (path.startsWith('/')) {
						path = path.slice(1);
					}

					if (!(path in assets)) continue;

					text += originalText.slice(index, match.index + match[1].length) + assets[path];

					index = match.index + match[1].length + match[2].length;
				}

				text += originalText.slice(index);

				const questionType = String(row[2]).toLowerCase() as
					| 'choices'
					| 'checkboxes'
					| 'text'
					| 'file';
				if (!['choices', 'checkboxes', 'text', 'file'].includes(questionType)) {
					throw Error(`Invalid question type on quesion '${text}'`);
				}

				const maxScore = Number(row[3] ?? 1);
				const minScore = Number(row[4] ?? 0);

				const scoringType = (
					questionType === questionTypes.checkboxes || questionType === questionTypes.text
						? String(row[5]).toLowerCase()
						: null
				) as 'exact' | 'regex' | 'and' | 'or' | 'scale' | null;

				if (
					scoringType !== null &&
					!['exact', 'regex', 'and', 'or', 'scale'].includes(scoringType)
				) {
					throw Error(`Invalid scoring type on quesion '${text}'`);
				}

				const textLengthLimit = questionType === questionTypes.text ? Number(row[6] ?? 250) : null;
				const textCorrect =
					questionType === questionTypes.text
						? row[7] === undefined
							? null
							: String(row[7])
						: null;

				const rawFileTypes =
					questionType === questionTypes.file
						? row[8] === undefined
							? null
							: String(row[8])
						: null;
				const fileSizeLimit = questionType === questionTypes.file ? Number(row[9] ?? 10_000) : null;

				let fileTypes: string | null = null;
				if (questionType === questionTypes.file) {
					const fileTypesArray = rawFileTypes?.split(/[,;] ?/);
					const parsedFileTypesArray: string[] = [];
					if (fileTypesArray !== undefined) {
						for (const fileType of fileTypesArray) {
							const contentType = mime.contentType(fileType);
							if (!contentType) continue;
							const semicolonIndex = contentType.indexOf(';');
							if (semicolonIndex === -1) continue;
							parsedFileTypesArray.push(contentType.slice(0, semicolonIndex));
						}
					}
					if (parsedFileTypesArray.length > 0) {
						fileTypes = parsedFileTypesArray.join(', ');
					}
				}

				question = (
					await db
						.insert(questions)
						.values({
							text,
							examId: exam.id,
							questionType,
							maxScore,
							minScore,
							textLengthLimit,
							textCorrect,
							fileTypes,
							fileSizeLimit
						})
						.returning()
				)[0];
			}

			if (row[0] === '$Choices') {
				if (question === undefined) {
					throw Error(`Choice '${row[1]}' is defined before a question`);
				}

				if (row.length < 3) {
					throw Error(
						`Choice '${row[1]}' definition is invalid, does not contain at least 3 columns`
					);
				}

				let text = String(row[1]);

				// The regex is for matching images in markdown
				const assetMatches = text.matchAll(/(!\[.*?\]\()(.*?)\)/g);

				for (const match of assetMatches) {
					let path = match[2];
					if (path.startsWith('/')) {
						path = path.slice(1);
					}

					if (!(path in assets)) continue;

					text =
						text.slice(0, match.index + match[1].length) +
						assets[path] +
						text.slice(match.index + match[1].length + match[2].length);
				}

				await db.insert(choices).values({
					questionId: question.id,
					text: String(row[1]),
					isCorrect: String(row[2]).toLowerCase() === 'true'
				});
			}
		}
	}
}
