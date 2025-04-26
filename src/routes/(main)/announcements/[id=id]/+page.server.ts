import { error } from '@sveltejs/kit';

import { getAnnouncement } from '$lib/server/db/services/announcements';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const announcement = await getAnnouncement(params.id);

	if (!announcement) {
		return error(404, { message: 'Not Found' });
	}

	return { announcement };
};
