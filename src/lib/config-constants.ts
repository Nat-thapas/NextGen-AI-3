export const configConstants = {
	users: {
		maxEmailLength: 255,
		maxPrefixLength: 63,
		maxNameLength: 255,
		maxNicknameLength: 63,
		phoneNumberLength: 10,
		maxSchoolNameLength: 255,
		maxAddressProvinceLength: 255,
		maxAddressDistrictLength: 255,
		maxAddressSubDistrictLength: 255,
		postcodeLength: 5,
		maxAddressDetailLength: 1023
	},
	exams: {
		maxTitleLength: 255,
		maxDescriptionLength: 65535,
		defaultGracePeriod: 15 // seconds
	},
	questions: {
		defaultTextAnswerLengthLimit: 1024,
		defaultFileSizeLimit: 25, // MB
		defaultMaxScore: 1,
		defaultMinScore: 0
	}
} as const;
