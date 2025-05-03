import fs from 'node:fs/promises';
import { join } from 'node:path';

import mimeTypes from 'mime-types';
import xlsx from 'node-xlsx';
import sharp from 'sharp';
import unzipper from 'unzipper';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { configConstants } from '$lib/config-constants';
import { questionTypes, scoringTypes } from '$lib/enums';
import { getExtension } from '$lib/files';
import { renderMarkdown } from '$lib/markdown';
import { createChoice } from '$lib/server/db/services/choices';
import { createExamReturning, deleteExam } from '$lib/server/db/services/exams';
import {
	createFileReturning,
	deleteFilesByReferenceReturning
} from '$lib/server/db/services/files';
import { createQuestion } from '$lib/server/db/services/questions';
import { updateAssets } from '$lib/server/file-import/update-assets';

import { parseRegexString } from '../file-export/calculate-exam-score';

function parseFileTypes(fileTypes: string | null): string | null {
	if (fileTypes === null || fileTypes === undefined) {
		return null;
	}

	const fileTypesArray = fileTypes?.split(/ *[,;] */);
	const parsedFileTypesArray: string[] = [];
	for (const fileType of fileTypesArray) {
		const contentType = mimeTypes.contentType(fileType);
		if (!contentType) continue;
		const semicolonIndex = contentType.indexOf(';');
		if (semicolonIndex === -1) {
			parsedFileTypesArray.push(contentType);
		} else {
			parsedFileTypesArray.push(contentType.slice(0, semicolonIndex));
		}
	}
	if (parsedFileTypesArray.length > 0) {
		return parsedFileTypesArray.join(', ');
	}
	return null;
}

export async function importExam(
	data: {
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

	let sheets:
		| {
				name: string;
				data: (string | number | boolean | undefined)[][];
		  }[]
		| undefined = undefined;

	try {
		for (const compressed of archive.files) {
			if (compressed.type !== 'File') continue;

			if (/^(?:[^/]*?)\.xlsx$/.test(compressed.path)) {
				if (sheets) {
					throw Error('Multiple excel (.xlsx) files found in root directory');
				}
				sheets = xlsx.parse(await compressed.buffer());
			} else {
				let buffer = await compressed.buffer();
				let size = buffer.length;
				let mimeType = mimeTypes.lookup(compressed.path) || 'application/octet-stream';
				let extension = getExtension(compressed.path, mimeType);

				if (
					configConstants.assets.enableImageOptimization &&
					[
						'image/bmp',
						'image/vnd.microsoft.icon',
						'image/jpeg',
						'image/png',
						'image/tiff',
						'image/webp'
					].includes(mimeType)
				) {
					try {
						buffer = await sharp(buffer, {
							autoOrient: true
						})
							.avif({ quality: 75, effort: 7, chromaSubsampling: '4:4:4' })
							.toBuffer();
						size = buffer.length;
						mimeType = 'image/avif';
						extension = '.avif';
					} catch {} // eslint-disable-line no-empty
				}

				const file = await createFileReturning({
					size,
					mimeType,
					extension,
					referenceId: exam.id
				});
				await fs.writeFile(join(env.FILE_STORAGE_PATH, file.id + file.extension), buffer);
				assets[compressed.path] = `${base}/api/files/${file.id + file.extension}`;
			}
		}

		if (!sheets) {
			throw Error('No excel (.xlsx) file found');
		}

		let questionNumber = 0;
		let choiceNumber = 0;
		for (const sheet of sheets) {
			const name = sheet.name;
			const data = sheet.data;
			for (const [rowNumber, row] of data.entries()) {
				if (row.length === 0) continue;
				// @ts-expect-error I have no idea why ts thinks this wouldn't work
				if (!(row[0] instanceof String || typeof row[0] === 'string') || !row[0].startsWith('$')) {
					continue;
				}

				if (row[0].toLowerCase().startsWith('$q')) {
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

					const defaultScore = Number(row[3] ?? configConstants.questions.defaultMinScore);
					if (isNaN(defaultScore)) {
						throw Error(`Sheet '${name}' Cell D${rowNumber + 1} (Default score) is invalid`);
					}
					const minScore = Number(row[4] ?? configConstants.questions.defaultMinScore);
					if (isNaN(minScore)) {
						throw Error(`Sheet '${name}' Cell E${rowNumber + 1} (Min score) is invalid`);
					}
					const maxScore = Number(row[5] ?? configConstants.questions.defaultMaxScore);
					if (isNaN(maxScore)) {
						throw Error(`Sheet '${name}' Cell F${rowNumber + 1} (Max score) is invalid`);
					}

					if (
						(questionType === questionTypes.checkboxes || questionType === questionTypes.text) &&
						row[6] === undefined
					) {
						throw Error(`Sheet '${name}' Cell G${rowNumber + 1} (Scoring type) is empty`);
					}
					const scoringType = (
						questionType === questionTypes.checkboxes || questionType === questionTypes.text
							? String(row[6]).toLowerCase()
							: null
					) as 'exact' | 'regex' | 'and' | 'or' | 'scale' | null;
					if (
						scoringType !== null &&
						!['exact', 'regex', 'and', 'or', 'scale'].includes(scoringType)
					) {
						throw Error(`Sheet '${name}' Cell G${rowNumber + 1} (Scoring type) is invalid`);
					}

					const textLengthLimit = Number(
						row[7] ?? configConstants.questions.defaultTextAnswerLengthLimit
					);
					if (isNaN(textLengthLimit)) {
						throw Error(`Sheet '${name}' Cell H${rowNumber + 1} (Text length limit) is invalid`);
					}

					const textCorrect =
						questionType === questionTypes.text
							? row[8] === undefined
								? null
								: String(row[8])
							: null;

					if (
						textCorrect !== null &&
						questionType === questionTypes.text &&
						scoringType === scoringTypes.regex
					) {
						try {
							parseRegexString(textCorrect);
						} catch {
							throw Error(
								`Sheet '${name}' Cell I${rowNumber + 1} (Text correct) contains invalid regex`
							);
						}
					}

					const rawFileTypes =
						questionType === questionTypes.file
							? row[9] === undefined
								? null
								: String(row[9])
							: null;
					const fileSizeLimit = Number(row[10] ?? configConstants.questions.defaultFileSizeLimit);
					if (isNaN(fileSizeLimit)) {
						throw Error(`Sheet '${name}' Cell K${rowNumber + 1} (File size limit) is invalid`);
					}

					const fileTypes = parseFileTypes(rawFileTypes);
					if (fileTypes !== null && fileTypes.length === 0) {
						throw Error(`Sheet '${name}' Cell J${rowNumber + 1} (Accept file types) is invalid`);
					}

					questionNumber++;
					choiceNumber = 0;

					await createQuestion({
						examId: exam.id,
						number: questionNumber,
						markdown,
						html: renderMarkdown(markdown),
						questionType,
						defaultScore,
						minScore,
						maxScore,
						scoringType,
						textLengthLimit,
						textCorrect,
						fileTypes,
						fileSizeLimit
					});
				} else if (row[0].toLowerCase().startsWith('$c')) {
					if (questionNumber === 0) {
						throw Error(
							`Sheet '${name}' Cell A${rowNumber + 1} Choice is defined before a question`
						);
					}

					if (row[1] === undefined) {
						throw Error(`Sheet '${name}' Cell B${rowNumber + 1} (Choice text) is empty`);
					}
					const markdown = updateAssets(String(row[1]), assets);

					const isCorrect =
						String(row[2]).toLowerCase() === 'true' ||
						// @ts-expect-error I have no idea why ts thinks this wouldn't work
						((row[2] instanceof Number || typeof row[2] === 'number') && row[2] !== 0);

					choiceNumber++;

					await createChoice({
						examId: exam.id,
						questionNumber: questionNumber,
						number: choiceNumber,
						markdown,
						html: renderMarkdown(markdown),
						isCorrect
					});
				} else {
					throw Error(`Sheet '${name}' Cell A${rowNumber + 1} contains invalid $ directive`);
				}
			}
		}
	} catch (err) {
		const assets = await deleteFilesByReferenceReturning(exam.id);
		await Promise.allSettled(
			assets.map((file) => fs.unlink(join(env.FILE_STORAGE_PATH, file.id + file.extension)))
		);
		try {
			await deleteExam(exam.id);
		} catch (err) {
			console.error(`Failed to delete exam id: '${exam.id}' after import failure`);
			console.error(err);
		}

		throw err;
	}
}
