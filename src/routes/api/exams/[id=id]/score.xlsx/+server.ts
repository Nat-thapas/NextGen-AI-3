import { error } from '@sveltejs/kit';

import { roles } from '$lib/enums';
import { getErrorMessage } from '$lib/error';
import { isRoleAtLeast } from '$lib/roles';
import { getExam } from '$lib/server/db/services/exams';
import { exportExamScore } from '$lib/server/file-export/exam-score';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	const examId = params.id;

	if (!user) {
		error(401, {
			message: 'You have to be logged in to access this page'
		});
	}
	if (!isRoleAtLeast(user.role, roles.teacher)) {
		error(403, {
			message: 'You do not have access to this page'
		});
	}

	const exam = await getExam(examId);

	if (!exam) {
		error(404, {
			message: 'Not Found'
		});
	}

	try {
		return new Response(await exportExamScore(exam.id), {
			headers: {
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/application/vnd.ms-excel',
				'Content-Disposition': 'attachment; filename="score.xlsx"'
			}
		});
	} catch (err) {
		console.error('Cannot export exam score');
		console.error(err);
		error(500, {
			message: getErrorMessage(err)
		});
	}
};
