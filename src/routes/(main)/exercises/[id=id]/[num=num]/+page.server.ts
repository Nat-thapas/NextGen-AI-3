import { error, redirect } from '@sveltejs/kit';

import { base } from '$app/paths';

import { getSecondsSince, utcNow } from '$lib/datetime';
import { roles } from '$lib/enums';
import { isRoleAtLeast } from '$lib/roles';
import { getExamQuestionAnswerSubmission } from '$lib/server/db/services/exams';
import { getQuestionChoices } from '$lib/server/db/services/questions';
import { setToastParams } from '$lib/toast';

import type { PageServerLoad } from './$types';

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
		getQuestionChoices(examId, questionNumber)
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

	return {
		exam: {
			id: exam.id,
			openAt: exam.openAt,
			closeAt: exam.closeAt,
			timeLimit: exam.timeLimit
		},
		questions: exam.questions,
		submission: exam.submissions[0],
		question
	};
};
