export interface User {
	id: string;
	email: string;
	hashedPassword: string | null;
	role: 'registrant' | 'student' | 'staff' | 'teacher' | 'admin' | 'superadmin';
	registrationComplete: boolean;
	verificationToken: string | null;
	verificationTokenGeneratedAt: Date;
	passwordResetToken: string | null;
	passwordResetTokenGeneratedAt: Date;
	lastEmailSentAt: Date;
	prefix: string | null;
	name: string | null;
	nickname: string | null;
	phoneNumber: string | null;
	schoolName: string | null;
	grade: number | null;
	transcriptId: string | null;
	addressProvince: string | null;
	addressDistrict: string | null;
	addressSubDistrict: string | null;
	addressPostcode: string | null;
	addressDetail: string | null;
	createdAt: Date;
	updatedAt: Date;
}
