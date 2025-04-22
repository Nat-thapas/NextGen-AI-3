import { OwnUser } from '$lib/interfaces/partial-user';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return { user: locals.user ? new OwnUser(locals.user) : undefined };
};
