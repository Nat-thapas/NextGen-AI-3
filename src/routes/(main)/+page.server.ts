import { getAnnouncements } from '$lib/server/db/prepared-statements/announcements';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const announcements = await getAnnouncements.execute({ limit: '4', offset: '0' });
	const moreAnnouncementsAvailable = announcements.length === 4;
	if (moreAnnouncementsAvailable) announcements.pop();

	return { announcements, moreAnnouncementsAvailable };
};
