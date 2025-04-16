export const configConstants = {
	entropy: {
		id: 96,
		token: 256
	},
	users: {
		maxEmailLength: 255,
		minPasswordLength: 8,
		maxPrefixLength: 63,
		maxNameLength: 255,
		maxFirstNameLength: 127,
		maxLastNameLength: 127,
		maxNicknameLength: 63,
		phoneNumberLength: 10,
		maxSchoolNameLength: 255,
		maxAddressProvinceLength: 255,
		maxAddressDistrictLength: 255,
		maxAddressSubDistrictLength: 255,
		postcodeLength: 5,
		maxAddressDetailLength: 1023,
		emailCooldown: 900, // seconds
		verificationTimeout: 900, // seconds: from email sent to clicking button
		verificationTimeoutGracePeriod: 300 // seconds: from email sent to password submit
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
