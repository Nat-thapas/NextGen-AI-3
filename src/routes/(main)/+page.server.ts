import { error } from '@sveltejs/kit';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { roles } from '$lib/enums';
import { getErrorMessage } from '$lib/error';
import { isRoleAtLeast } from '$lib/roles';
import { getAnnouncements } from '$lib/server/db/services/announcements';
import { importAnnouncement } from '$lib/server/file-import/announcement';

import type { Actions, PageServerLoad } from './$types';
import { createAnnouncementFormSchema } from './schema';

export const load: PageServerLoad = async ({ url }) => {
	let announcementsCount: number | string = url.searchParams.get('announcements-count') ?? '3';

	if (!/^[0-9]{1,15}$/.test(announcementsCount)) {
		error(400, {
			message: 'Invalid announcements-count'
		});
	}

	announcementsCount = Number(announcementsCount);

	announcementsCount++;
	const announcements = await getAnnouncements(announcementsCount);
	const moreAnnouncementsAvailable = announcements.length === announcementsCount;
	if (moreAnnouncementsAvailable) announcements.pop();

	return {
		createAnnouncementForm: await superValidate(zod(createAnnouncementFormSchema)),
		announcements,
		moreAnnouncementsAvailable
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
			return message(
				form,
				{
					type: 'error',
					text: getErrorMessage(err)
				},
				{
					status: 500
				}
			);
		}

		return message(form, {
			type: 'success',
			text: 'Announcement created successfully'
		});
	}
};
