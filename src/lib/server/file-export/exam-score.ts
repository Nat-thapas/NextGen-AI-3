import { WrapText } from '@lucide/svelte';
import xlsx from 'xlsx-js-style';

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

type Cell = string | number | boolean | undefined | { [property: string]: Cell };

const alignment = {
	vertical: 'top'
};

const alignmentWrap = {
	vertical: 'top',
	wrapText: true
};

const fillWhite = {
	fgColor: { rgb: 'FFFFFF' }
};

const fillLightGreen = {
	fgColor: { rgb: 'D8E4BC' }
};

const fillLightBlue = {
	fgColor: { rgb: 'C5D9F1' }
};

const fillLightOrange = {
	fgColor: { rgb: 'FCD5B4' }
};

const fillLightRed = {
	fgColor: { rgb: 'F2DCDB' }
};

const fillLightGray = {
	fgColor: { rgb: 'F2F2F2' }
};

const fillGray = {
	fgColor: { rgb: 'D9D9D9' }
};

const fillDarkGray = {
	fgColor: { rgb: '808080' }
};

const border = {
	top: {
		style: 'thin',
		color: { rgb: '808080' }
	},
	right: {
		style: 'thin',
		color: { rgb: '808080' }
	},
	bottom: {
		style: 'thin',
		color: { rgb: '808080' }
	},
	left: {
		style: 'thin',
		color: { rgb: '808080' }
	}
};

const borderThickRight = {
	top: {
		style: 'thin',
		color: { rgb: '808080' }
	},
	right: {
		style: 'medium',
		color: { rgb: '000000' }
	},
	bottom: {
		style: 'thin',
		color: { rgb: '808080' }
	},
	left: {
		style: 'thin',
		color: { rgb: '808080' }
	}
};

const borderThickLeft = {
	top: {
		style: 'thin',
		color: { rgb: '808080' }
	},
	right: {
		style: 'thin',
		color: { rgb: '808080' }
	},
	bottom: {
		style: 'thin',
		color: { rgb: '808080' }
	},
	left: {
		style: 'medium',
		color: { rgb: '000000' }
	}
};

export async function exportExamScore(examId: string): Promise<Buffer> {
	const data: Cell[][] = [];
	const exam = await getExamQuestionsChoicesSubmissionsUsers(examId);

	if (!exam) {
		throw Error('Exam not found');
	}

	const columnsCount = 4 + exam.questions.length * 3 + 1;

	const columnInfos: { wch: number }[] = [{ wch: 10 }, { wch: 6 }, { wch: 20 }, { wch: 20 }];
	const rowInfos: { hpt: number }[] = [
		{ hpt: 16 },
		{ hpt: 16 },
		{ hpt: 16 },
		{ hpt: 16 },
		{ hpt: 16 },
		{ hpt: 16 },
		{ hpt: 16 },
		{ hpt: 16 },
		{ hpt: 16 },
		{ hpt: 16 },
		{ hpt: 16 }
	];
	const merges: { s: { c: number; r: number }; e: { c: number; r: number } }[] = [];

	let rowIndex = 1;

	const comments: string[] = [
		'Any row beginning with # is considered a comment by the parser. If you want to add any custom rows, prefix them with # to not disturb the parser when you upload this score file back to the site',
		'Only edit white cells, those are weight cells (Default Score, Min Score, Max Score) and correctness cells. Edits to any other cells will not be saved when you upload this score file back to the site',
		'Correctness should be a number between 0 and 1 with 0 being fully wrong and 1 being totally correct',
		'Score for each question is calculated from weights and correctness',
		"The sum score is calculated from all question's score added together",
		'Formulae are already included in the workbook'
	];

	for (const comment of comments) {
		data.push([
			{
				v: '#',
				t: 's',
				s: {
					alignment,
					fill: fillLightGreen
				}
			},
			{
				v: comment,
				t: 's',
				s: {
					alignment,
					fill: fillLightGreen
				}
			}
		]);
		merges.push({ s: { c: 1, r: rowIndex - 1 }, e: { c: columnsCount - 1, r: rowIndex - 1 } });

		rowIndex++;
	}

	const headers: (string | number | undefined)[][] = [
		['$Default', '', '', ''],
		['$Min', '', '', ''],
		['$Max', '', '', ''],
		['#', '', '', ''],
		['# User ID', 'Prefix', 'Name', 'Email']
	];

	for (const [i, question] of exam.questions.entries()) {
		headers[0].push('Default Score', question.defaultScore, '');
		headers[1].push('Min Score', question.minScore, '');
		headers[2].push('Max Score', question.maxScore, '');
		headers[3].push(`Q${question.number}: ${question.shortMarkdown.replaceAll('\n', ' ')}`, '', '');
		headers[4].push('Answer', 'Correctness', 'Score');

		columnInfos.push({ wch: 25 }, { wch: 6 }, { wch: 6 });
		merges.push({ s: { c: 4 + i * 3, r: 9 }, e: { c: 6 + i * 3, r: 9 } });
	}

	headers[4].push('Sum');
	columnInfos.push({ wch: 10 });

	for (let i = 0; i < 4; i++) {
		const header = headers[i];
		const row: Cell[] = [
			{
				v: header[0],
				t: 's',
				s: {
					alignment,
					fill: fillDarkGray,
					border
				}
			},
			{
				v: header[1],
				t: 's',
				s: {
					alignment,
					fill: fillDarkGray,
					border
				}
			},
			{
				v: header[2],
				t: 's',
				s: {
					alignment,
					fill: fillDarkGray,
					border
				}
			},
			{
				v: header[3],
				t: 's',
				s: {
					alignment,
					fill: fillDarkGray,
					border: borderThickRight
				}
			}
		];

		for (let j = 4; j < header.length - 2; j += 3) {
			row.push(
				{
					v: header[j],
					t: 's',
					s: {
						alignment,
						fill: fillLightBlue,
						border: borderThickLeft
					}
				},
				{
					v: header[j + 1],
					t: 'n',
					s: {
						alignment,
						fill: fillWhite,
						border
					}
				},
				{
					v: header[j + 2],
					t: 's',
					s: {
						alignment,
						fill: fillDarkGray,
						border: borderThickRight
					}
				}
			);
		}

		row.push({
			v: '',
			t: 's',
			s: {
				alignment,
				fill: fillDarkGray,
				border: borderThickLeft
			}
		});

		data.push(row);
		rowIndex++;
	}

	const header = headers[4];
	const row: Cell[] = [
		{
			v: header[0],
			t: 's',
			s: {
				alignment,
				fill: fillLightOrange,
				border
			}
		},
		{
			v: header[1],
			t: 's',
			s: {
				alignment,
				fill: fillLightOrange,
				border
			}
		},
		{
			v: header[2],
			t: 's',
			s: {
				alignment,
				fill: fillLightOrange,
				border
			}
		},
		{
			v: header[3],
			t: 's',
			s: {
				alignment,
				fill: fillLightOrange,
				border: borderThickRight
			}
		}
	];

	for (let j = 4; j < header.length - 2; j += 3) {
		row.push(
			{
				v: header[j],
				t: 's',
				s: {
					alignment,
					fill: fillLightOrange,
					border: borderThickLeft
				}
			},
			{
				v: header[j + 1],
				t: 's',
				s: {
					alignment,
					fill: fillLightOrange,
					border
				}
			},
			{
				v: header[j + 2],
				t: 's',
				s: {
					alignment,
					fill: fillLightOrange,
					border: borderThickRight
				}
			}
		);
	}

	row.push({
		v: header[header.length - 1],
		t: 's',
		s: {
			alignment,
			fill: fillLightOrange,
			border: borderThickLeft
		}
	});

	data.push(row);
	rowIndex++;

	for (const submission of exam.submissions) {
		let colIndex = 1;
		let rowHeight = 16;

		const fill = rowIndex % 2 === 0 ? fillGray : fillLightGray;

		const user = submission.user;
		const row: Cell[] = [
			{
				v: user.id,
				t: 's',
				s: {
					alignment,
					fill,
					border
				}
			},
			{
				v: user.prefix ?? '',
				t: 's',
				s: {
					alignment,
					fill,
					border
				}
			},
			{
				v: user.name ?? '',
				t: 's',
				s: {
					alignment,
					fill,
					border
				}
			},
			{
				v: user.email,
				t: 's',
				s: {
					alignment,
					fill,
					border: borderThickRight
				}
			}
		];
		const scoreCells: string[] = [];

		colIndex += 4;

		for (const question of exam.questions) {
			const answer = await getAnswer(exam.id, question.number, user.id);
			if (answer) {
				if (question.questionType === questionTypes.choices) {
					row.push({
						v: `${answer.answer}: ${question.choices[Number(answer.answer) - 1]?.shortMarkdown?.replaceAll('\n', ' ') ?? 'Unknown'}`,
						t: 's',
						s: {
							alignment: alignmentWrap,
							fill,
							border: borderThickLeft
						}
					});
				} else if (question.questionType === questionTypes.checkboxes) {
					let text: string = '';
					const answers = answer.answer.split(';');
					for (const ans of answers) {
						text += `${ans}: ${question.choices[Number(ans) - 1]?.shortMarkdown?.replaceAll('\n', ' ') ?? 'Unknown'}\n`;
					}
					row.push({
						v: text.slice(0, text.length - 1),
						t: 's',
						s: {
							alignment: alignmentWrap,
							fill,
							border: borderThickLeft
						}
					});
					rowHeight = Math.max(rowHeight, 16 * answers.length);
				} else if (question.questionType === questionTypes.text) {
					row.push({
						v: answer.answer,
						t: 's',
						s: {
							alignment: alignmentWrap,
							fill,
							border: borderThickLeft
						}
					});
					rowHeight = Math.max(rowHeight, 16 * Math.ceil(answer.answer.length / 32));
				} else if (question.questionType === questionTypes.file) {
					const file = await getFile(answer.answer);
					if (file) {
						row.push({
							v: `${env.PUBLIC_ORIGIN}${base}/api/files/${file.id}${file.extension}`,
							t: 's',
							l: {
								Target: `${env.PUBLIC_ORIGIN}${base}/api/files/${file.id}${file.extension}`,
								Tooltip: 'Download file'
							},
							s: {
								alignment: alignmentWrap,
								fill,
								border: borderThickLeft
							}
						});
					} else {
						row.push({
							v: `${env.PUBLIC_ORIGIN}${base}/api/files/${answer.answer}`,
							t: 's',
							l: {
								Target: `${env.PUBLIC_ORIGIN}${base}/api/files/${answer.answer}`,
								Tooltip: 'Download file'
							},
							s: {
								alignment: alignmentWrap,
								fill,
								border: borderThickLeft
							}
						});
					}
				} else {
					row.push({
						v: 'Unknown question type',
						t: 's',
						s: {
							alignment: alignmentWrap,
							fill,
							border: borderThickLeft
						}
					});
				}

				if (answer.correctness === null) {
					row.push({
						v: '',
						t: 's',
						s: {
							alignment,
							fill: fillLightRed,
							border
						}
					});
				} else {
					row.push({
						v: answer.correctness,
						t: 'n',
						s: {
							alignment,
							fill: fillWhite,
							border
						}
					});
				}
			} else {
				row.push(
					{
						v: '',
						t: 's',
						s: {
							alignment: alignmentWrap,
							fill,
							border: borderThickLeft
						}
					},
					{
						v: '',
						t: 's',
						s: {
							alignment,
							fill: fillWhite,
							border
						}
					}
				);
			}

			colIndex += 2;

			row.push({
				f: `=IF(ISNUMBER(${toExcelCol(colIndex - 1)}${rowIndex}), ${toExcelCol(colIndex - 1)}$8+(${toExcelCol(colIndex - 1)}$9-${toExcelCol(colIndex - 1)}$8)*${toExcelCol(colIndex - 1)}${rowIndex}, ${toExcelCol(colIndex - 1)}$7)`,
				t: 'n',
				s: {
					alignment,
					fill,
					border: borderThickRight
				}
			});
			scoreCells.push(`${toExcelCol(colIndex)}${rowIndex}`);

			colIndex += 1;
		}

		row.push({
			f: `=SUM(${scoreCells.join(',')})`,
			t: 'n',
			s: {
				alignment,
				fill,
				border: borderThickLeft
			}
		});

		colIndex += 1;

		data.push(row);
		rowInfos.push({ hpt: Math.min(rowHeight, 55) });

		rowIndex++;
	}

	const workbook = xlsx.utils.book_new();
	const worksheet = xlsx.utils.aoa_to_sheet(data);
	worksheet['!cols'] = columnInfos;
	worksheet['!rows'] = rowInfos;
	worksheet['!merges'] = merges;
	xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

	return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });
}
