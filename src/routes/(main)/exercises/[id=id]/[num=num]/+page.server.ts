import fs from 'node:fs/promises';
import { join } from 'node:path';

import { error, redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { getSecondsSince, utcNow } from '$lib/datetime';
import { questionTypes, roles } from '$lib/enums';
import { getExtension, mimeTypesToExtensions } from '$lib/files';
import { formatNumber } from '$lib/format-number';
import { isRoleAtLeast } from '$lib/roles';
import { deleteAnswerReturning, getAnswer, upsertAnswer } from '$lib/server/db/services/answers';
import { getExamQuestionAnswerSubmission, getExamSubmission } from '$lib/server/db/services/exams';
import { createFileReturning, deleteFileReturning, getFile } from '$lib/server/db/services/files';
import {
	getQuestionChoiceNumbers,
	getQuestionChoicesAnswer
} from '$lib/server/db/services/questions';
import { updateSubmissionSubmitted } from '$lib/server/db/services/submissions';
import { setToastParams } from '$lib/toast';

import type { Actions, PageServerLoad } from './$types';
import { checkboxesSchema, choicesSchema } from './schema';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user;
	const examId = params.id;
	const questionNumber = Number(params.num);

	if (!user) {
		error(401, {
			message: 'You have to be logged in to access this page'
		});
	}
	if (!isRoleAtLeast(user.role, roles.student)) {
		error(403, {
			message: 'You do not have access to this page'
		});
	}

	const [exam, question] = await Promise.all([
		getExamQuestionAnswerSubmission(examId, user.id),
		getQuestionChoicesAnswer(examId, questionNumber, user.id)
	]);

	if (!exam || !question) {
		error(404, {
			message: 'Not Found'
		});
	}
	if (exam.openAt > utcNow()) {
		return redirect(
			303,
			setToastParams(`${base}/exercises`, 'Exam is not open yet', undefined, 'error')
		);
	}
	if (exam.closeAt <= utcNow()) {
		return redirect(
			303,
			setToastParams(`${base}/exercises`, 'Exam is already closed', undefined, 'error')
		);
	}
	if (exam.submissions.length === 0) {
		return redirect(
			303,
			setToastParams(
				`${base}/exercises/${exam.id}`,
				"You've not started this exam yet",
				undefined,
				'error'
			)
		);
	}
	if (getSecondsSince(exam.submissions[0].createdAt) > exam.timeLimit) {
		return redirect(
			303,
			setToastParams(`${base}/exercises`, "You've ran out of time on this exam", undefined, 'error')
		);
	}
	if (exam.submissions[0].submitted) {
		return redirect(
			303,
			setToastParams(`${base}/exercises`, "You've already submitted this exam", undefined, 'error')
		);
	}

	let answer: string | string[] | undefined = undefined;
	let acceptedFileTypes: string | undefined = undefined;

	if (question.questionType === questionTypes.checkboxes) {
		answer = question.answers[0]?.answer?.split(';') ?? [];
	} else if (question.questionType === questionTypes.file) {
		answer = question.answers[0]?.answer;
		if (answer) {
			const file = await getFile(answer);
			if (file) {
				answer += file.extension;
			}
		}
		if (question.fileTypes) {
			acceptedFileTypes = mimeTypesToExtensions(question.fileTypes);
		}
	} else {
		answer = question.answers[0]?.answer;
	}

	// switch (question.questionType) {
	// 	case questionTypes.choices:
	// 		answer = question.answers[0]?.answer;
	// 		break;
	// 	case questionTypes.checkboxes:
	// 		answer = question.answers[0]?.answer?.split(';') ?? [];
	// 		break;
	// 	case questionTypes.text:
	// 		answer = question.answers[0]?.answer;
	// 		break;
	// 	case questionTypes.file:
	// 		answer = question.answers[0]?.answer;
	// 		// formSchema = z.object({
	// 		// 	next: z.string(),
	// 		// 	answer: z
	// 		// 		.instanceof(File, { message: 'Please upload a file' })
	// 		// 		.refine(
	// 		// 			(f) => (question.fileTypes ? question.fileTypes.split(',').includes(f.type) : true),
	// 		// 			`File must be a supported file type (${(question.fileTypes ?? '')
	// 		// 				.split(',')
	// 		// 				.map((mimeType) => '.' + mimeTypes.lookup(mimeType) || '.dat')
	// 		// 				.join(', ')})`
	// 		// 		)
	// 		// 		.refine(
	// 		// 			(f) => f.size < question.fileSizeLimit * 1000,
	// 		// 			`File size must be at most ${formatNumber(question.fileSizeLimit * 1000)}B`
	// 		// 		)
	// 		// 		.optional()
	// 		// });
	// 		break;
	// }

	return {
		now: Date.now(),
		exam: {
			id: exam.id,
			title: exam.title,
			openAt: exam.openAt,
			closeAt: exam.closeAt,
			timeLimit: exam.timeLimit
		},
		questions: exam.questions,
		submission: exam.submissions[0],
		question: {
			number: question.number,
			html: question.html,
			questionType: question.questionType,
			textLengthLimit: question.textLengthLimit,
			fileTypes: question.fileTypes,
			fileSizeLimit: question.fileSizeLimit,
			choices: question.choices
		},
		answer,
		acceptedFileTypes
	};
};

export const actions: Actions = {
	default: async (event) => {
		const user = event.locals.user;
		const examId = event.params.id;
		const questionNumber = Number(event.params.num);

		if (!user) {
			error(401, {
				message: 'You have to be logged in to access this page'
			});
		}
		if (!isRoleAtLeast(user.role, roles.student)) {
			error(403, {
				message: 'You do not have access to this page'
			});
		}

		const [exam, question] = await Promise.all([
			getExamSubmission(examId, user.id),
			getQuestionChoiceNumbers(examId, questionNumber)
		]);

		if (!exam || !question) {
			error(404, {
				message: 'Not Found'
			});
		}
		if (exam.openAt > utcNow()) {
			return redirect(
				303,
				setToastParams(`${base}/exercises`, 'Exam is not open yet', undefined, 'error')
			);
		}
		if (exam.closeAt <= utcNow()) {
			return redirect(
				303,
				setToastParams(`${base}/exercises`, 'Exam is already closed', undefined, 'error')
			);
		}
		if (!exam.submission) {
			return redirect(
				303,
				setToastParams(
					`${base}/exercises/${exam.id}`,
					"You've not started this exam yet",
					undefined,
					'error'
				)
			);
		}
		if (getSecondsSince(exam.submission.createdAt) > exam.timeLimit) {
			return redirect(
				303,
				setToastParams(
					`${base}/exercises`,
					"You've ran out of time on this exam",
					undefined,
					'error'
				)
			);
		}
		if (exam.submission.submitted) {
			return redirect(
				303,
				setToastParams(
					`${base}/exercises`,
					"You've already submitted this exam",
					undefined,
					'error'
				)
			);
		}

		let next: string;

		switch (question.questionType) {
			case questionTypes.choices: {
				const formSchema = choicesSchema;

				const form = await superValidate(event.request, zod(formSchema));
				if (!form.valid) return fail(400, { form });

				if (form.data.answer !== undefined) {
					const choice = Math.floor(Number(form.data.answer));
					if (choice > question.choices.length) {
						form.errors.answer = ['Choice must be a valid choice for the question'];
						return fail(400, { form });
					}
					await upsertAnswer(exam.id, question.number, user.id, choice.toString());
				}

				next = form.data.next;

				break;
			}
			case questionTypes.checkboxes: {
				const formSchema = checkboxesSchema;

				const form = await superValidate(event.request, zod(formSchema));
				if (!form.valid) return fail(400, { form });

				if (form.data.answer !== undefined) {
					const checks: number[] = [];
					for (const [index, answer] of form.data.answer.entries()) {
						const choice = Math.floor(Number(answer));
						if (choice > question.choices.length) {
							form.errors.answer = form.errors.answer ?? ({} as Record<string | number, string[]>);
							form.errors.answer[index] = ['Choice must be a valid choice for the question'];
							return fail(400, { form });
						}
						checks.push(choice);
					}
					await upsertAnswer(exam.id, question.number, user.id, checks.join(';'));
				}

				next = form.data.next;

				break;
			}
			case questionTypes.text: {
				const formSchema = z.object({
					next: z.string(),
					answer: z
						.string()
						.max(
							question.textLengthLimit,
							`Answer must be at most ${question.textLengthLimit} characters long`
						)
						.optional()
				});

				const form = await superValidate(event.request, zod(formSchema));
				if (!form.valid) return fail(400, { form });

				console.log(form.data);

				if (form.data.answer !== undefined) {
					await upsertAnswer(exam.id, question.number, user.id, form.data.answer);
				}

				next = form.data.next;

				break;
			}
			case questionTypes.file: {
				const formSchema = z.object({
					next: z.string(),
					answer: z
						.instanceof(File, { message: 'Please upload a file' })
						.refine(
							(f) =>
								question.fileTypes ? question.fileTypes.split(/ *[,;] */).includes(f.type) : true,
							`File must be of a supported type (${mimeTypesToExtensions(question.fileTypes)})`
						)
						.refine(
							(f) => f.size < question.fileSizeLimit * 1000,
							`File size must be at most ${formatNumber(question.fileSizeLimit * 1000)}B`
						)
						.optional()
				});

				const form = await superValidate(event.request, zod(formSchema));
				if (!form.valid) return fail(400, { form });

				if (form.data.answer !== undefined) {
					const file = await createFileReturning({
						size: form.data.answer.size,
						mimeType: form.data.answer.type,
						extension: getExtension(form.data.answer.name, form.data.answer.type),
						referenceId: user.id
					});
					await fs.writeFile(
						join(env.FILE_STORAGE_PATH, file.id + file.extension),
						await form.data.answer.bytes()
					);

					const oldAnswer = await getAnswer(exam.id, question.number, user.id);

					await upsertAnswer(exam.id, question.number, user.id, file.id);

					if (oldAnswer) {
						const oldFile = await deleteFileReturning(oldAnswer.answer);
						if (oldFile) {
							try {
								await fs.unlink(join(env.FILE_STORAGE_PATH, oldFile.id + oldFile.extension));
							} catch (err) {
								console.error(`Cannot delete file '${file.id + file.extension}'`);
								console.error(err);
							}
						}
					}
				}

				next = form.data.next;

				break;
			}
		}

		if (/^[0-9]{1,15}$/.test(next)) {
			redirect(303, `${base}/exercises/${exam.id}/${next}`);
		}

		if (next === 'remove-answer') {
			const answers = await deleteAnswerReturning(exam.id, question.number, user.id);
			if (question.questionType === questionTypes.file && answers) {
				const file = await deleteFileReturning(answers.answer);
				if (file) {
					try {
						await fs.unlink(join(env.FILE_STORAGE_PATH, file.id + file.extension));
					} catch (err) {
						console.error(`Cannot delete file '${file.id + file.extension}'`);
						console.error(err);
					}
				}
			}
			return { success: true };
		}

		if (next === 'submit') {
			await updateSubmissionSubmitted(exam.id, user.id, true);
			redirect(
				303,
				setToastParams(`${base}/exercises`, 'Exam submitted successfully', undefined, 'success')
			);
		}

		if (next === 'exit') {
			redirect(
				303,
				setToastParams(
					`${base}/exercises`,
					'Exam will be automatically submitted when the time runs out',
					undefined,
					'info'
				)
			);
		}

		redirect(
			303,
			setToastParams(
				`${base}/exercises/${exam.id}/${question.number}`,
				`Unknown next action '${next}'`,
				'If you did not intentionally do this, please contact administrator',
				'error'
			)
		);
	}
};
