import { json } from '@sveltejs/kit';

import {
	countAnnouncements,
	getAnnouncements
} from '$lib/server/db/prepared-statements/announcements';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	let limit = url.searchParams.get('limit');
	let offset = url.searchParams.get('offset');

	limit ??= '5';
	offset ??= '0';

	return json({
		announcements: await getAnnouncements.execute({ limit, offset }),
		moreAnnouncementsAvailable: (await countAnnouncements.execute())[0].count > +offset + +limit
	});
};
