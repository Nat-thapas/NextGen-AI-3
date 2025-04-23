import { json } from '@sveltejs/kit';
import { type } from 'arktype';

import { getAnnouncements } from '$lib/server/db/prepared-statements/announcements';

import type { RequestHandler } from './$types';
import { Options, type AnnouncementsResponse } from './schema';

export const GET: RequestHandler = async ({ url }) => {
	const options = Options({
		offset: url.searchParams.get('offset'),
		limit: url.searchParams.get('limit')
	});

	if (options instanceof type.errors) {
		return json(
			{
				messages: options.summary.split('\n'),
				errors: options.toJSON()
			},
			{ status: 422 }
		);
	}

	options.limit++;
	const announcements = await getAnnouncements.execute(options);
	const moreAnnouncementsAvailable = announcements.length === options.limit;

	if (moreAnnouncementsAvailable) announcements.pop();

	return json({ announcements, moreAnnouncementsAvailable });
};
