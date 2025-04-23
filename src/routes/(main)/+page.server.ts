import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import type { Announcement } from '$lib/converters/announcement';
import { getAnnouncements } from '$lib/server/db/prepared-statements/announcements';

import type { PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async () => {
	async function getAnnouncementsData(): Promise<{
		announcements: Announcement[];
		moreAnnouncementsAvailable: boolean;
	}> {
		const announcements = await getAnnouncements.execute({ limit: '4', offset: '0' });
		const moreAnnouncementsAvailable = announcements.length === 4;
		if (moreAnnouncementsAvailable) announcements.pop();
		return { announcements, moreAnnouncementsAvailable };
	}

	return { ...(await getAnnouncementsData()), form: await superValidate(zod(formSchema)) };
};
