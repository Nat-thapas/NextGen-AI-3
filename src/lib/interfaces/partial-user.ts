export class OwnUser {
	id: string;
	email: string;
	role: 'registrant' | 'student' | 'staff' | 'teacher' | 'admin' | 'superadmin';
	verified: boolean;
	prefix: string | null;
	name: string | null;
	nickname: string | null;
	phoneNumber: string | null;
	schoolName: string | null;
	grade: number | null;
	isTranscriptAvailable: boolean;
	addressProvince: string | null;
	addressDistrict: string | null;
	addressSubDistrict: string | null;
	addressPostcode: string | null;
	addressDetail: string | null;
	createdAt: Date;
	updatedAt: Date;

	constructor(user: OwnUser) {
		this.id = user.id;
		this.email = user.email;
		this.role = user.role;
		this.verified = user.verified;
		this.prefix = user.prefix;
		this.name = user.name;
		this.nickname = user.nickname;
		this.phoneNumber = user.phoneNumber;
		this.schoolName = user.schoolName;
		this.grade = user.grade;
		this.isTranscriptAvailable = user.isTranscriptAvailable;
		this.addressProvince = user.addressProvince;
		this.addressDistrict = user.addressDistrict;
		this.addressSubDistrict = user.addressSubDistrict;
		this.addressPostcode = user.addressPostcode;
		this.addressDetail = user.addressDetail;
		this.createdAt = user.createdAt;
		this.updatedAt = user.updatedAt;
	}
}

export class OtherUser {
	id: string;
	prefix: string | null;
	name: string | null;
	nickname: string | null;

	constructor(user: OtherUser) {
		this.id = user.id;
		this.prefix = user.prefix;
		this.name = user.name;
		this.nickname = user.nickname;
	}
}
