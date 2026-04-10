import { z } from 'zod';

import { configConstants } from '$lib/config-constants';

export const formSchema = z.object({
	next: z.string(),
	email: z.string().email(),
	prefix: z
		.string()
		.min(1, 'Prefix is required')
		.max(
			configConstants.users.maxPrefixLength,
			`Prefix must be at most ${configConstants.users.maxPrefixLength} characters long`
		),
	name: z
		.string()
		.min(1, 'Name is required')
		.max(
			configConstants.users.maxNameLength,
			`Name must be at most ${configConstants.users.maxNameLength} characters long`
		),
	nickname: z
		.string()
		.min(1, 'Nickname is required')
		.max(
			configConstants.users.maxNicknameLength,
			`Nickname must be at most ${configConstants.users.maxNicknameLength} characters long`
		),
	phoneNumber: z
		.string()
		.length(
			configConstants.users.phoneNumberLength,
			`Phone number must be ${configConstants.users.phoneNumberLength} characters long`
		)
		.regex(/^[0-9]{10}$/, 'Phone number must be a 10 digits number'),
	schoolName: z
		.string()
		.min(1, 'School name is required')
		.max(
			configConstants.users.maxSchoolNameLength,
			`School name must be at most ${configConstants.users.maxSchoolNameLength} characters long`
		),
	grade: z.string().length(1, 'Grade is required'),
	transcript: z
		.instanceof(File, { message: 'Please upload a file' })
		.refine((f) => f.size < 10_000_000, 'File must be smaller than 10 MB')
		.refine((f) => f.type === 'application/pdf', 'File must be a pdf file'),
	addressProvince: z
		.string()
		.min(1, 'Province is required')
		.max(
			configConstants.users.maxAddressProvinceLength,
			`Province must be at most ${configConstants.users.maxAddressProvinceLength} characters long`
		),
	addressDistrict: z
		.string()
		.min(1, 'District is required')
		.max(
			configConstants.users.maxAddressDistrictLength,
			`District must be at most ${configConstants.users.maxAddressDistrictLength} characters long`
		),
	addressSubDistrict: z
		.string()
		.min(1, 'Sub-district is required')
		.max(
			configConstants.users.maxAddressSubDistrictLength,
			`Sub-district must be at most ${configConstants.users.maxAddressSubDistrictLength} characters long`
		),
	addressPostcode: z
		.string()
		.length(
			configConstants.users.postcodeLength,
			`Postcode must be ${configConstants.users.postcodeLength} characters long`
		)
		.regex(/^[0-9]{5}$/, 'Postcode must be a 5 digits number'),
	addressDetail: z
		.string()
		.min(1, 'Detail is required')
		.max(
			configConstants.users.maxAddressDetailLength,
			`Detail must be at most ${configConstants.users.maxAddressDetailLength} characters long`
		)
});

export type FormSchema = typeof formSchema;
