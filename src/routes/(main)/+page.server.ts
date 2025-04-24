import { error } from '@sveltejs/kit';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import type { Announcement } from '$lib/converters/announcement';
import { getErrorMessage } from '$lib/error';
import { isRoleAtLeast } from '$lib/roles';
import { getAnnouncements } from '$lib/server/db/services/announcements';
import { importAnnouncement } from '$lib/server/file-import/announcement';

import type { Actions, PageServerLoad } from './$types';
import { createAnnouncementFormSchema } from './schema';

export const load: PageServerLoad = async () => {
	async function getAnnouncementsData(): Promise<{
		announcements: Announcement[];
		moreAnnouncementsAvailable: boolean;
	}> {
		const announcements = await getAnnouncements({ limit: 4, offset: 0 });
		const moreAnnouncementsAvailable = announcements.length === 4;
		if (moreAnnouncementsAvailable) announcements.pop();
		return { announcements, moreAnnouncementsAvailable };
	}

	return {
		...(await getAnnouncementsData()),
		createAnnouncementForm: await superValidate(zod(createAnnouncementFormSchema))
	};
};

export const actions: Actions = {
	'create-announcement': async (event) => {
		const form = await superValidate(event.request, zod(createAnnouncementFormSchema));
		if (!form.valid) return fail(400, { form });

		const user = event.locals.user;

		if (!user) {
			error(401, {
				message: 'You have to be logged in to access this page'
			});
		}

		if (!isRoleAtLeast(user.role, 'teacher')) {
			error(403, {
				message: 'You do not have access to this page'
			});
		}

		try {
			await importAnnouncement(user.id, form.data.title, form.data.file);
		} catch (err) {
			return message(form, {
				type: 'error',
				text: getErrorMessage(err)
			});
		}

		return message(form, {
			type: 'success',
			text: 'Announcement created successfully'
		});
	}
};
