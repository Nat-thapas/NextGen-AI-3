import { z } from 'zod';

import { configConstants } from '$lib/config-constants';

export const formSchema = z.object({
	token: z.string().min(1, 'Token is required'),
	prefix: z.enum(['เด็กชาย', 'เด็กหญิง', 'นาย', 'นางสาว']),
	firstName: z
		.string()
		.min(1, 'First name is required')
		.max(
			configConstants.users.maxFirstNameLength,
			`First name must be at most ${configConstants.users.maxFirstNameLength} characters long`
		),
	lastName: z
		.string()
		.min(1, 'Last name is required')
		.max(
			configConstants.users.maxLastNameLength,
			`Last name must be at most ${configConstants.users.maxLastNameLength} characters long`
		),
	phoneNumber: z
		.string()
		.length(
			configConstants.users.phoneNumberLength,
			`Phone number must be ${configConstants.users.phoneNumberLength} characters long`
		)
		.regex(/[0-9]{10}/, 'Phone number must be a 10 digits number'),
	schoolName: z
		.string()
		.min(1, 'School name is required')
		.max(
			configConstants.users.maxSchoolNameLength,
			`School name must be at most ${configConstants.users.maxSchoolNameLength} characters long`
		)
});

export type FormSchema = typeof formSchema;
