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
		registrationUpdateProfileTimeout: 3600, // seconds: from email sent to profile update
		passwordResetLinkTimeout: 900, // seconds: from email sent to clicking button
		passwordResetResetTimeout: 1200 // seconds: from email sent to password submit
	},
	sessions: {
		tokenEntropy: 256
	},
	exams: {
		maxTitleLength: 1024,
		maxDescriptionLength: 65536,
		timeSyncInterval: 30_000, // milliseconds
		timeSyncLatencyLimit: 5000, // milliseconds
		timeSyncProcDelayLimit: 1000 // milliseconds
	},
	questions: {
		defaultTextAnswerLengthLimit: 65536,
		defaultFileSizeLimit: 100_000, // kB
		defaultDefaultScore: 0,
		defaultMinScore: 0,
		defaultMaxScore: 1,
		defaultScoringType: 'exact'
	},
	announcements: {
		maxTitleLength: 1024
	},
	assets: {
		enableImageOptimization: false
	}
} as const;
