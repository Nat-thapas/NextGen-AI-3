import { z } from 'zod';

import { configConstants } from '$lib/config-constants';

export const createAnnouncementFormSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(
			configConstants.announcements.maxTitleLength,
			`Title must be at most ${configConstants.announcements.maxTitleLength} characters long`
		),
	file: z
		.instanceof(File, { message: 'Please upload a file' })
		.refine(
			(f) =>
				[
					'application/zip',
					'application/zip-compressed',
					'application/x-zip-compressed',
					'multipart/x-zip'
				].includes(f.type),
			'File must be a .zip file'
		)
});

export type CreateAnnouncementFormSchema = typeof createAnnouncementFormSchema;
