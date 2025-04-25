import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { roles } from '$lib/enums';
import { getErrorMessage } from '$lib/error';
import type { Announcement } from '$lib/interfaces/announcement';
import { isRoleAtLeast } from '$lib/roles';
import { getAnnouncements } from '$lib/server/db/services/announcements';
import { importAnnouncement } from '$lib/server/file-import/announcement';

import type { Actions, PageServerLoad } from './$types';
import { createAnnouncementFormSchema, Options } from './schema';

export const load: PageServerLoad = async ({ url }) => {
	async function getAnnouncementsData(announcementsCount: number): Promise<{
		announcements: Announcement[];
		moreAnnouncementsAvailable: boolean;
	}> {
		announcementsCount++;
		const announcements = await getAnnouncements(announcementsCount);
		const moreAnnouncementsAvailable = announcements.length === announcementsCount;
		if (moreAnnouncementsAvailable) announcements.pop();
		return { announcements, moreAnnouncementsAvailable };
	}

	const options = Options({
		announcementsCount: url.searchParams.get('announcements-count')
	});

	if (options instanceof type.errors) {
		error(400, {
			message: options.summary
		});
	}

	return {
		...(await getAnnouncementsData(options.announcementsCount)),
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

		if (!isRoleAtLeast(user.role, roles.teacher)) {
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
