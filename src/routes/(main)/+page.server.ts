import {
	countAnnouncements,
	getAnnouncements
} from '$lib/server/db/prepared-statements/announcements';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		announcements: await getAnnouncements.execute({ limit: '3', offset: '0' }),
		moreAnnouncementsAvailable: (await countAnnouncements.execute())[0].count > 3
	};
};
