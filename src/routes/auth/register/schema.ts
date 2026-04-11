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
		)
		.regex(
			/^[ a-zA-Z\u0E01-\u0E2E\u0E30-\u0E39\u0E40-\u0E4C]*$/,
			'Name must only contain English or Thai characters'
		)
		.refine((val) => !/^ /.test(val) && !/ $/.test(val), {
			message: 'Name must not contain space at beginning or end'
		}),
	nickname: z
		.string()
		.min(1, 'Nickname is required')
		.max(
			configConstants.users.maxNicknameLength,
			`Nickname must be at most ${configConstants.users.maxNicknameLength} characters long`
		)
		.regex(
			/^[ a-zA-Z\u0E01-\u0E2E\u0E30-\u0E39\u0E40-\u0E4C]*$/,
			'Nickname must only contain English or Thai characters'
		)
		.refine((val) => !/^ /.test(val) && !/ $/.test(val), {
			message: 'Nickname must not contain space at beginning or end'
		}),
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
		)
		.regex(
			/^[ a-zA-Z\u0E01-\u0E2E\u0E30-\u0E39\u0E40-\u0E4C]*$/,
			'School name must only contain English or Thai characters'
		)
		.refine((val) => !/^ /.test(val) && !/ $/.test(val), {
			message: 'School name must not contain space at beginning or end'
		}),
	grade: z.string().min(1, 'Education is required'),
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
		)
		.regex(
			/^[a-zA-Z\u0E01-\u0E2E\u0E30-\u0E39\u0E40-\u0E4C]*$/,
			'Province must only contain English or Thai characters'
		),
	addressDistrict: z
		.string()
		.min(1, 'District is required')
		.max(
			configConstants.users.maxAddressDistrictLength,
			`District must be at most ${configConstants.users.maxAddressDistrictLength} characters long`
		)
		.regex(
			/^[a-zA-Z\u0E01-\u0E2E\u0E30-\u0E39\u0E40-\u0E4C]*$/,
			'Distric must only contain English or Thai characters'
		),
	addressSubDistrict: z
		.string()
		.min(1, 'Sub-district is required')
		.max(
			configConstants.users.maxAddressSubDistrictLength,
			`Sub-district must be at most ${configConstants.users.maxAddressSubDistrictLength} characters long`
		)
		.regex(
			/^[a-zA-Z\u0E01-\u0E2E\u0E30-\u0E39\u0E40-\u0E4C]*$/,
			'Sub-district must only contain English or Thai characters'
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
		.regex(
			/^[ 0-9a-zA-Z\u0E01-\u0E2E\u0E30-\u0E39\u0E40-\u0E4C]*$/,
			'Detail must only contain English or Thai characters or numbers'
		)
		.refine((val) => !/^ /.test(val) && !/ $/.test(val), {
			message: 'Detail must not contain space at beginning or end'
		})
});

export type FormSchema = typeof formSchema;
