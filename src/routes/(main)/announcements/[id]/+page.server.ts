import { error } from '@sveltejs/kit';

import { renderMarkdown } from '$lib/markdown';
import { getAnnouncement } from '$lib/server/db/prepared-statements/announcements';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const announcement = await getAnnouncement.execute({ id: params.id });

	if (!announcement) {
		return error(404, { message: 'Not found' });
	}

	const announcementHtml = renderMarkdown(announcement.text);

	return {
		announcement,
		announcementHtml
	};
};
