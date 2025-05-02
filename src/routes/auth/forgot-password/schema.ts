import { z } from 'zod';

export const formSchema = z.object({
	email: z.string().email('Email must be a valid email address')
});

export type FormSchema = typeof formSchema;
