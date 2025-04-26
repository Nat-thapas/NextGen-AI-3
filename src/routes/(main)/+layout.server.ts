import { convertOwnUserPartial } from '$lib/interfaces/partial-user';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		timeZone: locals.timeZone,
		user: locals.user ? convertOwnUserPartial(locals.user) : undefined
	};
};
