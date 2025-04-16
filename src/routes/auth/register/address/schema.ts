import { z } from 'zod';

import { configConstants } from '$lib/config-constants';

export const formSchema = z.object({
	token: z.string().min(1, 'Token is required'),
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
		.regex(/[0-9]{5}/, 'Postcode must be a 5 digits number'),
	addressDetail: z
		.string()
		.min(1, 'Detail is required')
		.max(
			configConstants.users.maxAddressDetailLength,
			`Detail must be at most ${configConstants.users.maxAddressDetailLength} characters long`
		)
});

export type FormSchema = typeof formSchema;
