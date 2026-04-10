import { base } from '$app/paths';

export const configConstants = {
	auth: {
		oauth: {
			nonce: {
				entropy: 256
			},
			state: {
				randomEntropy: 256
			}
		}
	},
	cookie: {
		options: {
			httpOnly: true,
			secure: true,
			path: `${base}/`,
			sameSite: 'lax',
			priority: 'high',
			maxAge: 60 * 60 * 24 * 365 * 10
		}
	},
	forms: {
		delay: 100, // milliseconds
		timeout: 5000, // milliseconds
		longTimeout: 10000 // milliseconds
	},
	users: {
		maxEmailLength: 256,
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
		maxAddressDetailLength: 1024
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
