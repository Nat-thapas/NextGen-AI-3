export interface OwnUser {
	id: string;
	email: string;
	role: 'registrant' | 'student' | 'staff' | 'teacher' | 'admin' | 'superadmin';
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

export function convertOwnUser(user: OwnUser): OwnUser {
	return {
		id: user.id,
		email: user.email,
		role: user.role,
		prefix: user.prefix,
		name: user.name,
		nickname: user.nickname,
		phoneNumber: user.phoneNumber,
		schoolName: user.schoolName,
		grade: user.grade,
		transcriptId: user.transcriptId,
		addressProvince: user.addressProvince,
		addressDistrict: user.addressDistrict,
		addressSubDistrict: user.addressSubDistrict,
		addressPostcode: user.addressPostcode,
		addressDetail: user.addressDetail,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	};
}

export interface OtherUser {
	id: string;
	prefix: string | null;
	name: string | null;
	nickname: string | null;
}

export function ConvertOtherUser(user: OtherUser): OtherUser {
	return {
		id: user.id,
		prefix: user.prefix,
		name: user.name,
		nickname: user.nickname
	};
}
