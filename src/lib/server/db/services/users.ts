/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { count, eq, sql } from 'drizzle-orm';

import { roles } from '$lib/enums';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { suidToUuid } from '$lib/server/db/suid';

const createUserQuery = db
	.insert(users)
	.values({
		role: sql.placeholder('role'),
		email: sql.placeholder('email'),
		registered: false
	})
	.prepare('create_user');

const createUserReturningQuery = db
	.insert(users)
	.values({
		role: sql.placeholder('role'),
		email: sql.placeholder('email'),
		registered: false
	})
	.returning()
	.prepare('create_user');

const getUserQuery = db.query.users
	.findFirst({ where: eq(users.id, sql.placeholder('id')) })
	.prepare('get_user');

const getUserByEmailQuery = db.query.users
	.findFirst({
		where: eq(users.email, sql.placeholder('email'))
	})
	.prepare('get_user_by_email');

const getStudentCountQuery = db
	.select({ count: count() })
	.from(users)
	.where(eq(users.role, roles.student))
	.prepare('get_student_count');

const updateUserProfileQuery = db
	.update(users)
	.set({
		prefix: sql.placeholder('prefix'),
		name: sql.placeholder('name'),
		nickname: sql.placeholder('nickname'),
		phoneNumber: sql.placeholder('phoneNumber'),
		schoolName: sql.placeholder('schoolName'),
		grade: sql.placeholder('grade'),
		addressProvince: sql.placeholder('addressProvince'),
		addressDistrict: sql.placeholder('addressDistrict'),
		addressSubDistrict: sql.placeholder('addressSubDistrict'),
		addressPostcode: sql.placeholder('addressPostcode'),
		addressDetail: sql.placeholder('addressDetail'),
		updatedAt: sql`now()`
	})
	.where(eq(users.id, sql.placeholder('id')))
	.prepare('update_user_profile');

const updateUserProfileWithTranscriptQuery = db
	.update(users)
	.set({
		prefix: sql.placeholder('prefix'),
		name: sql.placeholder('name'),
		nickname: sql.placeholder('nickname'),
		phoneNumber: sql.placeholder('phoneNumber'),
		schoolName: sql.placeholder('schoolName'),
		grade: sql.placeholder('grade'),
		transcriptId: sql.placeholder('transcriptId'),
		addressProvince: sql.placeholder('addressProvince'),
		addressDistrict: sql.placeholder('addressDistrict'),
		addressSubDistrict: sql.placeholder('addressSubDistrict'),
		addressPostcode: sql.placeholder('addressPostcode'),
		addressDetail: sql.placeholder('addressDetail'),
		updatedAt: sql`now()`
	})
	.where(eq(users.id, sql.placeholder('id')))
	.prepare('update_user_profile_with_transcript');

const updateUserProfileRegistrationCompleteQuery = db
	.update(users)
	.set({
		registered: true,
		prefix: sql.placeholder('prefix'),
		name: sql.placeholder('name'),
		nickname: sql.placeholder('nickname'),
		phoneNumber: sql.placeholder('phoneNumber'),
		schoolName: sql.placeholder('schoolName'),
		grade: sql.placeholder('grade'),
		transcriptId: sql.placeholder('transcriptId'),
		addressProvince: sql.placeholder('addressProvince'),
		addressDistrict: sql.placeholder('addressDistrict'),
		addressSubDistrict: sql.placeholder('addressSubDistrict'),
		addressPostcode: sql.placeholder('addressPostcode'),
		addressDetail: sql.placeholder('addressDetail'),
		updatedAt: sql`now()`
	})
	.where(eq(users.id, sql.placeholder('id')))
	.prepare('update_user_profile_registration_complete');

export async function createUser(role: string, email: string) {
	return createUserQuery.execute({ role, email });
}

export async function createUserReturning(role: string, email: string) {
	return (await createUserReturningQuery.execute({ role, email }))[0];
}

export async function getUser(id: string) {
	id = suidToUuid(id);
	return getUserQuery.execute({ id });
}

export async function getUserByEmail(email: string) {
	return getUserByEmailQuery.execute({ email });
}

export async function getStudentcount() {
	return (await getStudentCountQuery.execute())[0].count;
}

export async function updateUserProfile(data: {
	id: string;
	prefix: string;
	name: string;
	nickname: string;
	phoneNumber: string;
	schoolName: string;
	grade: string;
	addressProvince: string;
	addressDistrict: string;
	addressSubDistrict: string;
	addressPostcode: string;
	addressDetail: string;
}) {
	data.id = suidToUuid(data.id);
	return updateUserProfileQuery.execute(data);
}

export async function updateUserProfileWithTranscript(data: {
	id: string;
	prefix: string;
	name: string;
	nickname: string;
	phoneNumber: string;
	schoolName: string;
	grade: string;
	transcriptId: string;
	addressProvince: string;
	addressDistrict: string;
	addressSubDistrict: string;
	addressPostcode: string;
	addressDetail: string;
}) {
	data.id = suidToUuid(data.id);
	return updateUserProfileWithTranscriptQuery.execute(data);
}

export async function updateUserProfileRegistrationComplete(data: {
	id: string;
	prefix: string;
	name: string;
	nickname: string;
	phoneNumber: string;
	schoolName: string;
	grade: string;
	transcriptId: string;
	addressProvince: string;
	addressDistrict: string;
	addressSubDistrict: string;
	addressPostcode: string;
	addressDetail: string;
}) {
	data.id = suidToUuid(data.id);
	return updateUserProfileRegistrationCompleteQuery.execute(data);
}
