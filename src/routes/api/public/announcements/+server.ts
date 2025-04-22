import { json } from '@sveltejs/kit';
import { type } from 'arktype';

import {
	countAnnouncements,
	getAnnouncements
} from '$lib/server/db/prepared-statements/announcements';

import type { RequestHandler } from './$types';
import { Options } from './schema';

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

	return json({
		announcements: await getAnnouncements.execute(options),
		moreAnnouncementsAvailable:
			(await countAnnouncements.execute())[0].count > +options.offset + +options.limit
	});
};
