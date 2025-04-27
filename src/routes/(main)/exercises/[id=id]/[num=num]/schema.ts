import { z } from 'zod';

export const choicesSchema = z.object({
	next: z.string(),
	answer: z
		.string()
		.refine((v) => /[0-9]{1,15}/.test(v), 'Choice must be a valid number')
		.optional()
});

export const checkboxesSchema = z.object({
	next: z.string(),
	answer: z
		.string()
		.refine((v) => /[0-9]{1,15}/.test(v), 'Choices must be a valid array of number')
		.array()
		.optional()
});
