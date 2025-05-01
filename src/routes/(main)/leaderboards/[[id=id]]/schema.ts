import { z } from 'zod';

export const createLeaderboardFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	exams: z.string().array().min(1, 'At least 1 exam is required'),
	order: z
		.string()
		.min(1, 'Order is required')
		.regex(/^[0-9]{1,15}$/, 'Order must be an integer')
});

export type CreateLeaderboardFormSchema = typeof createLeaderboardFormSchema;

export const updateLeaderboardFormSchema = z.object({
	id: z.string(),
	name: z.string().min(1, 'Name is required'),
	exams: z.string().array().min(1, 'At least 1 exam is required'),
	order: z
		.string()
		.min(1, 'Order is required')
		.regex(/^[0-9]{1,15}$/, 'Order must be an integer')
});

export type UpdateLeaderboardFormSchema = typeof updateLeaderboardFormSchema;

export const deleteLeaderboardFormSchema = z.object({
	id: z.string()
});

export type DeleteLeaderboardFormSchema = typeof deleteLeaderboardFormSchema;
