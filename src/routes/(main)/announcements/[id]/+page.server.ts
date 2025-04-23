import { error } from '@sveltejs/kit';

import { getAnnouncement } from '$lib/server/db/prepared-statements/announcements';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const announcement = await getAnnouncement.execute({ id: params.id });

	if (!announcement) {
		return error(404, { message: 'Not found' });
	}

	return { announcement };
};
