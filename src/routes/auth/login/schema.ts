import { z } from 'zod';

export const formSchema = z.object({
	next: z.string(),
	email: z.string().email('Email must be a valid email address'),
	password: z.string().min(1, 'Password is required')
});

export type FormSchema = typeof formSchema;
