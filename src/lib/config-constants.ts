export const configConstants = {
	forms: {
		delay: 100, // milliseconds
		timeout: 5000, // milliseconds
		longTimeout: 10000 // milliseconds
	},
	users: {
		maxEmailLength: 256,
		minPasswordLength: 8,
		maxPrefixLength: 64,
		maxNameLength: 256,
		maxFirstNameLength: 128,
		maxLastNameLength: 128,
		maxNicknameLength: 64,
		phoneNumberLength: 10,
		maxSchoolNameLength: 256,
		maxAddressProvinceLength: 256,
		maxAddressDistrictLength: 256,
		maxAddressSubDistrictLength: 256,
		postcodeLength: 5,
		maxAddressDetailLength: 1024,
		emailCooldown: 900, // seconds
		registrationLinkTimeout: 900, // seconds: from email sent to clicking button
		registrationSetPasswordTimeout: 1200, // seconds: from email sent to password submit
		registrationUpdateProfileTimeout: 3600 // seconds: from email sent to profile update
	},
	sessions: {
		tokenEntropy: 256
	},
	exams: {
		maxTitleLength: 1024,
		maxDescriptionLength: 65536
	},
	questions: {
		defaultTextAnswerLengthLimit: 65536,
		defaultFileSizeLimit: 100_000, // kB
		defaultMaxScore: 1,
		defaultMinScore: 0
	},
	announcements: {
		maxTitleLength: 1024
	}
} as const;
