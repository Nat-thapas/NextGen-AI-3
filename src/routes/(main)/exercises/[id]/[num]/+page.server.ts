import { error, redirect } from '@sveltejs/kit';

import { base } from '$app/paths';

import { getSecondsSince, utcNow } from '$lib/datetime';
import { roles } from '$lib/enums';
import { isRoleAtLeast } from '$lib/roles';
import { getExamQuestionChoicesSubmission } from '$lib/server/db/services/exams';
import { setToastParams } from '$lib/toast';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user;

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

	const examData = await getExamQuestionChoicesSubmission(params.id, Number(params.num), user.id);

	if (!examData) {
		error(404, {
			message: 'Not Found'
		});
	}
	if (examData.openAt > utcNow()) {
		return redirect(
			303,
			setToastParams(`${base}/exercises`, 'Exam is not open yet', undefined, 'error')
		);
	}
	if (examData.closeAt <= utcNow()) {
		return redirect(
			303,
			setToastParams(`${base}/exercises`, 'Exam is already closed', undefined, 'error')
		);
	}
	if (examData.questions.length === 0) {
		error(404, {
			message: 'Not Found'
		});
	}
	if (examData.submissions.length === 0) {
		return redirect(
			303,
			setToastParams(
				`${base}/exercises/${examData.id}`,
				"You've not started this exam yet",
				undefined,
				'error'
			)
		);
	}

	const question = examData.questions[0];
	const submission = examData.submissions[0];

	if (getSecondsSince(submission.createdAt) > examData.timeLimit) {
		return redirect(
			303,
			setToastParams(`${base}/exercises`, "You've ran out of time on this exam", undefined, 'error')
		);
	}

	return {
		exam: {
			id: examData.id,
			openAt: examData.openAt,
			closeAt: examData.closeAt,
			timeLimit: examData.timeLimit
		},
		question,
		submission
	};
};
