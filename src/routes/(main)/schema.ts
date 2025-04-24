import { type } from 'arktype';
import { z } from 'zod';

export const createAnnouncementFormSchema = z.object({
	title: z.string().min(1, 'Title is required'),
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
			'File must be a .zip, .7zip or .rar file'
		)
});

export type CreateAnnouncementFormSchema = typeof createAnnouncementFormSchema;

export const Options = type({
	announcementsCount: type('string.integer.parse')
		.to('number > 0')
		.or(type.null.pipe(() => 3))
		.or(type.undefined.pipe(() => 3))
		.default('3')
});
