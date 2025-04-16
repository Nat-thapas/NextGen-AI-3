export interface User {
	id: string;
	email: string;
	hashedPassword: string | null;
	role: 'registrant' | 'student' | 'staff' | 'teacher' | 'admin' | 'superadmin';
	verified: boolean;
	verificationToken: string | null;
	verificationTokenGeneratedAt: Date;
	passwordResetToken: string | null;
	passwordResetTokenGeneratedAt: Date;
	lastEmailSentAt: Date;
	prefix: 'เด็กชาย' | 'เด็กหญิง' | 'นาย' | 'นางสาว' | null;
	name: string | null;
	nickname: string | null;
	phone: string | null;
	school: string | null;
	addressProvince: string | null;
	addressDistrict: string | null;
	addressSubDistrict: string | null;
	addressPostcode: string | null;
	addressDetail: string | null;
	createdAt: Date;
	updatedAt: Date;
}
