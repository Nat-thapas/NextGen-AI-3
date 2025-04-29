import xlsx from 'node-xlsx';

import { base } from '$app/paths';
import { env } from '$env/dynamic/public';

import { questionTypes } from '$lib/enums';
import { getAnswer } from '$lib/server/db/services/answers';
import { getExamQuestionsChoicesSubmissionsUsers } from '$lib/server/db/services/exams';

import { getFile } from '../db/services/files';

// From: https://stackoverflow.com/questions/75068547/convert-a-number-to-excel-column-letter
// License: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)
// No changes were made except for removal of unsued part (namely the inverse, fromExcelCol, function)

const uppercaseAlphas = Array.from({ length: 26 }, (_, i) =>
	String.fromCodePoint(i + 'A'.codePointAt(0)!)
);

function divmodExcel(n: number): number[] {
	const a = Math.floor(n / 26);
	const b = n % 26;

	return b === 0 ? [a - 1, b + 26] : [a, b];
}

function toExcelCol(n: number): string {
	const chars: string[] = [];

	let d;
	while (n > 0) {
		[n, d] = divmodExcel(n);
		chars.unshift(uppercaseAlphas[d - 1]);
	}
	return chars.join('');
}

// End of stackoverflow code

export async function exportExamScore(examId: string): Promise<Buffer> {
	const data: (string | number | Record<string, string | Record<string, string>> | undefined)[][] =
		[];
	const exam = await getExamQuestionsChoicesSubmissionsUsers(examId);

	if (!exam) {
		throw Error('Exam not found');
	}

	let rowIndex = 1;

	const preemble1: (string | number | undefined)[] = ['#', undefined, undefined, undefined];
	for (const question of exam.questions) {
		preemble1.push('Default Score', question.defaultScore, undefined);
	}
	data.push(preemble1);

	rowIndex++;

	const preemble2: (string | number | undefined)[] = ['#', undefined, undefined, undefined];
	for (const question of exam.questions) {
		preemble2.push('Min Score', question.minScore, undefined);
	}
	data.push(preemble2);

	rowIndex++;

	const preemble3: (string | number | undefined)[] = ['#', undefined, undefined, undefined];
	for (const question of exam.questions) {
		preemble3.push('Max Score', question.maxScore, undefined);
	}
	data.push(preemble3);

	rowIndex++;

	const preemble4: (string | number | undefined)[] = ['#', undefined, undefined, undefined];
	for (const question of exam.questions) {
		preemble4.push(`Q${question.number}: ${question.shortMarkdown}`, undefined, undefined);
	}
	data.push(preemble4);

	rowIndex++;

	const headers: string[] = ['# User ID', 'Prefix', 'Name', 'Email'];
	for (let i = 0; i < exam.questions.length; i++) {
		headers.push('Answer', 'Correctness', 'Score');
	}
	headers.push('Sum');
	data.push(headers);

	rowIndex++;

	for (const submission of exam.submissions) {
		let colIndex = 1;

		const user = submission.user;
		const row: (string | number | Record<string, string | Record<string, string>> | undefined)[] = [
			user.id,
			user.prefix ?? undefined,
			user.name ?? undefined,
			user.email
		];
		const scoreCells: string[] = [];

		colIndex += 4;

		for (const question of exam.questions) {
			const answer = await getAnswer(exam.id, question.number, user.id);
			if (answer) {
				if (question.questionType === questionTypes.choices) {
					row.push(
						`${answer.answer}: ${question.choices[Number(answer.answer)]?.shortMarkdown ?? 'Unknown'}`
					);
				} else if (question.questionType === questionTypes.checkboxes) {
					let text: string = '';
					for (const ans in answer.answer.split(';')) {
						text += `${ans}: ${question.choices[Number(ans)]?.shortMarkdown ?? 'Unknown'}\n`;
					}
					row.push(text.slice(0, text.length - 1));
				} else if (question.questionType === questionTypes.text) {
					row.push(answer.answer);
				} else if (question.questionType === questionTypes.file) {
					const file = await getFile(answer.answer);
					if (file) {
						row.push({
							v: `${env.PUBLIC_ORIGIN}${base}/api/files/${file.id}${file.extension}`,
							l: {
								Target: `${env.PUBLIC_ORIGIN}${base}/api/files/${file.id}${file.extension}`,
								Tooltip: 'Download file'
							}
						});
					} else {
						row.push({
							v: `${env.PUBLIC_ORIGIN}${base}/api/files/${answer.answer}`,
							l: {
								Target: `${env.PUBLIC_ORIGIN}${base}/api/files/${answer.answer}`,
								Tooltip: 'Download file'
							}
						});
					}
				} else {
					row.push('Unknown question type');
				}
				row.push(answer.correctness ?? undefined);
			} else {
				row.push(undefined, undefined);
			}

			colIndex += 2;

			row.push({
				f: `=IF(ISBLANK(${toExcelCol(colIndex - 1)}${rowIndex}), ${toExcelCol(colIndex - 1)}$1, ${toExcelCol(colIndex - 1)}$2+(${toExcelCol(colIndex - 1)}$3-${toExcelCol(colIndex - 1)}$2)*${toExcelCol(colIndex - 1)}${rowIndex})`
			});
			scoreCells.push(`${toExcelCol(colIndex)}${rowIndex}`);

			colIndex += 1;
		}

		row.push({
			f: `=SUM(${scoreCells.join(',')})`
		});

		colIndex += 1;

		data.push(row);

		rowIndex++;
	}

	const columns: { wch: number }[] = [{ wch: 10 }, { wch: 6 }, { wch: 20 }, { wch: 20 }];
	const merges: { s: { c: number; r: number }; e: { c: number; r: number } }[] = [];

	for (let i = 0; i < exam.questions.length; i++) {
		columns.push({ wch: 25 }, { wch: 6 }, { wch: 6 });
		merges.push({ s: { c: 4 + i * 3, r: 3 }, e: { c: 6 + i * 3, r: 3 } });
	}

	columns.push({ wch: 10 });

	return xlsx.build([{ name: 'Sheet1', data, options: { '!cols': columns, '!merges': merges } }]);
}
