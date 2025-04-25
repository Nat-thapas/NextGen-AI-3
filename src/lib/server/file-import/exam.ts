import fs from 'node:fs/promises';
import { join } from 'node:path';

import mimeTypes from 'mime-types';
import xlsx from 'node-xlsx';
import unzipper from 'unzipper';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { questionTypes } from '$lib/enums';
import { getExtension } from '$lib/files';
import { renderMarkdown } from '$lib/markdown';
import { createChoiceReturning, deleteChoice } from '$lib/server/db/services/choices';
import { createExamReturning, deleteExam } from '$lib/server/db/services/exams';
import {
	createFileWithReferenceReturning,
	deleteFileReturning
} from '$lib/server/db/services/files';
import { createQuestionReturning, deleteQuestion } from '$lib/server/db/services/questions';
import { updateAssets } from '$lib/server/file-import/update-assets';
import type { Question } from '$lib/server/interfaces/quesion';

function parseFileTypes(fileTypes: string | null): string | null {
	if (fileTypes === null || fileTypes === undefined) {
		return null;
	}

	const fileTypesArray = fileTypes?.split(/[,;] ?/);
	const parsedFileTypesArray: string[] = [];
	for (const fileType of fileTypesArray) {
		const contentType = mimeTypes.contentType(fileType);
		if (!contentType) continue;
		const semicolonIndex = contentType.indexOf(';');
		if (semicolonIndex === -1) continue;
		parsedFileTypesArray.push(contentType.slice(0, semicolonIndex));
	}
	if (parsedFileTypesArray.length > 0) {
		return parsedFileTypesArray.join(', ');
	}
	return null;
}

export async function importExam(
	data: {
		ownerId: string;
		title: string;
		description: string;
		openAt: Date;
		closeAt: Date;
		timeLimit: number;
	},
	file: File
): Promise<void> {
	const archive = await unzipper.Open.buffer(Buffer.from(await file.arrayBuffer()));

	const exam = await createExamReturning(data);
	const assets: Record<string, string> = {};
	const assetIds: string[] = [];
	const questionIds: string[] = [];
	const choiceIds: string[] = [];

	let sheets:
		| {
				name: string;
				data: (string | number | boolean | Date)[][];
		  }[]
		| undefined = undefined;

	try {
		for (const compressed of archive.files) {
			if (compressed.type !== 'File') continue;

			if (/^(?:[^/]*?)\.xlsx/.test(compressed.path)) {
				if (sheets) {
					throw Error('Multiple excel (.xlsx) files found in root directory');
				}
				sheets = xlsx.parse(await compressed.buffer());
			} else {
				const mimeType = mimeTypes.lookup(compressed.path) || 'application/octet-stream';
				const extension = getExtension(compressed.path, mimeType);
				const file = await createFileWithReferenceReturning({
					size: compressed.uncompressedSize,
					mimeType,
					extension,
					referenceId: exam.id
				});
				assetIds.push(file.id);
				await fs.writeFile(join(env.FILE_STORAGE_PATH, file.storedName), compressed.stream());
				assets[compressed.path] = `${base}/api/public/files/${file.storedName}`;
			}
		}

		if (!sheets) {
			throw Error('No excel (.xlsx) file found');
		}

		let question: Question | undefined = undefined;
		let questionNumber = 0;
		let choiceNumber = 0;
		for (const sheet of sheets) {
			const name = sheet.name;
			const data = sheet.data;
			for (const [rowNumber, row] of data.entries()) {
				if (row.length === 0) continue;
				if (!(row[0] instanceof String) || !row[0].startsWith('$')) continue;

				if (row[0].toLowerCase() === '$question') {
					if (row[1] === undefined) {
						throw Error(`Sheet '${name}' Cell B${rowNumber + 1} (Question text) is empty`);
					}
					const markdown = updateAssets(String(row[1]), assets);

					if (row[2] === undefined) {
						throw Error(`Sheet '${name}' Cell C${rowNumber + 1} (Question type) is empty`);
					}
					const questionType = String(row[2]).toLowerCase() as
						| 'choices'
						| 'checkboxes'
						| 'text'
						| 'file';
					if (!['choices', 'checkboxes', 'text', 'file'].includes(questionType)) {
						throw Error(`Sheet '${name}' Cell C${rowNumber + 1} (Question type) is invalid`);
					}

					const maxScore = Number(row[3] ?? 1);
					const minScore = Number(row[4] ?? 0);

					if (
						(questionType === questionTypes.checkboxes || questionType === questionTypes.text) &&
						row[5] === undefined
					) {
						throw Error(`Sheet '${name}' Cell F${rowNumber + 1} (Scoring type) is empty`);
					}
					const scoringType = (
						questionType === questionTypes.checkboxes || questionType === questionTypes.text
							? String(row[5]).toLowerCase()
							: null
					) as 'exact' | 'regex' | 'and' | 'or' | 'scale' | null;
					if (
						scoringType !== null &&
						!['exact', 'regex', 'and', 'or', 'scale'].includes(scoringType)
					) {
						throw Error(`Sheet '${name}' Cell F${rowNumber + 1} (Scoring type) is invalid`);
					}

					const textLengthLimit =
						questionType === questionTypes.text ? Number(row[6] ?? 1000) : null;
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
					const fileSizeLimit =
						questionType === questionTypes.file ? Number(row[9] ?? 10_000) : null;

					const fileTypes = parseFileTypes(rawFileTypes);

					questionNumber++;
					choiceNumber = 0;

					question = await createQuestionReturning({
						examId: exam.id,
						number: questionNumber,
						markdown,
						html: renderMarkdown(markdown),
						questionType,
						maxScore,
						minScore,
						scoringType,
						textLengthLimit,
						textCorrect,
						fileTypes,
						fileSizeLimit
					});
					questionIds.push(question.id);
				}

				if (row[0].toLowerCase() === '$choice') {
					if (question === undefined) {
						throw Error(
							`Sheet '${name}' Cell A${rowNumber + 1} Choice is defined before a question`
						);
					}

					if (row[1] === undefined) {
						throw Error(`Sheet '${name}' Cell B${rowNumber + 1} (Choice text) is empty`);
					}
					const markdown = updateAssets(String(row[1]), assets);

					const isCorrect =
						String(row[2]).toLowerCase() === 'true' || (row[2] instanceof Number && row[2] !== 0);

					choiceNumber++;

					const choice = await createChoiceReturning({
						questionId: question.id,
						number: choiceNumber,
						markdown,
						html: renderMarkdown(markdown),
						isCorrect
					});
					choiceIds.push(choice.id);
				}
			}
		}
	} finally {
		await Promise.allSettled(
			assetIds.map(async (id) => {
				const file = await deleteFileReturning(id);
				if (file) {
					try {
						await fs.unlink(join(env.FILE_STORAGE_PATH, file.storedName));
					} catch {} // eslint-disable-line no-empty
				}
			})
		);
		await Promise.allSettled(choiceIds.map((id) => deleteChoice(id)));
		await Promise.allSettled(questionIds.map((id) => deleteQuestion(id)));
		try {
			await deleteExam(exam.id);
		} catch (err) {
			console.error(`Failed to delete exam id: '${exam.id}' after import failure`);
			console.error(err);
		}
	}
}
