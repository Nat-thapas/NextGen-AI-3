import { convertOwnUser } from '$lib/interfaces/partial-user';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		timeZone: locals.timeZone,
		user: locals.user ? convertOwnUser(locals.user) : undefined
	};
};
