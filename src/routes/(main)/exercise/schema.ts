import { z } from 'zod';

import { configConstants } from '$lib/config-constants';

export const formSchema = z
	.object({
		title: z
			.string()
			.min(1, 'Title is required')
			.max(
				configConstants.exams.maxTitleLength,
				`Title must be at most ${configConstants.exams.maxTitleLength} characters long`
			),
		description: z
			.string()
			.min(1, 'Description is required')
			.max(
				configConstants.exams.maxDescriptionLength,
				`Description must be at most ${configConstants.exams.maxDescriptionLength} characters long`
			),
		openAt: z.string().refine((v) => !isNaN(Date.parse(v)), 'Open at must be a valid datetime'),
		closeAt: z.string().refine((v) => !isNaN(Date.parse(v)), 'Close at must be a valid datetime'),
		timeLimit: z
			.string()
			.min(1, 'Time limit is required')
			.refine((v) => !isNaN(Number(v)), 'Time limit must be a valid number'),
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
	})
	.superRefine(({ openAt, closeAt }, checkCloseAtAfterOpenAt) => {
		if (new Date(openAt) > new Date(closeAt)) {
			checkCloseAtAfterOpenAt.addIssue({
				code: 'custom',
				path: ['closeAt'],
				message: 'Close at must not come before opent at'
			});
		}
	});

export type FormSchema = typeof formSchema;
