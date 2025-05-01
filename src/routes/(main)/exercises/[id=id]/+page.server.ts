import { error, redirect } from '@sveltejs/kit';

import { base } from '$app/paths';

import { getSecondsSince, utcNow } from '$lib/datetime';
import { roles } from '$lib/enums';
import { isRoleAtLeast } from '$lib/roles';
import { getExamSubmission } from '$lib/server/db/services/exams';
import { createSubmission } from '$lib/server/db/services/submissions';
import { setToastParams } from '$lib/toast';

import type { Actions, PageServerLoad } from './$types';

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

	const exam = await getExamSubmission(params.id, user.id);

	if (!exam) {
		error(404, {
			message: 'Not Found'
		});
	}

	if (!isRoleAtLeast(user.role, roles.teacher)) {
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
		if (exam.submission && getSecondsSince(exam.submission.createdAt) > exam.timeLimit) {
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
		if (exam.submission && exam.submission.submitted) {
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
	}

	return { now: Date.now(), exam };
};

export const actions: Actions = {
	default: async ({ locals, params }) => {
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

		const exam = await getExamSubmission(params.id, user.id);

		if (!exam) {
			error(404, {
				message: 'Not Found'
			});
		}

		if (!isRoleAtLeast(user.role, roles.teacher)) {
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
			if (exam.submission && getSecondsSince(exam.submission.createdAt) > exam.timeLimit) {
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
			if (exam.submission && exam.submission.submitted) {
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
		}

		if (exam.submission) {
			return redirect(303, `${base}/exercises/${exam.id}/1`);
		}

		await createSubmission(exam.id, user.id);

		return redirect(303, `${base}/exercises/${exam.id}/1`);
	}
};
