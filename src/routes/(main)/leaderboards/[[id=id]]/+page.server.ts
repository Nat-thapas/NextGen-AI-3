import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { base } from '$app/paths';

import { roles } from '$lib/enums';
import { isRoleAtLeast } from '$lib/roles';
import { db } from '$lib/server/db';
import { leaderboardsToExams } from '$lib/server/db/schema';
import { getExams } from '$lib/server/db/services/exams';
import {
	createLeaderboardReturning,
	deleteLeaderboard,
	getLeaderboard,
	getLeaderboards,
	getLeaderboardScores,
	getUserScore,
	updateLeaderboard
} from '$lib/server/db/services/leaderboards';
import { setToastParams } from '$lib/toast';

import type { Actions, PageServerLoad } from './$types';
import {
	createLeaderboardFormSchema,
	deleteLeaderboardFormSchema,
	updateLeaderboardFormSchema
} from './schema';

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

	let leaderboard;
	if (params.id) {
		leaderboard = await getLeaderboard(params.id);
		if (!leaderboard) {
			error(404, {
				message: 'Not Found'
			});
		}
	}

	const leaderboards = (await getLeaderboards()).map((l) => ({
		id: l.id,
		name: l.name,
		order: l.order,
		exams: l.leaderboardsToExams.map((lje) => ({
			id: lje.exams.id
		}))
	}));

	if (!leaderboard && leaderboards.length > 0) {
		leaderboard = await getLeaderboard(leaderboards[0].id);
	}

	let scores;
	let userScore;

	if (leaderboard) {
		[scores, userScore] = await Promise.all([
			await getLeaderboardScores(leaderboard.id, 10),
			await getUserScore(user.id)
		]);
	}

	let exams: {
		title: string;
		id: string;
	}[] = [];

	if (isRoleAtLeast(user.role, roles.teacher)) {
		exams = await getExams();
	}

	const [createLeaderboardForm, updateLeaderboardForm, deleteLeaderboardForm] = await Promise.all([
		superValidate(zod(createLeaderboardFormSchema)),
		superValidate(zod(updateLeaderboardFormSchema)),
		superValidate(zod(deleteLeaderboardFormSchema))
	]);

	return {
		createLeaderboardForm,
		updateLeaderboardForm,
		deleteLeaderboardForm,
		leaderboards,
		leaderboard,
		scores,
		userScore,
		exams
	};
};

export const actions: Actions = {
	'create-leaderboard': async ({ request, locals }) => {
		const form = await superValidate(request, zod(createLeaderboardFormSchema));
		if (!form.valid) return fail(400, { form });

		const user = locals.user;

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

		const leaderboard = await createLeaderboardReturning(form.data.name, Number(form.data.order));

		try {
			await db
				.insert(leaderboardsToExams)
				.values(form.data.exams.map((examId) => ({ leaderboardId: leaderboard.id, examId })));
		} catch {
			form.errors.exams = {
				_errors: ['Invalid exam ID']
			};
			return fail(400, { form });
		}

		return message(form, {
			type: 'success',
			text: 'Leaderboard created successfully'
		});
	},

	'update-leaderboard': async ({ request, locals }) => {
		const form = await superValidate(request, zod(updateLeaderboardFormSchema));
		if (!form.valid) return fail(400, { form });

		const user = locals.user;

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

		const leaderboard = await getLeaderboard(form.data.id);

		if (!leaderboard) {
			error(404, {
				message: 'Not Found'
			});
		}

		await updateLeaderboard(leaderboard.id, form.data.name, Number(form.data.order));

		await db
			.delete(leaderboardsToExams)
			.where(eq(leaderboardsToExams.leaderboardId, leaderboard.id));

		try {
			await db
				.insert(leaderboardsToExams)
				.values(form.data.exams.map((examId) => ({ leaderboardId: leaderboard.id, examId })));
		} catch {
			form.errors.exams = {
				_errors: ['Invalid exam ID']
			};
			return fail(400, { form });
		}

		return message(form, {
			type: 'success',
			text: 'Leaderboard updated successfully'
		});
	},

	'delete-leaderboard': async ({ params, request, locals }) => {
		const form = await superValidate(request, zod(deleteLeaderboardFormSchema));
		if (!form.valid) return fail(400, { form });

		const user = locals.user;

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

		await deleteLeaderboard(form.data.id);

		if (params.id === form.data.id) {
			redirect(
				303,
				setToastParams(
					`${base}/leaderboards`,
					'Leaderboard deleted successfully',
					undefined,
					'success'
				)
			);
		}

		return message(form, {
			type: 'success',
			text: 'Leaderboard deleted successfully'
		});
	}
};
