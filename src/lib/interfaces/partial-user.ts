import type { Role } from '$lib/roles';

export interface OwnUser {
	id: string;
	role: Role;
	email: string;
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

export interface OwnUserPartial {
	id: string;
	role: Role;
	email: string;
}

export function convertOwnUser(user: OwnUser): OwnUser {
	return {
		id: user.id,
		role: user.role,
		email: user.email,
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

export function convertOwnUserPartial(user: OwnUserPartial): OwnUserPartial {
	return {
		id: user.id,
		role: user.role,
		email: user.email
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
