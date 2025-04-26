import { error } from '@sveltejs/kit';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { parseDateWithTimeZone } from '$lib/datetime';
import { roles } from '$lib/enums';
import { getErrorMessage } from '$lib/error';
import { isRoleAtLeast } from '$lib/roles';
import {
	getExamsAvailable,
	getExamsCompleted,
	getExamsExpired,
	getExamsUpcoming
} from '$lib/server/db/services/exams';
import { importExam } from '$lib/server/file-import/exam';

import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async ({ locals }) => {
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

	const [form, availableExams, upcomingExams, completedExams, expiredExams] = await Promise.all([
		superValidate(zod(formSchema)),
		getExamsAvailable(user.id),
		getExamsUpcoming(user.id),
		getExamsCompleted(user.id),
		getExamsExpired(user.id)
	]);

	return {
		form,
		availableExams,
		upcomingExams,
		completedExams,
		expiredExams
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(formSchema));
		if (!form.valid) return fail(400, { form });

		const user = event.locals.user;

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

		try {
			await importExam(
				{
					ownerId: user.id,
					title: form.data.title,
					description: form.data.description,
					openAt: parseDateWithTimeZone(form.data.openAt, event.locals.timeZone),
					closeAt: parseDateWithTimeZone(form.data.closeAt, event.locals.timeZone),
					timeLimit: Number(form.data.timeLimit)
				},
				form.data.file
			);
		} catch (err) {
			return message(form, {
				type: 'error',
				text: getErrorMessage(err)
			});
		}

		return message(form, {
			type: 'success',
			text: 'Exam created successfully'
		});
	}
};
