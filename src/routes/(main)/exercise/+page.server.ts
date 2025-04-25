import { error } from '@sveltejs/kit';

import { roles } from '$lib/enums';
import { isRoleAtLeast } from '$lib/roles';
import {
	getExamsAvailable,
	getExamsCompleted,
	getExamsExpired,
	getExamsUpcoming
} from '$lib/server/db/services/exams';

import type { PageServerLoad } from './$types';

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

	return {
		availableExams: await getExamsAvailable(user.id),
		upcomingExams: await getExamsUpcoming(),
		completedExams: await getExamsCompleted(user.id),
		expiredExams: await getExamsExpired(user.id)
	};
};
